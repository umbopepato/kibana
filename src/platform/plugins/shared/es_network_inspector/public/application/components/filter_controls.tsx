/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { ComponentProps } from 'react';
import React, { useCallback } from 'react';
import type { Filter } from '@kbn/es-query';
import type { FilterControlConfig } from '@kbn/alerts-ui-shared';
import { FilterGroup } from '@kbn/alerts-ui-shared/src/alert_filter_controls/filter_group';
import { Storage } from '@kbn/kibana-utils-plugin/public';

const EMPTY_RULE_TYPE_IDS: string[] = [];

const DEFAULT_CONTROLS: FilterControlConfig[] = [
  {
    title: 'Method',
    fieldName: 'request.method.keyword',
    hideExclude: true,
    hideSort: true,
    placeholder: 'Filter by method',
    width: 'small',
    grow: true,
  },
  {
    title: 'Status code',
    fieldName: 'response.status_code.keyword',
    hideExclude: true,
    hideSort: true,
    placeholder: 'Filter by status code',
    width: 'small',
    grow: true,
  },
  {
    title: 'Index pattern',
    fieldName: 'index_pattern.keyword',
    hideExclude: true,
    hideSort: true,
    placeholder: 'Filter by index pattern',
    width: 'small',
    grow: true,
  },
  {
    title: 'Duration',
    fieldName: 'timing.duration',
    hideExclude: true,
    hideSort: true,
    hideExists: true,
    placeholder: 'Filter by duration',
    width: 'small',
    grow: true,
  },
];

export type FilterControlsProps = Omit<
  ComponentProps<typeof FilterGroup>,
  'defaultControls' | 'ruleTypeIds' | 'Storage'
> & {
  /**
   * An array of default control configurations
   */
  defaultControls?: FilterControlConfig[];
};

/**
 * A configurable filters bar based on the controls embeddable
 *
 * @example
 *
 * <FilterControls
 *   // Data view
 *   dataView={dataView}
 *   spaceId={spaceId}
 *   // Controls configuration
 *   controlsUrlState={filterControls}
 *   defaultControls={DEFAULT_CONTROLS}
 *   chainingSystem="HIERARCHICAL"
 *   // Filters state
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   // Dependencies
 *   ControlGroupRenderer={ControlGroupRenderer}
 * />
 */
export const FilterControls = ({
  defaultControls = DEFAULT_CONTROLS,
  dataViewId,
  onFiltersChange,
  ...restFilterItemGroupProps
}: FilterControlsProps) => {
  const handleFilterChanges = useCallback(
    (newFilters: Filter[]) => {
      if (!onFiltersChange) {
        return;
      }
      const updatedFilters = newFilters.map((filter) => {
        return {
          ...filter,
          meta: {
            ...filter.meta,
            disabled: false,
          },
        };
      });

      onFiltersChange(updatedFilters);
    },
    [onFiltersChange]
  );

  return (
    <FilterGroup
      dataViewId={dataViewId}
      ruleTypeIds={EMPTY_RULE_TYPE_IDS}
      {...restFilterItemGroupProps}
      onFiltersChange={handleFilterChanges}
      Storage={Storage}
      defaultControls={defaultControls}
    />
  );
};
