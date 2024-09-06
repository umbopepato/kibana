/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Moment } from 'moment';
import {
  ComponentClass,
  ComponentType,
  Dispatch,
  Key,
  MutableRefObject,
  ReactNode,
  RefAttributes,
  SetStateAction,
} from 'react';
import type { PublicMethodsOf } from '@kbn/utility-types';
import type { DocLinksStart } from '@kbn/core/public';
import type { ChartsPluginSetup } from '@kbn/charts-plugin/public';
import type { DataPublicPluginStart } from '@kbn/data-plugin/public';
import type { DataViewsPublicPluginStart } from '@kbn/data-views-plugin/public';
import type { UnifiedSearchPublicPluginStart } from '@kbn/unified-search-plugin/public';
import {
  EuiDataGridCellValueElementProps,
  EuiDataGridProps,
  EuiDataGridColumnCellAction,
  EuiDataGridToolBarVisibilityOptions,
  EuiSuperSelectOption,
  EuiDataGridOnColumnResizeHandler,
  EuiDataGridRefProps,
} from '@elastic/eui';
import type { RuleCreationValidConsumer, ValidFeatureId } from '@kbn/rule-data-utils';
import { EuiDataGridColumn, EuiDataGridControlColumn, EuiDataGridSorting } from '@elastic/eui';
import { HttpSetup } from '@kbn/core/public';
import { KueryNode } from '@kbn/es-query';
import {
  ActionType,
  AlertHistoryEsIndexConnectorId,
  AlertHistoryDocumentTemplate,
  ALERT_HISTORY_PREFIX,
  AlertHistoryDefaultIndexName,
  AsApiContract,
} from '@kbn/actions-plugin/common';
import {
  ActionGroup,
  SanitizedRule as AlertingSanitizedRule,
  ResolvedSanitizedRule,
  RuleSystemAction,
  RuleTaskState,
  AlertSummary as RuleSummary,
  ExecutionDuration,
  AlertStatus,
  RawAlertInstance,
  RuleNotifyWhenType,
  RuleTypeParams,
  RuleTypeMetaData,
  RuleLastRun,
  MaintenanceWindow,
  SanitizedRuleAction as RuleAction,
} from '@kbn/alerting-plugin/common';
import type { BulkOperationError } from '@kbn/alerting-plugin/server';
import type {
  RuleRegistrySearchRequestPagination,
  EcsFieldsResponse,
  BrowserFields,
} from '@kbn/rule-registry-plugin/common';
import {
  type MappingRuntimeFields,
  QueryDslQueryContainer,
  SortCombinations,
} from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import React from 'react';
import { ActionsPublicPluginSetup } from '@kbn/actions-plugin/public';
import type { RuleType, RuleTypeIndex } from '@kbn/triggers-actions-ui-types';
import {
  ValidationResult,
  UserConfiguredActionConnector,
  ActionConnector,
  ActionTypeRegistryContract,
  EsQuerySnapshot,
  type LegacyField,
} from '@kbn/alerts-ui-shared/src/common/types';
import { TypeRegistry } from '@kbn/alerts-ui-shared/src/common/type_registry';
import { FieldFormatsStart } from '@kbn/field-formats-plugin/public';
import { SetRequired } from 'type-fest';
import type { ComponentOpts as RuleStatusDropdownProps } from './application/sections/rules_list/components/rule_status_dropdown';
import type { RuleTagFilterProps } from './application/sections/rules_list/components/rule_tag_filter';
import type { RuleStatusFilterProps } from './application/sections/rules_list/components/rule_status_filter';
import type { RulesListProps } from './application/sections/rules_list/components/rules_list';
import type {
  RuleTagBadgeProps,
  RuleTagBadgeOptions,
} from './application/sections/rules_list/components/rule_tag_badge';
import type {
  RuleEventLogListProps,
  RuleEventLogListOptions,
} from './application/sections/rule_details/components/rule_event_log_list';
import type { GlobalRuleEventLogListProps } from './application/sections/rule_details/components/global_rule_event_log_list';
import type { AlertSummaryTimeRange } from './application/sections/alert_summary_widget/types';
import type { CreateConnectorFlyoutProps } from './application/sections/action_connector_form/create_connector_flyout';
import type { EditConnectorFlyoutProps } from './application/sections/action_connector_form/edit_connector_flyout';
import type {
  FieldBrowserOptions,
  CreateFieldComponent,
  GetFieldTableColumns,
  FieldBrowserProps,
  BrowserFieldItem,
} from './application/sections/field_browser/types';
import { RulesListVisibleColumns } from './application/sections/rules_list/components/rules_list_column_selector';
import { TimelineItem } from './application/sections/alerts_table/bulk_actions/components/toolbar';
import type { RulesListNotifyBadgePropsWithApi } from './application/sections/rules_list/components/notify_badge';
import { Case } from './application/sections/alerts_table/hooks/apis/bulk_get_cases';
import { MutedAlerts } from './application/sections/alerts_table/types';

export type {
  GenericValidationResult,
  ValidationResult,
  ConnectorValidationError,
  ConnectorValidationFunc,
  ActionConnectorFieldsProps,
  ActionConnectorProps,
  SystemAction,
  PreConfiguredActionConnector,
  UserConfiguredActionConnector,
  ActionConnector,
  ActionParamsProps,
  ActionReadOnlyElementProps,
  CustomConnectorSelectionItem,
  ActionTypeModel,
  ActionTypeRegistryContract,
} from '@kbn/alerts-ui-shared/src/common/types';

export { ActionConnectorMode } from '@kbn/alerts-ui-shared/src/common/types';

export type { ActionVariables, RuleType, RuleTypeIndex } from '@kbn/triggers-actions-ui-types';

export {
  REQUIRED_ACTION_VARIABLES,
  CONTEXT_ACTION_VARIABLES,
  OPTIONAL_ACTION_VARIABLES,
} from '@kbn/triggers-actions-ui-types';

type RuleUiAction = RuleAction | RuleSystemAction;

// In Triggers and Actions we treat all `Alert`s as `SanitizedRule<RuleTypeParams>`
// so the `Params` is a black-box of Record<string, unknown>
type SanitizedRule<Params extends RuleTypeParams = never> = Omit<
  AlertingSanitizedRule<Params>,
  'alertTypeId' | 'actions' | 'systemActions'
> & {
  ruleTypeId: AlertingSanitizedRule['alertTypeId'];
  actions: RuleUiAction[];
};
type Rule<Params extends RuleTypeParams = RuleTypeParams> = SanitizedRule<Params>;
type ResolvedRule = Omit<
  ResolvedSanitizedRule<RuleTypeParams>,
  'alertTypeId' | 'actions' | 'systemActions'
> & {
  ruleTypeId: ResolvedSanitizedRule['alertTypeId'];
  actions: RuleUiAction[];
};

export type {
  Rule,
  RuleAction,
  RuleSystemAction,
  RuleUiAction,
  RuleTaskState,
  RuleSummary,
  ExecutionDuration,
  AlertStatus,
  RawAlertInstance,
  RuleNotifyWhenType,
  RuleTypeParams,
  RuleTypeMetaData,
  ResolvedRule,
  SanitizedRule,
  RuleStatusDropdownProps,
  RuleTagFilterProps,
  RuleStatusFilterProps,
  RuleLastRun,
  RuleTagBadgeProps,
  RuleTagBadgeOptions,
  RuleEventLogListProps,
  RuleEventLogListOptions,
  GlobalRuleEventLogListProps,
  RulesListProps,
  CreateConnectorFlyoutProps,
  EditConnectorFlyoutProps,
  RulesListNotifyBadgePropsWithApi,
  FieldBrowserProps,
  FieldBrowserOptions,
  CreateFieldComponent,
  GetFieldTableColumns,
  BrowserFieldItem,
  RulesListVisibleColumns,
  AlertSummaryTimeRange,
};
export type { ActionType, AsApiContract };
export {
  AlertHistoryEsIndexConnectorId,
  AlertHistoryDocumentTemplate,
  AlertHistoryDefaultIndexName,
  ALERT_HISTORY_PREFIX,
};

export type ActionTypeIndex = Record<string, ActionType>;
export type RuleTypeRegistryContract = PublicMethodsOf<TypeRegistry<RuleTypeModel>>;

export enum RuleFlyoutCloseReason {
  SAVED,
  CANCELED,
}

export interface BulkEditResponse {
  rules: Rule[];
  errors: BulkOperationError[];
  total: number;
}

export interface BulkOperationResponse {
  rules: Rule[];
  errors: BulkOperationError[];
  total: number;
}

interface BulkOperationAttributesByIds {
  ids: string[];
  filter?: never;
}

interface BulkOperationAttributesByFilter {
  ids?: never;
  filter: KueryNode | null;
}

export type BulkOperationAttributesWithoutHttp =
  | BulkOperationAttributesByIds
  | BulkOperationAttributesByFilter;

export type BulkOperationAttributes = BulkOperationAttributesWithoutHttp & {
  http: HttpSetup;
};

export type BulkDisableParamsWithoutHttp = BulkOperationAttributesWithoutHttp & {
  untrack: boolean;
};

export type BulkDisableParams = BulkDisableParamsWithoutHttp & {
  http: HttpSetup;
};

export interface Pagination {
  index: number;
  size: number;
}

export interface Sorting {
  field: string;
  direction: string;
}

export type ActionConnectorWithoutId<
  Config = Record<string, unknown>,
  Secrets = Record<string, unknown>
> = Omit<UserConfiguredActionConnector<Config, Secrets>, 'id'>;

export type ActionConnectorTableItem = ActionConnector & {
  actionType: ActionType['name'];
  compatibility: string[];
};

export type RuleUpdates = Omit<Rule, 'id' | 'executionStatus' | 'lastRun' | 'nextRun'>;

export type RuleSnoozeSettings = Pick<
  Rule,
  'activeSnoozes' | 'isSnoozedUntil' | 'muteAll' | 'snoozeSchedule' | 'name'
>;

export interface RuleTableItem extends Rule {
  ruleType: RuleType['name'];
  index: number;
  actionsCount: number;
  isEditable: boolean;
  enabledInLicense: boolean;
  showIntervalWarning?: boolean;
}

export interface RuleTypeParamsExpressionProps<
  Params extends RuleTypeParams = RuleTypeParams,
  MetaData = Record<string, unknown>,
  ActionGroupIds extends string = string
> {
  id?: string;
  ruleParams: Params;
  ruleInterval: string;
  ruleThrottle: string;
  alertNotifyWhen: RuleNotifyWhenType;
  setRuleParams: <Key extends keyof Params>(property: Key, value: Params[Key] | undefined) => void;
  setRuleProperty: <Prop extends keyof Rule>(
    key: Prop,
    value: SanitizedRule<Params>[Prop] | null
  ) => void;
  onChangeMetaData: (metadata: MetaData) => void;
  errors: IErrorObject;
  defaultActionGroupId: string;
  actionGroups: Array<ActionGroup<ActionGroupIds>>;
  metadata?: MetaData;
  charts: ChartsPluginSetup;
  data: DataPublicPluginStart;
  dataViews: DataViewsPublicPluginStart;
  unifiedSearch: UnifiedSearchPublicPluginStart;
}

export interface RuleTypeModel<Params extends RuleTypeParams = RuleTypeParams> {
  id: string;
  description: string;
  iconClass: string;
  documentationUrl: string | ((docLinks: DocLinksStart) => string) | null;
  validate: (ruleParams: Params, isServerless?: boolean) => ValidationResult;
  ruleParamsExpression:
    | React.FunctionComponent<any>
    | React.LazyExoticComponent<ComponentType<RuleTypeParamsExpressionProps<Params>>>;
  requiresAppContext: boolean;
  defaultActionMessage?: string;
  defaultRecoveryMessage?: string;
  defaultSummaryMessage?: string;
  alertDetailsAppSection?:
    | React.FunctionComponent<any>
    | React.LazyExoticComponent<ComponentType<any>>;
}

export interface IErrorObject {
  [key: string]: string | string[] | IErrorObject;
}

export enum EditConnectorTabs {
  Configuration = 'configuration',
  Test = 'test',
  Rules = 'rules',
}

export interface RuleEditProps<
  Params extends RuleTypeParams = RuleTypeParams,
  MetaData extends RuleTypeMetaData = RuleTypeMetaData
> {
  initialRule: Rule<Params>;
  ruleTypeRegistry: RuleTypeRegistryContract;
  actionTypeRegistry: ActionTypeRegistryContract;
  onClose: (reason: RuleFlyoutCloseReason, metadata?: MetaData) => void;
  /** @deprecated use `onSave` as a callback after an alert is saved*/
  reloadRules?: () => Promise<void>;
  hideInterval?: boolean;
  onSave?: (metadata?: MetaData) => Promise<void>;
  metadata?: MetaData;
  ruleType?: RuleType<string, string>;
}

export interface RuleAddProps<
  Params extends RuleTypeParams = RuleTypeParams,
  MetaData extends RuleTypeMetaData = RuleTypeMetaData
> {
  /**
   * ID of the feature this rule should be created for.
   *
   * Notes:
   * - The feature needs to be registered using `featuresPluginSetup.registerKibanaFeature()` API during your plugin's setup phase.
   * - The user needs to have permission to access the feature in order to create the rule.
   * */
  consumer: string;
  ruleTypeRegistry: RuleTypeRegistryContract;
  actionTypeRegistry: ActionTypeRegistryContract;
  onClose: (reason: RuleFlyoutCloseReason, metadata?: MetaData) => void;
  ruleTypeId?: string;
  /**
   * Determines whether the user should be able to change the rule type in the UI.
   */
  canChangeTrigger?: boolean;
  initialValues?: Partial<Rule<Params>>;
  /** @deprecated use `onSave` as a callback after an alert is saved*/
  reloadRules?: () => Promise<void>;
  hideGrouping?: boolean;
  hideInterval?: boolean;
  onSave?: (metadata?: MetaData) => Promise<void>;
  metadata?: MetaData;
  ruleTypeIndex?: RuleTypeIndex;
  filteredRuleTypes?: string[];
  validConsumers?: RuleCreationValidConsumer[];
  useRuleProducer?: boolean;
  initialSelectedConsumer?: RuleCreationValidConsumer | null;
}

export interface RuleDefinitionProps<Params extends RuleTypeParams = RuleTypeParams> {
  rule: Rule<Params>;
  ruleTypeRegistry: RuleTypeRegistryContract;
  actionTypeRegistry: ActionTypeRegistryContract;
  onEditRule: () => Promise<void>;
  hideEditButton?: boolean;
  filteredRuleTypes?: string[];
  useNewRuleForm?: boolean;
}

export enum Percentiles {
  P50 = 'P50',
  P95 = 'P95',
  P99 = 'P99',
}

export interface TriggersActionsUiConfig {
  isUsingSecurity: boolean;
  minimumScheduleInterval?: {
    value: string;
    enforce: boolean;
  };
}

export enum AlertsField {
  name = 'kibana.alert.rule.name',
  reason = 'kibana.alert.reason',
  uuid = 'kibana.alert.rule.uuid',
  case_ids = 'kibana.alert.case_ids',
}

export interface InspectQuery {
  request: string[];
  response: string[];
}

export type GetInspectQuery = () => InspectQuery;

export type Alert = EcsFieldsResponse;
export type Alerts = Alert[];

export interface FetchAlertData {
  activePage: number;
  alerts: Alerts;
  alertsCount: number;
  isInitializing: boolean;
  isLoading: boolean;
  getInspectQuery: GetInspectQuery;
  onPageChange: (pagination: RuleRegistrySearchRequestPagination) => void;
  onSortChange: (sort: EuiDataGridSorting['columns']) => void;
  refresh: () => void;
  sort: SortCombinations[];
  /**
   * We need to have it because of lot code is expecting this format
   * @deprecated
   */
  oldAlertsData: Array<Array<{ field: string; value: string[] }>>;
  /**
   * We need to have it because of lot code is expecting this format
   * @deprecated
   */
  ecsAlertsData: unknown[];
}

type MergeProps<T, AP> = T extends (args: infer Props) => unknown
  ? (args: Props & AP) => JSX.Element | null
  : T extends ComponentClass<infer Props>
  ? ComponentClass<Props & AP>
  : never;

// TODO(@umbopepato) rename columns to initialColumns?
export interface AlertsTableProps<AC extends AdditionalContext = AdditionalContext>
  extends PublicAlertsDataGridProps {
  id: string;
  featureIds: ValidFeatureId[];
  columns?: EuiDataGridProps['columns'];
  query: Pick<QueryDslQueryContainer, 'bool' | 'ids'>;
  initialSort?: SortCombinations[];
  initialPageSize?: number;
  browserFields?: BrowserFields;
  onUpdate?: (context: RenderContext<AC>) => void;
  onLoaded?: (alerts: Alerts, columns: EuiDataGridColumn[]) => void;
  runtimeMappings?: MappingRuntimeFields;
  showAlertStatusWithFlapping?: boolean;
  toolbarVisibility?: EuiDataGridToolBarVisibilityOptions;
  /**
   * Allows to consumers of the table to decide to highlight a row based on the current alert.
   */
  shouldHighlightRow?: (alert: Alert) => boolean;
  /**
   * Enable when rows may have variable heights (disables virtualization)
   */
  dynamicRowHeight?: boolean;
  emptyStateHeight?: 'tall' | 'short';
  /**
   * An object that will be passed along with the renderContext to all render functions.
   */
  additionalContext?: AC;
  /**
   * Cell content render function
   */
  renderCellValue?: MergeProps<
    EuiDataGridProps['renderCellValue'],
    RenderContext<AC> & {
      alert: Alert;
      /**
       * @deprecated
       */
      legacyAlert: LegacyField[];
      /**
       * @deprecated
       */
      ecsAlert: any;
    }
  >;
  renderCellPopover?: MergeProps<
    EuiDataGridProps['renderCellPopover'],
    RenderContext<AC> & { alert: Alert }
  >;
  renderActionsCell?: MergeProps<
    EuiDataGridControlColumn['rowCellRender'],
    RenderContext<AC> & { alert: Alert; setIsActionLoading?: (isLoading: boolean) => void }
  >;
  renderAdditionalToolbarControls?: ComponentRenderer<AC>;
  renderFlyoutHeader?: FlyoutSectionRenderer<AC>;
  renderFlyoutBody?: FlyoutSectionRenderer<AC>;
  renderFlyoutFooter?: FlyoutSectionRenderer<AC>;

  lastReloadRequestTime?: number;
}

/**
 * A utility type to extract the type of a prop from `AlertsTableProps`, excluding `undefined`.
 */
export type AlertsTableProp<Key extends keyof AlertsTableProps> = NonNullable<
  AlertsTableProps[Key]
>;

export interface AlertsTableImperativeApi {
  refresh: () => void;
  toggleColumn: (columnId: string) => void;
}

export type AlertsTablePropsWithRef<AC extends AdditionalContext> = AlertsTableProps<AC> &
  RefAttributes<AlertsTableImperativeApi>;

export type FlyoutSectionRenderer<AC extends AdditionalContext = AdditionalContext> =
  ComponentRenderer<
    AC & {
      alert: Alert;
      flyoutIndex: number;
      isLoading: boolean;
      onClose: () => void;
      onPaginate: (pageIndex: number) => void;
    }
  >;

export interface BaseRenderContext
  extends SetRequired<
    Pick<
      AlertsTableProps,
      | 'columns'
      | 'renderCellValue'
      | 'renderCellPopover'
      | 'renderActionsCell'
      | 'renderFlyoutHeader'
      | 'renderFlyoutBody'
      | 'renderFlyoutFooter'
    >,
    'columns'
  > {
  tableId?: string;
  dataGridRef: MutableRefObject<EuiDataGridRefProps | null>;

  /**
   * Refetches all the queries, resetting the alerts pagination if necessary
   */
  refresh: () => void;

  /**
   * True if any of the active queries is fetching
   */
  isLoading: boolean;

  isLoadingAlerts: boolean;
  alerts: Alerts;
  ecsAlertsData: any[];
  oldAlertsData: any[];
  alertsCount: number;
  browserFields: BrowserFields;

  isLoadingMutedAlerts: boolean;
  mutedAlerts?: MutedAlerts;

  isLoadingCases: boolean;
  cases?: Map<string, Case>;

  isLoadingMaintenanceWindows: boolean;
  maintenanceWindows?: Map<string, MaintenanceWindow>;

  pageIndex: number;
  pageSize: number;

  fieldFormats: FieldFormatsStart;
  openAlertInFlyout: (alertId: string) => void;

  showAlertStatusWithFlapping?: boolean;

  bulkActionsStore: [BulkActionsState, Dispatch<BulkActionsReducerAction>];
}

export type AdditionalContext = object;

export type RenderContext<AC extends AdditionalContext> = BaseRenderContext & AC;

export type ComponentRenderer<AC extends AdditionalContext> = ComponentType<RenderContext<AC>>;

export interface CellActionsOptions {
  /**
   * Resolves the cell actions for a given column
   */
  getCellActionsForColumn: (columnId: string, columnIndex: number) => EuiDataGridColumnCellAction[];
  visibleCellActions?: number;
  disabledCellActions?: string[];
}

export interface PublicAlertsDataGridProps
  extends Omit<
    EuiDataGridProps,
    | 'renderCellPopover'
    | 'renderCellValue'
    | 'aria-labelledby'
    | 'columnVisibility'
    | 'rowCount'
    | 'sorting'
    | 'cellContext'
    | 'pagination'
    | 'columns'
  > {
  showInspectButton?: boolean;
  casesConfiguration?: {
    featureId: string;
    owner: string[];
    appId?: string;
    syncAlerts?: boolean;
  };
  hideBulkActions?: boolean;
  getBulkActions?: (
    query: Pick<QueryDslQueryContainer, 'bool' | 'ids'>,
    refresh: () => void
  ) => BulkActionsPanelConfig[];
  actionsColumnWidth?: number;
  fieldsBrowserOptions?: FieldBrowserOptions;
  cellActionsOptions?: CellActionsOptions;
}

export interface AlertsDataGridProps<AC extends AdditionalContext = AdditionalContext>
  extends PublicAlertsDataGridProps {
  renderContext: RenderContext<AC>;
  additionalToolbarControls?: ReactNode;
  pageSizeOptions?: number[];
  leadingControlColumns?: EuiDataGridControlColumn[];
  trailingControlColumns?: EuiDataGridControlColumn[];
  visibleColumns: string[];
  'data-test-subj': string;
  onToggleColumn: (columnId: string) => void;
  onResetColumns: () => void;
  onChangeVisibleColumns: (newColumns: string[]) => void;
  onColumnResize?: EuiDataGridOnColumnResizeHandler;
  query: Pick<QueryDslQueryContainer, 'bool' | 'ids'>;
  showInspectButton?: boolean;
  toolbarVisibility?: EuiDataGridToolBarVisibilityOptions;
  /**
   * Allows to consumers of the table to decide to highlight a row based on the current alert.
   */
  shouldHighlightRow?: (alert: Alert) => boolean;
  /**
   * Enable when rows may have variable heights (disables virtualization)
   */
  dynamicRowHeight?: boolean;
  featureIds?: ValidFeatureId[];
  sort: SortCombinations[];
  alertsQuerySnapshot?: EsQuerySnapshot;
  onSortChange: (sort: EuiDataGridSorting['columns']) => void;
  flyoutAlertIndex: number;
  setFlyoutAlertIndex: Dispatch<SetStateAction<number>>;
  onPaginateFlyout: (nextPageIndex: number) => void;
  onChangePageSize: (size: number) => void;
  onChangePageIndex: (index: number) => void;
}

export interface TimelineNonEcsData {
  field: string;
  value?: string[] | null;
}

export type AlertTableFlyoutComponent =
  | React.FunctionComponent<AlertsTableFlyoutBaseProps>
  | React.LazyExoticComponent<ComponentType<AlertsTableFlyoutBaseProps>>
  | null;

export interface AlertsTableFlyoutBaseProps {
  alert: Alert;
  isLoading: boolean;
  id?: string;
}

export interface BulkActionsConfig {
  label: string;
  key: string;
  'data-test-subj'?: string;
  disableOnQuery: boolean;
  disabledLabel?: string;
  onClick?: (
    selectedIds: TimelineItem[],
    isAllSelected: boolean,
    setIsBulkActionsLoading: (isLoading: boolean) => void,
    clearSelection: () => void,
    refresh: () => void
  ) => void;
  panel?: number;
}

interface PanelConfig {
  id: number;
  title?: JSX.Element | string;
  'data-test-subj'?: string;
}

export interface RenderContentPanelProps {
  alertItems: TimelineItem[];
  setIsBulkActionsLoading: (isLoading: boolean) => void;
  isAllSelected?: boolean;
  clearSelection?: () => void;
  refresh?: () => void;
  closePopoverMenu: () => void;
}

interface ContentPanelConfig extends PanelConfig {
  renderContent: (args: RenderContentPanelProps) => JSX.Element;
  items?: never;
}

interface ItemsPanelConfig extends PanelConfig {
  content?: never;
  items: BulkActionsConfig[];
}

export type BulkActionsPanelConfig = ItemsPanelConfig | ContentPanelConfig;

export interface RenderCustomActionsRowArgs {
  ecsAlert: FetchAlertData['ecsAlertsData'][number];
  nonEcsData: FetchAlertData['oldAlertsData'][number];
  rowIndex: number;
  cveProps: EuiDataGridCellValueElementProps;
  alert: Alert;
  setFlyoutAlert: (alertId: string) => void;
  id?: string;
  setIsActionLoading?: (isLoading: boolean) => void;
  refresh: () => void;
  clearSelection: () => void;
}

export interface AlertActionsProps extends RenderContext<AdditionalContext> {
  key?: Key;
  alert: Alert;
  onActionExecuted?: () => void;
  isAlertDetailsEnabled?: boolean;
  /**
   * Implement this to resolve your app's specific rule page path, return null to avoid showing the link
   */
  resolveRulePagePath?: (ruleId: string, currentPageId: string) => string | null;
  /**
   * Implement this to resolve your app's specific alert page path, return null to avoid showing the link
   */
  resolveAlertPagePath?: (alertId: string, currentPageId: string) => string | null;
}

export type UseActionsColumnRegistry = () => {
  renderCustomActionsRow: (args: RenderCustomActionsRowArgs) => JSX.Element;
  width?: number;
};

export enum BulkActionsVerbs {
  add = 'add',
  delete = 'delete',
  clear = 'clear',
  selectCurrentPage = 'selectCurrentPage',
  selectAll = 'selectAll',
  rowCountUpdate = 'rowCountUpdate',
  updateRowLoadingState = 'updateRowLoadingState',
  updateAllLoadingState = 'updateAllLoadingState',
}

export interface BulkActionsReducerAction {
  action: BulkActionsVerbs;
  rowIndex?: number;
  rowCount?: number;
  isLoading?: boolean;
}

export interface BulkActionsState {
  rowSelection: Map<number, RowSelectionState>;
  isAllSelected: boolean;
  areAllVisibleRowsSelected: boolean;
  rowCount: number;
  updatedAt: number;
}

export type RowSelection = Map<number, RowSelectionState>;

export interface RowSelectionState {
  isLoading: boolean;
}

export type RuleStatus = 'enabled' | 'disabled' | 'snoozed';

export enum RRuleFrequency {
  YEARLY = 0,
  MONTHLY = 1,
  WEEKLY = 2,
  DAILY = 3,
}

export interface RecurrenceSchedule {
  freq: RRuleFrequency;
  interval: number;
  until?: Moment;
  count?: number;
  byweekday?: string[];
  bymonthday?: number[];
  bymonth?: number[];
}

export interface SnoozeSchedule {
  id: string | null;
  duration: number;
  rRule: Partial<RecurrenceSchedule> & {
    dtstart: string;
    tzid: string;
  };
}

export interface ConnectorServices {
  validateEmailAddresses: ActionsPublicPluginSetup['validateEmailAddresses'];
}

export interface RulesListFilters {
  actionTypes?: string[];
  ruleExecutionStatuses?: string[];
  ruleLastRunOutcomes?: string[];
  ruleParams?: Record<string, string | number | object>;
  ruleStatuses?: RuleStatus[];
  searchText?: string;
  tags?: string[];
  types?: string[];
  kueryNode?: KueryNode;
}

export type UpdateFiltersProps =
  | {
      filter: 'searchText';
      value: string;
    }
  | {
      filter: 'ruleStatuses';
      value: RuleStatus[];
    }
  | {
      filter: 'types' | 'actionTypes' | 'ruleExecutionStatuses' | 'ruleLastRunOutcomes' | 'tags';
      value: string[];
    }
  | {
      filter: 'ruleParams';
      value: Record<string, string | number | object>;
    }
  | {
      filter: 'kueryNode';
      value: KueryNode;
    };

export type BulkEditActions =
  | 'snooze'
  | 'unsnooze'
  | 'schedule'
  | 'unschedule'
  | 'updateApiKey'
  | 'delete';

export interface UpdateRulesToBulkEditProps {
  action: BulkEditActions;
  rules?: RuleTableItem[];
  filter?: KueryNode | null;
}

export interface LazyLoadProps {
  hideLazyLoader?: boolean;
}

export interface NotifyWhenSelectOptions {
  isSummaryOption?: boolean;
  isForEachAlertOption?: boolean;
  value: EuiSuperSelectOption<RuleNotifyWhenType>;
}

export type { RuleCreationValidConsumer } from '@kbn/rule-data-utils';
