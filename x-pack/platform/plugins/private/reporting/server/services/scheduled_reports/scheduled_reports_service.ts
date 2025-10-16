/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type {
  AuditLogger,
  IClusterClient,
  KibanaRequest,
  KibanaResponseFactory,
  Logger,
  SavedObject,
  SavedObjectsBulkDeleteStatus,
  SavedObjectsClientContract,
  SavedObjectsUpdateResponse,
} from '@kbn/core/server';
import { REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY } from '@kbn/reporting-server';
import type { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import type { TaskManagerStartContract } from '@kbn/task-manager-plugin/server';
import { groupBy } from 'lodash';
import type { SetRequired } from 'type-fest';
import type { ReportingCore } from '../..';
import type { ListScheduledReportApiJSON, ReportingUser, ScheduledReportType } from '../../types';
import { SCHEDULED_REPORT_SAVED_OBJECT_TYPE } from '../../saved_objects';
import type { ScheduledReportAuditEventParams } from '../audit_events/audit_events';
import {
  ScheduledReportAuditAction,
  scheduledReportAuditEvent,
} from '../audit_events/audit_events';
import { DEFAULT_SCHEDULED_REPORT_LIST_SIZE } from './constants';
import { transformBulkActionResponse, transformListResponse } from './transforms';
import type { BulkOperationError } from './types';

const SCHEDULED_REPORT_ID_FIELD = 'scheduled_report_id';
const CREATED_AT_FIELD = 'created_at';

interface ListScheduledReportsApiResponse {
  page: number;
  per_page: number;
  total: number;
  data: ListScheduledReportApiJSON[];
}

interface BulkDisableResult {
  scheduled_report_ids: string[];
  errors: BulkOperationError[];
  total: number;
}

interface BulkDeleteResult {
  scheduled_report_ids: string[];
  errors: BulkOperationError[];
  total: number;
}

export type CreatedAtSearchResponse = SearchResponse<{ created_at: string }>;

export class ScheduledReportsService {
  constructor(
    private auditLogger: AuditLogger,
    private userCanManageReporting: Boolean,
    private esClient: IClusterClient,
    private logger: Logger,
    private responseFactory: KibanaResponseFactory,
    private savedObjectsClient: SavedObjectsClientContract,
    private taskManager: TaskManagerStartContract
  ) {}

  static async build({
    logger,
    reportingCore,
    responseFactory,
    request,
  }: {
    logger: Logger;
    reportingCore: ReportingCore;
    responseFactory: KibanaResponseFactory;
    request: KibanaRequest;
  }) {
    const esClient = await reportingCore.getEsClient();
    const auditLogger = await reportingCore.getAuditLogger(request);
    const savedObjectsClient = await reportingCore.getScopedSoClient(request);
    const taskManager = await reportingCore.getTaskManager();
    const userCanManageReporting = await reportingCore.canManageReportingForSpace(request);

    return new ScheduledReportsService(
      auditLogger,
      userCanManageReporting,
      esClient,
      logger,
      responseFactory,
      savedObjectsClient,
      taskManager
    );
  }

  public async list({
    user,
    page = 1,
    size = DEFAULT_SCHEDULED_REPORT_LIST_SIZE,
  }: {
    user: ReportingUser;
    page: number;
    size: number;
  }): Promise<ListScheduledReportsApiResponse> {
    try {
      const username = this.getUsername(user);

      const response = await this.savedObjectsClient.find<ScheduledReportType>({
        type: SCHEDULED_REPORT_SAVED_OBJECT_TYPE,
        page,
        perPage: size,
        ...(!this.userCanManageReporting
          ? { filter: `scheduled_report.attributes.createdBy: "${username}"` }
          : {}),
      });

      if (!response) {
        return this.getEmptyListApiResponse(page, size);
      }

      const scheduledReportIdsAndName = response?.saved_objects.map((so) => ({
        id: so.id,
        name: so.attributes.title,
      }));

      if (!scheduledReportIdsAndName || scheduledReportIdsAndName.length === 0) {
        return this.getEmptyListApiResponse(page, size);
      }

      scheduledReportIdsAndName.forEach(({ id, name }) =>
        this.auditLog({ action: ScheduledReportAuditAction.LIST, id, name })
      );

      const scheduledReportIds = scheduledReportIdsAndName.map(({ id }) => id);

      let lastRunResponse;
      try {
        lastRunResponse = (await this.esClient.asInternalUser.search({
          index: REPORTING_DATA_STREAM_WILDCARD_WITH_LEGACY,
          size,
          _source: [CREATED_AT_FIELD],
          sort: [{ [CREATED_AT_FIELD]: { order: 'desc' } }],
          query: {
            bool: {
              filter: [
                {
                  terms: {
                    [SCHEDULED_REPORT_ID_FIELD]: scheduledReportIds,
                  },
                },
              ],
            },
          },
          collapse: { field: SCHEDULED_REPORT_ID_FIELD },
        })) as CreatedAtSearchResponse;
      } catch (error) {
        // if no scheduled reports have run yet, we will get an error from the collapse query
        // ignore these and return an empty last run
        this.logger.warn(`Error getting last run for scheduled reports: ${error.message}`);
      }

      let nextRunResponse;
      try {
        nextRunResponse = await this.taskManager.bulkGet(scheduledReportIds);
      } catch (error) {
        // swallow this error
        this.logger.warn(`Error getting next run for scheduled reports: ${error.message}`);
      }

      return transformListResponse(this.logger, response, lastRunResponse, nextRunResponse);
    } catch (error) {
      throw this.responseFactory.customError({
        statusCode: 500,
        body: `Error listing scheduled reports: ${error.message}`,
      });
    }
  }

  public async bulkDisable({
    ids,
    user,
  }: {
    ids: string[];
    user: ReportingUser;
  }): Promise<BulkDisableResult> {
    try {
      const username = this.getUsername(user);

      const { authorizedSavedObjects, errors: authErrors } = await this.authorizeBulkAction({
        action: 'DISABLE',
        ids,
        username,
      });

      const { alreadyDisabledSchedules = [], enabledSchedules = [] } = groupBy(
        authorizedSavedObjects,
        (so) => {
          if (so.attributes.enabled === false) {
            this.logger.debug(`Scheduled report ${so.id} is already disabled`);
            return 'alreadyDisabledSchedules';
          }
          return 'enabledSchedules';
        }
      );

      if (enabledSchedules.length === 0) {
        return transformBulkActionResponse({
          scheduleIds: alreadyDisabledSchedules.map((so) => so.id),
          errors: authErrors,
        });
      }

      const { disabledSchedules, errors: disableErrors } = await this.disableSchedules(
        enabledSchedules
      );

      // It's possible that the scheduled_report saved object was disabled but
      // task disabling failed so add the list of already disabled IDs.
      // Task manager filters out disabled tasks so this will not cause extra load.
      const disableTasksResult = await this.taskManager.bulkDisable(
        [...alreadyDisabledSchedules, ...disabledSchedules].map((s) => s.id)
      );
      const taskDisableErrors: BulkOperationError[] = disableTasksResult.errors.map((error) => ({
        message: `Scheduled report disabled but task disabling failed due to: ${error.error.message}`,
        status: error.error.statusCode,
        id: error.id,
      }));

      return transformBulkActionResponse({
        scheduleIds: disableTasksResult.tasks.map((t) => t.id),
        errors: [...authErrors, ...disableErrors, ...taskDisableErrors],
      });
    } catch (error) {
      throw this.responseFactory.customError({
        statusCode: 500,
        body: `Error disabling scheduled reports: ${error.message}`,
      });
    }
  }

  private async disableSchedules(schedules: SavedObject<ScheduledReportType>[]) {
    const bulkUpdateResult = await this.savedObjectsClient.bulkUpdate<ScheduledReportType>(
      schedules.map((so) => ({
        id: so.id,
        type: so.type,
        attributes: {
          enabled: false,
        },
      }))
    );
    return bulkUpdateResult.saved_objects.reduce(
      (disableResult, so) => {
        if (so.error) {
          this.auditLog({
            action: ScheduledReportAuditAction.DISABLE,
            id: so.id,
            name: so?.attributes?.title,
            error: new Error(so.error.message),
          });
          return {
            ...disableResult,
            errors: disableResult.errors.concat({
              message: so.error.message,
              status: so.error.statusCode,
              id: so.id,
            }),
          };
        }

        return {
          ...disableResult,
          disabledSchedules: disableResult.disabledSchedules.concat(so),
        };
      },
      {
        disabledSchedules: [] as SavedObjectsUpdateResponse<ScheduledReportType>[],
        errors: [] as BulkOperationError[],
      }
    );
  }

  public async bulkDelete({
    ids,
    user,
  }: {
    ids: string[];
    user: ReportingUser;
  }): Promise<BulkDeleteResult> {
    try {
      const username = this.getUsername(user);

      const { authorizedSavedObjects, errors: authErrors } = await this.authorizeBulkAction({
        action: 'DELETE',
        ids,
        username,
      });

      if (authorizedSavedObjects.length === 0) {
        return transformBulkActionResponse({
          scheduleIds: [],
          errors: authErrors,
        });
      }

      const { deletedScheduleIds, errors: deleteErrors } = await this.deleteSchedules(
        authorizedSavedObjects
      );

      const removeTasksResult = await this.taskManager.bulkRemove(deletedScheduleIds);
      const { removedTasks = [], erroredTasks = [] } = groupBy(
        removeTasksResult.statuses,
        (status) => (status.error ? 'erroredTasks' : 'removedTasks')
      ) as {
        removedTasks: SavedObjectsBulkDeleteStatus[];
        erroredTasks: SetRequired<SavedObjectsBulkDeleteStatus, 'error'>[];
      };
      const removeTasksErrors: BulkOperationError[] = erroredTasks.map((status) => ({
        message: `Scheduled report deleted but task deleting failed due to: ${status.error.message}`,
        status: status.error.statusCode,
        id: status.id,
      }));

      return transformBulkActionResponse({
        scheduleIds: removedTasks.map((t) => t.id),
        errors: [...authErrors, ...deleteErrors, ...removeTasksErrors],
      });
    } catch (error) {
      throw this.responseFactory.customError({
        statusCode: 500,
        body: `Error deleting scheduled reports: ${error.message}`,
      });
    }
  }

  private async deleteSchedules(schedules: SavedObject<ScheduledReportType>[]) {
    const bulkDeleteResult = await this.savedObjectsClient.bulkDelete(
      schedules.map((so) => ({
        id: so.id,
        type: so.type,
      }))
    );
    return bulkDeleteResult.statuses.reduce(
      (deleteResult, status) => {
        if (status.error) {
          this.auditLog({
            action: ScheduledReportAuditAction.DELETE,
            id: status.id,
            error: new Error(status.error.message),
          });
          return {
            ...deleteResult,
            errors: deleteResult.errors.concat({
              message: status.error.message,
              status: status.error.statusCode,
              id: status.id,
            }),
          };
        }

        return {
          ...deleteResult,
          deletedScheduleIds: deleteResult.deletedScheduleIds.concat(status.id),
        };
      },
      {
        deletedScheduleIds: [] as string[],
        errors: [] as BulkOperationError[],
      }
    );
  }

  private async authorizeBulkAction({
    action,
    ids,
    username,
  }: {
    action: keyof typeof ScheduledReportAuditAction;
    ids: string[];
    username?: string | boolean;
  }) {
    const bulkGetResult = await this.savedObjectsClient.bulkGet<ScheduledReportType>(
      ids.map((id) => ({ id, type: SCHEDULED_REPORT_SAVED_OBJECT_TYPE }))
    );
    return bulkGetResult.saved_objects.reduce(
      (authResult, so) => {
        if (so.error) {
          return {
            ...authResult,
            errors: authResult.errors.concat({
              message: so.error.message,
              status: so.error.statusCode,
              id: so.id,
            }),
          };
        }

        if (so.attributes.createdBy !== username && !this.userCanManageReporting) {
          this.logger.warn(
            `User "${username}" attempted to ${action.toLowerCase()} scheduled report "${
              so.id
            }" created by "${so.attributes.createdBy}" without sufficient privileges.`
          );
          this.auditLog({
            action: ScheduledReportAuditAction[action],
            id: so.id,
            name: so?.attributes?.title,
            error: new Error('Not found.'),
          });

          return {
            ...authResult,
            errors: authResult.errors.concat({
              message: `Not found.`,
              status: 404,
              id: so.id,
            }),
          };
        }

        this.auditLog({
          action: ScheduledReportAuditAction[action],
          id: so.id,
          name: so.attributes.title,
          outcome: 'unknown',
        });
        return {
          ...authResult,
          authorizedSavedObjects: authResult.authorizedSavedObjects.concat(so),
        };
      },
      {
        authorizedSavedObjects: [] as SavedObject<ScheduledReportType>[],
        errors: [] as BulkOperationError[],
      }
    );
  }

  private getUsername(user: ReportingUser): string | boolean {
    return user ? user.username : false;
  }

  private getEmptyListApiResponse(page: number, perPage: number): ListScheduledReportsApiResponse {
    return {
      page,
      per_page: perPage,
      total: 0,
      data: [],
    };
  }

  private auditLog({
    action,
    id,
    name,
    outcome,
    error,
  }: ScheduledReportAuditEventParams & { id: string; name?: string }) {
    this.auditLogger.log(
      scheduledReportAuditEvent({
        action,
        savedObject: {
          type: SCHEDULED_REPORT_SAVED_OBJECT_TYPE,
          id,
          name,
        },
        outcome,
        error,
      })
    );
  }
}
