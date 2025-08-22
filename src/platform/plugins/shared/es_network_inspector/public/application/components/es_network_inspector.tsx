/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiText,
  EuiTitle,
  logicalCSS,
  useEuiTheme,
} from '@elastic/eui';
import type { DataView } from '@kbn/data-views-plugin/public';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import type { Query, TimeRange } from '@kbn/data-plugin/common';
import { SearchBar } from '@kbn/unified-search-plugin/public';
import type { SortOrder } from '@kbn/unified-data-table';
import { DataLoadingState, OPEN_DETAILS, UnifiedDataTable } from '@kbn/unified-data-table';
import { ControlGroupRenderer } from '@kbn/controls-plugin/public';
import { type Filter } from '@kbn/es-query';
import { CellActionsProvider } from '@kbn/cell-actions';
import { useInfiniteQuery } from '@tanstack/react-query';
import { map } from 'rxjs';
import type { DataTableRecord } from '@kbn/discover-utils';
import { buildDataTableRecordList } from '@kbn/discover-utils';
import { css } from '@emotion/react';
import useObservable from 'react-use/lib/useObservable';
import { Badge } from './badge';
import type { RenderAppParams } from '../../types/app';
import { FilterControls } from './filter_controls';
import { searchEsNetworkRequests } from '../apis/search_es_network_requests';
import { asEuiThemeColorsKey } from '../utils/as_eui_theme_colors_key';

export const EsNetworkInspector = () => {
  const { services } = useKibana<RenderAppParams['services']>();
  const { euiTheme } = useEuiTheme();
  const activeSpaceId = useObservable(
    services.spaces.getActiveSpace$().pipe(map(({ id }) => id)),
    undefined
  );

  // DataView loading
  const [dataView, setDataView] = useState<DataView>();

  useEffect(() => {
    let mounted = true;
    services.dataViews.getDefault().then((dv: DataView | null) => {
      if (mounted && dv) {
        setDataView(dv);
      }
    });
    return () => {
      mounted = false;
    };
  }, [services.dataViews]);

  // KQL bar state
  const [query, setQuery] = useState<Query>({ language: 'kuery', query: '' });
  const [timeRange, setTimeRange] = useState<TimeRange>(() =>
    services.data.query.timefilter.timefilter.getTime()
  );

  // Controls bar state
  const [filters, setFilters] = useState<Filter[]>([]);

  // Table state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(100);
  const [sort, setSort] = useState<SortOrder[]>([['@timestamp', 'desc']]);
  const [columns, setColumns] = useState<string[]>([
    'method',
    'url',
    'status_code',
    'index_pattern',
    'duration',
  ]);
  const [expandedDoc, setExpandedDoc] = useState<DataTableRecord>();

  const {
    data: esData,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    enabled: !!dataView,
    queryKey: [
      'es-network-requests',
      dataView?.id,
      query,
      timeRange,
      filters,
      pageSize,
      sort,
      columns,
    ],
    queryFn: () =>
      searchEsNetworkRequests({
        dataView,
        services,
        query,
        filters,
        timeRange,
        pageIndex,
        pageSize,
        sort,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const nextPageIndex = allPages.length;
      return allPages.reduce((acc, page) => acc + page.rows.length, 0) < lastPage.total
        ? nextPageIndex
        : undefined;
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    setPageIndex((esData?.pages?.length ?? 1) - 1);
  }, [esData?.pages?.length]);

  const onFiltersChange = useCallback((nextFilters: Filter[]) => {
    setFilters(nextFilters);
    setPageIndex(0);
  }, []);

  const onQuerySubmit = useCallback(
    ({ query: nextQuery, dateRange }: { query?: Query; dateRange?: TimeRange }) => {
      if (nextQuery) setQuery(nextQuery);
      if (dateRange) setTimeRange(dateRange);
      setPageIndex(0);
    },
    []
  );

  const onSetColumns = useCallback((cols: string[], _hideTimeCol: boolean) => {
    setColumns(cols);
  }, []);

  const onSort = useCallback((nextSort: string[][]) => {
    setSort(nextSort as SortOrder[]);
    setPageIndex(0);
  }, []);

  const unifiedDataTableServices = useMemo(
    () => ({
      theme: services.theme,
      fieldFormats: services.fieldFormats,
      uiSettings: services.uiSettings,
      dataViewFieldEditor: services.dataViewFieldEditor,
      toastNotifications: services.notifications?.toasts,
      storage: services.storage,
      data: services.data,
    }),
    [services]
  );

  const rows = useMemo(
    () =>
      buildDataTableRecordList({
        records: esData?.pages?.flatMap((p) => p.rows) ?? [],
        dataView,
      }),
    [dataView, esData?.pages]
  );

  const renderDocumentView = useCallback(
    (hit: DataTableRecord) => {
      if (!dataView) {
        return undefined;
      }

      return (
        <EuiFlyout onClose={() => setExpandedDoc(undefined)}>
          <EuiFlyoutHeader>
            <EuiTitle>
              <h2>Request detail</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>{JSON.stringify(hit)}</EuiFlyoutBody>
        </EuiFlyout>
      );
    },
    [dataView]
  );

  if (!dataView) {
    return null;
  }

  return (
    <CellActionsProvider
      getTriggerCompatibleActions={services.uiActions.getTriggerCompatibleActions}
    >
      <EuiFlexGroup direction="column" gutterSize="none">
        {/* KQL Bar */}
        <EuiFlexItem grow={false}>
          <SearchBar
            showQueryInput
            showDatePicker
            showSubmitButton
            disableQueryLanguageSwitcher
            showFilterBar={false}
            query={query}
            dateRangeFrom={timeRange.from}
            dateRangeTo={timeRange.to}
            onQuerySubmit={onQuerySubmit}
            indexPatterns={[dataView]}
            isLoading={isLoading}
            placeholder="Search Elasticsearch requests"
            showQueryMenu={false}
          />
        </EuiFlexItem>

        {/* Controls Bar */}
        <EuiFlexItem
          grow={false}
          css={css`
            ${logicalCSS('padding-horizontal', euiTheme.size.s)};
          `}
        >
          <FilterControls
            spaceId={activeSpaceId}
            dataViewId={dataView?.id ?? null}
            chainingSystem="HIERARCHICAL"
            timeRange={timeRange}
            query={query}
            filters={filters}
            onFiltersChange={onFiltersChange}
            ControlGroupRenderer={ControlGroupRenderer}
          />
        </EuiFlexItem>

        {/* UnifiedDataTable */}
        <EuiFlexItem
          css={css`
            flex: 1 1 0;
            min-height: 0;
            padding: ${euiTheme.size.s};
          `}
        >
          <UnifiedDataTable
            css={css`
              border-radius: ${euiTheme.border.radius.medium};
              border: ${euiTheme.border.thin};
              overflow: hidden;
            `}
            ariaLabelledBy="esRequestsLogTable"
            // Columns
            dataView={dataView}
            columns={
              columns.length
                ? columns
                : dataView.fields
                    .filter((f) => f.name !== '_id')
                    .slice(0, 5)
                    .map((f) => f.name)
            }
            onSetColumns={onSetColumns}
            showTimeCol={!!dataView.timeFieldName}
            controlColumnIds={[OPEN_DETAILS]}
            customGridColumnsConfiguration={{
              method: (props) => ({
                ...props.column,
                initialWidth: 70,
              }),
              status_code: (props) => ({
                ...props.column,
                initialWidth: 90,
              }),
            }}
            externalCustomRenderers={{
              method: (props) => {
                const method = props.row.flattened[props.columnId] as string;
                const color =
                  {
                    GET: 'accentSecondary',
                    POST: 'primary',
                    PUT: 'warning',
                    PATCH: 'risk',
                    DELETE: 'accent',
                  }[method] ?? 'neutral';
                const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1);
                return (
                  <EuiText
                    size="xs"
                    css={css`
                      font-weight: ${euiTheme.font.weight.bold};
                      color: ${euiTheme.colors[asEuiThemeColorsKey(`text${capitalizedColor}`)]};
                    `}
                  >
                    {method}
                  </EuiText>
                );
              },
              status_code: (props) => {
                const statusCode: number = Number(props.row.flattened[props.columnId]);
                return (
                  <Badge
                    color={
                      statusCode < 200
                        ? 'plain'
                        : statusCode < 300
                        ? 'success'
                        : statusCode < 500
                        ? 'danger'
                        : 'plain'
                    }
                  >
                    {statusCode}
                  </Badge>
                );
              },
            }}
            // Data
            rows={rows}
            totalHits={esData?.pages?.[0]?.total ?? 0}
            loadingState={isLoading ? DataLoadingState.loading : DataLoadingState.loaded}
            // Pagination
            isPaginationEnabled
            paginationMode="singlePage"
            rowsPerPageState={pageSize}
            onFetchMoreRecords={hasNextPage ? () => fetchNextPage() : undefined}
            sampleSizeState={0}
            // Sorting
            isSortEnabled
            sort={sort}
            onSort={onSort}
            // Rows
            configRowHeight={1}
            // Row details
            renderDocumentView={renderDocumentView}
            expandedDoc={expandedDoc}
            setExpandedDoc={setExpandedDoc}
            // Dependencies
            services={unifiedDataTableServices}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </CellActionsProvider>
  );
};
