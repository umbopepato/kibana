/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import { DEFAULT_APP_CATEGORIES } from '@kbn/core/server';
import { LAMBDA_ID, STACK_ALERTS_FEATURE_ID } from '@kbn/rule-data-utils';
import { STACK_ALERTS_AAD_CONFIG } from '..';
import { ActionContext } from './action_context';
import { Params, ParamsSchema } from './rule_type_params';
import { RuleType, RuleExecutorOptions, StackAlertsStartDeps } from '../../types';
import { StackAlertType } from '../types';

export const ActionGroupId = 'lambda';

export function getRuleType(
  data: Promise<StackAlertsStartDeps['triggersActionsUi']['data']>
): RuleType<Params, never, {}, {}, ActionContext, typeof ActionGroupId, never, StackAlertType> {
  const ruleTypeName = i18n.translate('xpack.stackAlerts.lambda.ruleTypeTitle', {
    defaultMessage: 'Lambda',
  });

  const actionGroupName = i18n.translate('xpack.stackAlerts.lambda.actionGroupThresholdMetTitle', {
    defaultMessage: 'Threshold met',
  });

  const actionVariableContextGroupLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextGroupLabel',
    {
      defaultMessage: 'The group that exceeded the threshold.',
    }
  );

  const actionVariableContextDateLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextDateLabel',
    {
      defaultMessage: 'The date the alert met the threshold conditions.',
    }
  );

  const actionVariableContextValueLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextValueLabel',
    {
      defaultMessage: 'The value that exceeded the threshold.',
    }
  );

  const actionVariableContextMessageLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextMessageLabel',
    {
      defaultMessage: 'A pre-constructed message for the alert.',
    }
  );

  const actionVariableContextTitleLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextTitleLabel',
    {
      defaultMessage: 'A pre-constructed title for the alert.',
    }
  );

  const actionVariableContextThresholdLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextThresholdLabel',
    {
      defaultMessage:
        'An array of rule threshold values. For between and notBetween thresholds, there are two values.',
    }
  );

  const actionVariableContextThresholdComparatorLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextThresholdComparatorLabel',
    {
      defaultMessage: 'The comparison function for the threshold.',
    }
  );

  const actionVariableContextConditionsLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextConditionsLabel',
    {
      defaultMessage: 'A string describing the threshold comparator and threshold.',
    }
  );

  const actionVariableUrlLabel = i18n.translate('xpack.stackAlerts.lambda.actionVariableUrlLabel', {
    defaultMessage: 'The endpoint url to be called.',
  });

  const actionVariableContextTimeFieldLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextTimeFieldLabel',
    {
      defaultMessage: 'The field that is used to calculate the time window.',
    }
  );

  const actionVariableContextAggTypeLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextAggTypeLabel',
    {
      defaultMessage: 'The type of aggregation.',
    }
  );

  const actionVariableContextAggFieldLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextAggFieldLabel',
    {
      defaultMessage: 'The field that is used in the aggregation.',
    }
  );

  const actionVariableContextGroupByLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextGroupByLabel',
    {
      defaultMessage:
        'Indicates whether the aggregation is applied over all documents or split into groups.',
    }
  );

  const actionVariableContextTermFieldLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextTermFieldLabel',
    {
      defaultMessage: 'The field that is used for grouping the aggregation.',
    }
  );

  const actionVariableContextFilterKueryLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextFilterKueryLabel',
    {
      defaultMessage: 'A KQL expression that limits the scope of alerts.',
    }
  );

  const actionVariableContextTermSizeLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextTermSizeLabel',
    {
      defaultMessage: 'The number of groups that are checked against the threshold.',
    }
  );

  const actionVariableContextTimeWindowSizeLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextTimeWindowSizeLabel',
    {
      defaultMessage:
        'The size of the time window, which determines how far back to search for documents.',
    }
  );

  const actionVariableContextTimeWindowUnitLabel = i18n.translate(
    'xpack.stackAlerts.lambda.actionVariableContextTimeWindowUnitLabel',
    {
      defaultMessage: 'The type of units for the time window: seconds, minutes, hours, or days.',
    }
  );

  return {
    id: LAMBDA_ID,
    name: ruleTypeName,
    actionGroups: [{ id: ActionGroupId, name: actionGroupName }],
    defaultActionGroupId: ActionGroupId,
    validate: {
      params: ParamsSchema,
    },
    actionVariables: {
      context: [],
      params: [
        { name: 'method', description: actionVariableUrlLabel },
        { name: 'url', description: actionVariableUrlLabel },
        { name: 'authType', description: actionVariableUrlLabel },
        { name: 'username', description: actionVariableUrlLabel },
        { name: 'password', description: actionVariableUrlLabel },
        { name: 'additionalLookBackTime', description: actionVariableUrlLabel },
      ],
    },
    minimumLicenseRequired: 'basic',
    isExportable: true,
    executor,
    category: DEFAULT_APP_CATEGORIES.management.id,
    producer: STACK_ALERTS_FEATURE_ID,
    doesSetRecoveryContext: true,
    alerts: STACK_ALERTS_AAD_CONFIG,
  };

  async function executor(
    options: RuleExecutorOptions<
      Params,
      {},
      {},
      ActionContext,
      typeof ActionGroupId,
      StackAlertType
    >
  ) {
    const {
      rule: { id: ruleId, name },
      services,
      params,
      logger,
      getTimeRange,
    } = options;
    const { alertsClient, scopedClusterClient } = services;

    return { state: {} };
  }
}
