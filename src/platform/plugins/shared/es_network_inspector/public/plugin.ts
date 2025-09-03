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
import { NETWORK_INSPECTOR_INDEX_NAME } from './constants';
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

        let networkInspectorDataView = (await dataViews.find(NETWORK_INSPECTOR_INDEX_NAME))?.[0];
        if (!networkInspectorDataView) {
          networkInspectorDataView = await dataViews.createAndSave({
            title: NETWORK_INSPECTOR_INDEX_NAME,
            timeFieldName: '@timestamp',
            name: 'ES Network Requests',
            fieldFormats: {
              duration: {
                id: 'duration',
                params: {
                  parsedUrl: {
                    origin: 'http://localhost:5601',
                    pathname: '/app/management/kibana/dataViews',
                    basePath: '',
                  },
                  inputFormat: 'milliseconds',
                  outputFormat: 'asMilliseconds',
                  outputPrecision: 2,
                  includeSpaceWithSuffix: true,
                  showSuffix: true,
                  useShortSuffix: true,
                },
              },
            },
            fieldAttrs: {
              '@timestamp': {
                customLabel: 'Timestamp',
                customDescription:
                  'Timestamp of when the request started (equivalent to client_connection_established)',
              },
              duration: {
                customLabel: 'Duration',
                customDescription: 'Request duration in ms',
                count: 0,
              },
              index_pattern: {
                customLabel: 'Index pattern',
                customDescription: 'The index pattern (if any) this query operates on',
                count: 0,
              },
              'request.method': {
                customLabel: 'Method',
                customDescription: 'The HTTP method',
                count: 0,
              },
              'request.body': { customLabel: 'Request body', count: 0 },
              'request.body_size_bytes': {
                customLabel: 'Request body size',
                customDescription: 'Request body size in bytes',
                count: 0,
              },
              'response.body': { customLabel: 'Response body', count: 0 },
              'response.body_size_bytes': {
                customLabel: 'Response body size',
                customDescription: 'Response body size in bytes',
                count: 0,
              },
              'response.status_code': {
                customLabel: 'Status',
                customDescription: 'The HTTP response status code',
                count: 0,
              },
              'request.url': {
                customLabel: 'URL',
                customDescription: 'The complete URL of the request',
                count: 0,
              },
              operation: {
                customLabel: 'Operation',
                customDescription: 'The operation type',
                count: 0,
              },
            },
            allowHidden: true,
          });
        }

        const { renderApp } = await import('./application');

        return renderApp({
          element,
          history,
          isDevMode: this.ctx.env.mode.dev,
          networkInspectorDataView,
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
