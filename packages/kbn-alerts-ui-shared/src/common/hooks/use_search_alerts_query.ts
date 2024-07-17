/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { useQuery } from '@tanstack/react-query';

import { SetOptional } from 'type-fest';
import { searchAlerts, type SearchAlertsParams } from '../apis/search_alerts/search_alerts';
import { DEFAULT_ALERTS_PAGE_SIZE } from '../constants';
import { AlertsQueryContext } from '../contexts/alerts_query_context';

export type UseSearchAlertsQueryParams = SetOptional<
  Omit<SearchAlertsParams, 'signal'>,
  'query' | 'sort' | 'pageIndex' | 'pageSize'
>;

export const searchAlertsQueryPrefix = ['alerts', searchAlerts.name];

/**
 * Query alerts
 *
 * When testing components that depend on this hook, prefer mocking the `searchAlerts` function instead of the hook itself.
 * @external https://tanstack.com/query/v4/docs/framework/react/guides/testing
 */
export const useSearchAlertsQuery = ({ data, ...params }: UseSearchAlertsQueryParams) => {
  const {
    featureIds,
    fields,
    query = {
      bool: {},
    },
    sort = [
      {
        '@timestamp': 'desc',
      },
    ],
    runtimeMappings,
    pageIndex = 0,
    pageSize = DEFAULT_ALERTS_PAGE_SIZE,
  } = params;
  return useQuery({
    queryKey: searchAlertsQueryPrefix.concat(JSON.stringify(params)),
    queryFn: ({ signal }) =>
      searchAlerts({
        data,
        signal,
        featureIds,
        fields,
        query,
        sort,
        runtimeMappings,
        pageIndex,
        pageSize,
      }),
    // To avoid flash of loading state with pagination, see https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries#better-paginated-queries-with-placeholderdata
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    context: AlertsQueryContext,
    initialData: {
      total: -1,
      alerts: [],
      oldAlertsData: [],
      ecsAlertsData: [],
    },
    enabled: featureIds.length > 0,
  });
};
