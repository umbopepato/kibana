/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { buildEsQuery, type Filter, type Query } from '@kbn/es-query';
import { firstValueFrom } from 'rxjs';
import type { DataView } from '@kbn/data-views-plugin/common';
import type { TimeRange } from '@kbn/data-plugin/common';
import type { SortOrder } from '@kbn/unified-data-table';
import type { RenderAppParams } from '../../types/app';

export interface SearchEsNetworkRequestsParams {
  dataView?: DataView;
  services: RenderAppParams['services'];
  query: Query;
  filters: Filter[];
  timeRange: TimeRange;
  pageIndex: number;
  pageSize: number;
  sort: SortOrder[];
}

export const searchEsNetworkRequests = async ({
  dataView,
  services,
  query,
  filters,
  timeRange,
  pageIndex,
  pageSize,
  sort,
}: SearchEsNetworkRequestsParams) => {
  if (!dataView) {
    return { rows: [], total: 0 };
  }

  const dsl = buildEsQuery(dataView, query, filters);

  let timeFilterQuery;
  if (dataView.timeFieldName && timeRange.from && timeRange.to) {
    timeFilterQuery = {
      range: {
        [dataView.timeFieldName]: {
          gte: timeRange.from,
          lte: timeRange.to,
          format: 'strict_date_optional_time',
        },
      },
    };
  }

  const body = {
    query: {
      bool: {
        must: [...(dsl ? [dsl] : []), ...(timeFilterQuery ? [timeFilterQuery] : [])],
      },
    },
    from: pageIndex * pageSize,
    size: pageSize,
    sort: sort.length
      ? sort.map(([col, dir]) => ({ [col]: { order: dir } }))
      : [{ [dataView.timeFieldName || '_score']: { order: 'desc' } }],
    _source: true /* columns.length ? columns : */,
  };

  const resp = await firstValueFrom(
    services.data.search.search({
      params: {
        index: dataView.getIndexPattern(),
        body,
      },
    })
  );

  const { total } = resp.rawResponse.hits;

  return {
    rows: resp.rawResponse.hits.hits,
    total: total ? (typeof total === 'number' ? total : total.value) : 0,
  };
};
