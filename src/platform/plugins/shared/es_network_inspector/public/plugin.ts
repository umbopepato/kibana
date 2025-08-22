/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { i18n } from '@kbn/i18n';
import type { Plugin, CoreSetup, PluginInitializerContext } from '@kbn/core/public';

import { Storage } from '@kbn/kibana-utils-plugin/public';
import type {
  PublicSetupDependencies,
  PublicStartDependencies,
  EsNetworkInspectorPublicSetup,
  EsNetworkInspectorPublicStart,
} from './types';

const storage = new Storage(localStorage);

export class EsNetworkInspectorUiPlugin
  implements
    Plugin<
      EsNetworkInspectorPublicSetup,
      EsNetworkInspectorPublicStart,
      PublicSetupDependencies,
      PublicStartDependencies
    >
{
  constructor(private ctx: PluginInitializerContext) {}

  public setup(
    { getStartServices, http }: CoreSetup<PublicStartDependencies>,
    { devTools, home, usageCollection }: PublicSetupDependencies
  ): EsNetworkInspectorPublicSetup {
    if (home) {
      home.featureCatalogue.register({
        id: 'es-network-inspector',
        title: i18n.translate('esRequestsLog.devToolsTitle', {
          defaultMessage: 'Debug Elasticsearch requests',
        }),
        description: i18n.translate('esRequestsLog.devToolsDescription', {
          defaultMessage: 'View and search the log of all Elasticsearch HTTP requests.',
        }),
        icon: 'esRequestsLogApp',
        path: '/app/dev_tools#/es-network-inspector',
        showOnHomePage: false,
        category: 'admin',
      });
    }

    devTools.register({
      id: 'es-network-inspector',
      order: 2,
      title: i18n.translate('esRequestsLog.displayName', {
        defaultMessage: 'Network Inspector',
      }),
      enableRouting: true,
      mount: async ({ element, history }) => {
        const [core, deps] = await getStartServices();

        const { docLinks, application, notifications, ...startServices } = core;
        const {
          data,
          dataViews,
          licensing,
          uiActions,
          unifiedSearch,
          fieldFormats,
          dataViewFieldEditor,
          spaces,
          share,
        } = deps;

        const { renderApp } = await import('./application');

        return renderApp({
          element,
          history,
          isDevMode: this.ctx.env.mode.dev,
          services: {
            ...startServices,
            http,
            docLinks,
            application,
            dataViews,
            data,
            storage,
            spaces,
            share,
            licensing,
            notifications,
            usageCollection,
            uiActions,
            unifiedSearch,
            fieldFormats,
            dataViewFieldEditor,
          },
        });
      },
    });

    return {};
  }

  public start() {
    return {};
  }
}
