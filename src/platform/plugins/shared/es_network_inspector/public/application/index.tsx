/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { KibanaContextProvider } from '@kbn/kibana-react-plugin/public';
import { EsNetworkInspector } from './components/es_network_inspector';
import type { RenderAppParams } from '../types/app';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export async function renderApp({ element, services, networkInspectorDataView }: RenderAppParams) {
  render(
    services.rendering.addContext(
      <KibanaContextProvider services={services}>
        <QueryClientProvider client={queryClient}>
          <EsNetworkInspector dataView={networkInspectorDataView} />
        </QueryClientProvider>
      </KibanaContextProvider>
    ),
    element
  );
  return () => unmountComponentAtNode(element);
}
