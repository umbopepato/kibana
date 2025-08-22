/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */
/* eslint-disable @typescript-eslint/no-empty-interface */
import type {
  AnalyticsServiceStart,
  I18nStart,
  ThemeServiceStart,
  UserProfileService,
} from '@kbn/core/public';
import type { HomePublicPluginSetup, HomePublicPluginStart } from '@kbn/home-plugin/public';
import type { DevToolsSetup } from '@kbn/dev-tools-plugin/public';
import type {
  UsageCollectionSetup,
  UsageCollectionStart,
} from '@kbn/usage-collection-plugin/public';
import type { SharePluginSetup, SharePluginStart } from '@kbn/share-plugin/public';
import type { DataViewsPublicPluginStart } from '@kbn/data-views-plugin/public';
import type { LicensingPluginStart } from '@kbn/licensing-plugin/public';
import type { DataPublicPluginStart } from '@kbn/data-plugin/public';
import type { UiActionsPublicStart } from '@kbn/ui-actions-plugin/public/plugin';
import type { UnifiedSearchPublicPluginStart } from '@kbn/unified-search-plugin/public';
import type { FieldFormatsStart } from '@kbn/field-formats-plugin/public';
import type { DataViewFieldEditorStart } from '@kbn/data-view-field-editor-plugin/public';
import type { SpacesPluginStart } from '@kbn/spaces-plugin/public';

export interface PublicSetupDependencies {
  home?: HomePublicPluginSetup;
  devTools: DevToolsSetup;
  share: SharePluginSetup;
  usageCollection?: UsageCollectionSetup;
}

export interface PublicStartDependencies {
  analytics: Pick<AnalyticsServiceStart, 'reportEvent'>;
  data: DataPublicPluginStart;
  dataViewFieldEditor: DataViewFieldEditorStart;
  dataViews: DataViewsPublicPluginStart;
  fieldFormats: FieldFormatsStart;
  home?: HomePublicPluginStart;
  i18n: I18nStart;
  licensing: LicensingPluginStart;
  share: SharePluginStart;
  spaces: SpacesPluginStart;
  theme: Pick<ThemeServiceStart, 'theme$'>;
  uiActions: UiActionsPublicStart;
  unifiedSearch: UnifiedSearchPublicPluginStart;
  usageCollection?: UsageCollectionStart;
  userProfile: UserProfileService;
}

export interface EsNetworkInspectorPublicSetup {}

export interface EsNetworkInspectorPublicStart {}
