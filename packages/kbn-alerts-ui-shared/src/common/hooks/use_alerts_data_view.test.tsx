/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FunctionComponent } from 'react';
import { AlertConsumers } from '@kbn/rule-data-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks/dom';
import { fetchAlertsIndexNames } from '../apis/fetch_alerts_index_names';
import { fetchAlertsFields } from '../apis/fetch_alerts_fields';
import { testQueryClientConfig } from '../test_utils/test_query_client_config';
import { useAlertsDataView } from './use_alerts_data_view';
import { HttpSetup } from '@kbn/core-http-browser';
import { DataView, DataViewsContract } from '@kbn/data-views-plugin/common';
import type { ToastsStart } from '@kbn/core-notifications-browser';

jest.mock('../apis/fetch_alerts_index_names');
jest.mock('../apis/fetch_alerts_fields');

const mockFetchAlertsIndexNames = jest.mocked(fetchAlertsIndexNames);
const mockFetchAlertsFields = jest.mocked(fetchAlertsFields);

mockFetchAlertsIndexNames.mockResolvedValue([
  '.alerts-observability.uptime.alerts-*',
  '.alerts-observability.metrics.alerts-*',
  '.alerts-observability.logs.alerts-*',
  '.alerts-observability.apm.alerts-*',
]);
mockFetchAlertsFields.mockResolvedValue({ browserFields: {}, fields: [] });

const mockDataView = { fields: [] } as unknown as DataView;

const mockServices = {
  http: {} as HttpSetup,
  dataViewsService: {
    create: jest.fn().mockResolvedValue(mockDataView),
    clearInstanceCache: jest.fn(),
  } as unknown as DataViewsContract,
  toasts: {
    addDanger: jest.fn(),
  } as unknown as ToastsStart,
};

const queryClient = new QueryClient(testQueryClientConfig);

const wrapper: FunctionComponent = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useAlertsDataView', () => {
  const observabilityFeatureIds = [
    AlertConsumers.APM,
    AlertConsumers.INFRASTRUCTURE,
    AlertConsumers.LOGS,
    AlertConsumers.UPTIME,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('starts with a loading state and without data', async () => {
    const mockedAsyncDataView = {
      isLoading: true,
      dataView: undefined,
    };

    const { result, waitFor } = renderHook(
      () =>
        useAlertsDataView({
          ...mockServices,
          featureIds: observabilityFeatureIds,
        }),
      {
        wrapper,
      }
    );

    await waitFor(() => expect(result.current).toEqual(mockedAsyncDataView));
  });

  it('fetches indexes and fields for non-siem feature ids, returning a DataViewBase object', async () => {
    const { result, waitForValueToChange } = renderHook(
      () =>
        useAlertsDataView({
          ...mockServices,
          featureIds: observabilityFeatureIds,
        }),
      {
        wrapper,
      }
    );

    await waitForValueToChange(() => result.current.isLoading, { timeout: 5000 });

    expect(mockFetchAlertsFields).toHaveBeenCalledTimes(1);
    expect(mockFetchAlertsIndexNames).toHaveBeenCalledTimes(1);
    expect(result.current.dataView).not.toBe(mockDataView);
  });

  it('only fetches index names for the siem feature id, returning a DataView', async () => {
    const { result, waitFor } = renderHook(
      () => useAlertsDataView({ ...mockServices, featureIds: [AlertConsumers.SIEM] }),
      {
        wrapper,
      }
    );

    await waitFor(() => expect(mockFetchAlertsIndexNames).toHaveBeenCalledTimes(1));
    expect(mockFetchAlertsFields).toHaveBeenCalledTimes(0);

    await waitFor(() => expect(result.current.dataView).toBe(mockDataView));
  });

  it('does not fetch anything if siem and other feature ids are mixed together', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useAlertsDataView({
          ...mockServices,
          featureIds: [AlertConsumers.SIEM, AlertConsumers.LOGS],
        }),
      {
        wrapper,
      }
    );

    await waitFor(() =>
      expect(result.current).toEqual({
        isLoading: false,
        dataView: undefined,
      })
    );
    expect(mockFetchAlertsIndexNames).toHaveBeenCalledTimes(0);
    expect(mockFetchAlertsFields).toHaveBeenCalledTimes(0);
  });

  it('returns an undefined data view if any of the queries fails', async () => {
    mockFetchAlertsIndexNames.mockRejectedValue('error');

    const { result, waitFor } = renderHook(
      () => useAlertsDataView({ ...mockServices, featureIds: observabilityFeatureIds }),
      {
        wrapper,
      }
    );

    await waitFor(() =>
      expect(result.current).toEqual({
        isLoading: false,
        dataView: undefined,
      })
    );
  });

  it('shows an error toast if any of the queries fails', async () => {
    mockFetchAlertsIndexNames.mockRejectedValue('error');

    const { waitFor } = renderHook(
      () => useAlertsDataView({ ...mockServices, featureIds: observabilityFeatureIds }),
      {
        wrapper,
      }
    );

    await waitFor(() => expect(mockServices.toasts.addDanger).toHaveBeenCalled());
  });
});
