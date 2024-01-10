/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { isEqual } from 'lodash';
import {
  EuiContextMenuPanelDescriptor,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
} from '@elastic/eui';
import {
  Filter,
  Query,
  TimeRange,
  enableFilter,
  disableFilter,
  toggleFilterNegated,
  pinFilter,
  unpinFilter,
  compareFilters,
} from '@kbn/es-query';
import { i18n } from '@kbn/i18n';
import { METRIC_TYPE } from '@kbn/analytics';
import { useKibana } from '@kbn/kibana-react-plugin/public';
import {
  KIBANA_USER_QUERY_LANGUAGE_KEY,
  KQL_TELEMETRY_ROUTE_LATEST_VERSION,
  UI_SETTINGS,
} from '@kbn/data-plugin/common';
import type { SavedQueryService, SavedQuery } from '@kbn/data-plugin/public';
import { EuiContextMenuPanelItemDescriptor } from '@elastic/eui/src/components/context_menu/context_menu';
import { isQuickFiltersGroup, QuickFiltersMenuItem } from './quick_filters';
import type { IUnifiedSearchPluginServices } from '../types';
import { fromUser } from './from_user';
import { QueryLanguageSwitcher } from './language_switcher';
import { FilterPanelOption } from '../types';

const MAP_ITEMS_TO_FILTER_OPTION: Record<string, FilterPanelOption> = {
  'filter-sets-pinAllFilters': 'pinFilter',
  'filter-sets-unpinAllFilters': 'pinFilter',
  'filter-sets-enableAllFilters': 'disableFilter',
  'filter-sets-disableAllFilters': 'disableFilter',
  'filter-sets-invertAllFilters': 'negateFilter',
  'filter-sets-removeAllFilters': 'deleteFilter',
};

export const strings = {
  getLuceneLanguageName: () =>
    i18n.translate('unifiedSearch.query.queryBar.luceneLanguageName', {
      defaultMessage: 'Lucene',
    }),
  getKqlLanguageName: () =>
    i18n.translate('unifiedSearch.query.queryBar.kqlLanguageName', {
      defaultMessage: 'KQL',
    }),
  getOptionsAddFilterButtonLabel: () =>
    i18n.translate('unifiedSearch.filter.options.addFilterButtonLabel', {
      defaultMessage: 'Add filter',
    }),
  getOptionsApplyAllFiltersButtonLabel: () =>
    i18n.translate('unifiedSearch.filter.options.applyAllFiltersButtonLabel', {
      defaultMessage: 'Apply to all',
    }),
  getLoadOtherFilterSetLabel: () =>
    i18n.translate('unifiedSearch.filter.options.loadOtherFilterSetLabel', {
      defaultMessage: 'Load query',
    }),
  getLoadCurrentFilterSetLabel: () =>
    i18n.translate('unifiedSearch.filter.options.loadCurrentFilterSetLabel', {
      defaultMessage: 'Load query',
    }),
  getSaveAsNewFilterSetLabel: () =>
    i18n.translate('unifiedSearch.filter.options.saveAsNewFilterSetLabel', {
      defaultMessage: 'Save query',
    }),
  getSaveFilterSetLabel: () =>
    i18n.translate('unifiedSearch.filter.options.saveFilterSetLabel', {
      defaultMessage: 'Save query',
    }),
  getClearllFiltersButtonLabel: () =>
    i18n.translate('unifiedSearch.filter.options.clearllFiltersButtonLabel', {
      defaultMessage: 'Clear all',
    }),
  getSavedQueryPopoverSaveChangesButtonAriaLabel: (title?: string) =>
    i18n.translate('unifiedSearch.search.searchBar.savedQueryPopoverSaveChangesButtonAriaLabel', {
      defaultMessage: 'Save changes to {title}',
      values: { title },
    }),
  getSavedQueryPopoverSaveChangesButtonText: () =>
    i18n.translate('unifiedSearch.search.searchBar.savedQueryPopoverSaveChangesButtonText', {
      defaultMessage: 'Update query',
    }),
  getSavedQueryPopoverSaveAsNewButtonAriaLabel: () =>
    i18n.translate('unifiedSearch.search.searchBar.savedQueryPopoverSaveAsNewButtonAriaLabel', {
      defaultMessage: 'Save as new query',
    }),
  getSavedQueryPopoverSaveAsNewButtonText: () =>
    i18n.translate('unifiedSearch.search.searchBar.savedQueryPopoverSaveAsNewButtonText', {
      defaultMessage: 'Save as new',
    }),
  getSaveCurrentFilterSetLabel: () =>
    i18n.translate('unifiedSearch.filter.options.saveCurrentFilterSetLabel', {
      defaultMessage: 'Save as new',
    }),
  getApplyAllFiltersButtonLabel: () =>
    i18n.translate('unifiedSearch.filter.options.applyAllFiltersButtonLabel', {
      defaultMessage: 'Apply to all',
    }),
  getEnableAllFiltersButtonLabel: () =>
    i18n.translate('unifiedSearch.filter.options.enableAllFiltersButtonLabel', {
      defaultMessage: 'Enable all',
    }),
  getDisableAllFiltersButtonLabel: () =>
    i18n.translate('unifiedSearch.filter.options.disableAllFiltersButtonLabel', {
      defaultMessage: 'Disable all',
    }),
  getInvertNegatedFiltersButtonLabel: () =>
    i18n.translate('unifiedSearch.filter.options.invertNegatedFiltersButtonLabel', {
      defaultMessage: 'Invert inclusion',
    }),
  getPinAllFiltersButtonLabel: () =>
    i18n.translate('unifiedSearch.filter.options.pinAllFiltersButtonLabel', {
      defaultMessage: 'Pin all',
    }),
  getUnpinAllFiltersButtonLabel: () =>
    i18n.translate('unifiedSearch.filter.options.unpinAllFiltersButtonLabel', {
      defaultMessage: 'Unpin all',
    }),
  getFilterLanguageLabel: () =>
    i18n.translate('unifiedSearch.filter.options.filterLanguageLabel', {
      defaultMessage: 'Filter language',
    }),
  getQuickFiltersLabel: () =>
    i18n.translate('unifiedSearch.filter.options.quickFiltersLabel', {
      defaultMessage: 'Quick filters',
    }),
};

type ContextMenuItem =
  | EuiContextMenuPanelDescriptor
  | (EuiContextMenuPanelItemDescriptor & {
      width?: number;
    });

export interface QueryBarMenuPanelsProps {
  filters?: Filter[];
  quickFilters: QuickFiltersMenuItem[];
  savedQuery?: SavedQuery;
  language: string;
  dateRangeFrom?: string;
  dateRangeTo?: string;
  query?: Query;
  showSaveQuery?: boolean;
  showQueryInput?: boolean;
  showFilterBar?: boolean;
  savedQueryService: SavedQueryService;
  saveAsNewQueryFormComponent?: JSX.Element;
  manageFilterSetComponent?: JSX.Element;
  hiddenPanelOptions?: FilterPanelOption[];
  nonKqlMode?: 'lucene' | 'text';
  disableQueryLanguageSwitcher?: boolean;
  closePopover: () => void;
  onQueryBarSubmit: (payload: { dateRange: TimeRange; query?: Query }) => void;
  onFiltersUpdated?: (filters: Filter[]) => void;
  onClearSavedQuery?: () => void;
  onQueryChange: (payload: { dateRange: TimeRange; query?: Query }) => void;
  setRenderedComponent: (component: string) => void;
}

export function QueryBarMenuPanels({
  filters,
  quickFilters,
  savedQuery,
  language,
  dateRangeFrom,
  dateRangeTo,
  query,
  showSaveQuery,
  showFilterBar,
  showQueryInput,
  savedQueryService,
  saveAsNewQueryFormComponent,
  manageFilterSetComponent,
  hiddenPanelOptions,
  nonKqlMode,
  disableQueryLanguageSwitcher = false,
  closePopover,
  onQueryBarSubmit,
  onFiltersUpdated,
  onClearSavedQuery,
  onQueryChange,
  setRenderedComponent,
}: QueryBarMenuPanelsProps) {
  const kibana = useKibana<IUnifiedSearchPluginServices>();
  const { appName, usageCollection, uiSettings, http, storage } = kibana.services;
  const reportUiCounter = usageCollection?.reportUiCounter.bind(usageCollection, appName);
  const cancelPendingListingRequest = useRef<() => void>(() => {});

  const [savedQueries, setSavedQueries] = useState([] as SavedQuery[]);
  const [hasFiltersOrQuery, setHasFiltersOrQuery] = useState(false);
  const [savedQueryHasChanged, setSavedQueryHasChanged] = useState(false);

  const applyQuickFilter = useCallback(
    (filter: Filter) => {
      if (!filters?.some((f) => compareFilters(f, filter))) {
        onFiltersUpdated?.([...(filters ?? []), filter]);
      }
      closePopover();
    },
    [closePopover, filters, onFiltersUpdated]
  );

  const quickFiltersContextMenuData = useMemo(() => {
    let items = [] as EuiContextMenuPanelItemDescriptor[];
    const panels = [] as EuiContextMenuPanelDescriptor[];
    if (showFilterBar && quickFilters.length > 0) {
      let panelsCount = 0;
      const quickFiltersItemToContextMenuItem = (qf: QuickFiltersMenuItem) => {
        if (isQuickFiltersGroup(qf)) {
          const panelId = `quick_filter_group_${panelsCount++}`;
          panels.push({
            id: panelId,
            title: qf.groupName,
            items: qf.items.map(quickFiltersItemToContextMenuItem),
          });
          return {
            name: qf.groupName,
            icon: qf.icon ?? 'filterInCircle',
            panel: panelId,
          };
        } else {
          return {
            ...qf,
            icon: qf.icon ?? 'filterInCircle',
            onClick: () => {
              applyQuickFilter(qf.filter);
            },
          };
        }
      };
      items = quickFilters.map(quickFiltersItemToContextMenuItem);
    }
    return {
      items,
      panels,
    };
  }, [applyQuickFilter, quickFilters, showFilterBar]);

  useEffect(() => {
    const fetchSavedQueries = async () => {
      cancelPendingListingRequest.current();
      let requestGotCancelled = false;
      cancelPendingListingRequest.current = () => {
        requestGotCancelled = true;
      };

      const { queries: savedQueryItems } = await savedQueryService.findSavedQueries('');

      if (requestGotCancelled) return;

      setSavedQueries(savedQueryItems.reverse().slice(0, 5));
    };
    if (showQueryInput && showFilterBar) {
      fetchSavedQueries();
    }
  }, [savedQueryService, savedQuery, showQueryInput, showFilterBar]);

  useEffect(() => {
    if (savedQuery) {
      let filtersHaveChanged = filters?.length !== savedQuery.attributes?.filters?.length;
      if (filters?.length === savedQuery.attributes?.filters?.length) {
        filtersHaveChanged = Boolean(
          filters?.some(
            (filter, index) =>
              !isEqual(filter.query, savedQuery.attributes?.filters?.[index]?.query)
          )
        );
      }
      if (filtersHaveChanged || !isEqual(query, savedQuery?.attributes.query)) {
        setSavedQueryHasChanged(true);
      } else {
        setSavedQueryHasChanged(false);
      }
    }
  }, [filters, query, savedQuery, savedQuery?.attributes.filters, savedQuery?.attributes.query]);

  useEffect(() => {
    const hasFilters = Boolean(filters && filters.length > 0);
    const hasQuery = Boolean(query && query.query);
    setHasFiltersOrQuery(hasFilters || hasQuery);
  }, [filters, onClearSavedQuery, query, savedQuery]);

  const getDateRange = () => {
    const defaultTimeSetting = uiSettings!.get(UI_SETTINGS.TIMEPICKER_TIME_DEFAULTS);
    return {
      from: dateRangeFrom || defaultTimeSetting.from,
      to: dateRangeTo || defaultTimeSetting.to,
    };
  };

  const handleSave = useCallback(() => {
    setRenderedComponent('saveForm');
  }, [setRenderedComponent]);

  const onEnableAll = () => {
    reportUiCounter?.(METRIC_TYPE.CLICK, `filter:enable_all`);
    const enabledFilters = filters?.map(enableFilter);
    if (enabledFilters) {
      onFiltersUpdated?.(enabledFilters);
    }
  };

  const onDisableAll = () => {
    reportUiCounter?.(METRIC_TYPE.CLICK, `filter:disable_all`);
    const disabledFilters = filters?.map(disableFilter);
    if (disabledFilters) {
      onFiltersUpdated?.(disabledFilters);
    }
  };

  const onToggleAllNegated = () => {
    reportUiCounter?.(METRIC_TYPE.CLICK, `filter:invert_all`);
    const negatedFilters = filters?.map(toggleFilterNegated);
    if (negatedFilters) {
      onFiltersUpdated?.(negatedFilters);
    }
  };

  const onRemoveAll = () => {
    reportUiCounter?.(METRIC_TYPE.CLICK, `filter:remove_all`);
    onFiltersUpdated?.([]);
  };

  const onPinAll = () => {
    reportUiCounter?.(METRIC_TYPE.CLICK, `filter:pin_all`);
    const pinnedFilters = filters?.map(pinFilter);
    if (pinnedFilters) {
      onFiltersUpdated?.(pinnedFilters);
    }
  };

  const onUnpinAll = () => {
    reportUiCounter?.(METRIC_TYPE.CLICK, `filter:unpin_all`);
    const unPinnedFilters = filters?.map(unpinFilter);
    if (unPinnedFilters) {
      onFiltersUpdated?.(unPinnedFilters);
    }
  };

  const onQueryStringChange = (value: string) => {
    onQueryChange({
      query: { query: value, language },
      dateRange: getDateRange(),
    });
  };

  const onSelectLanguage = (lang: string) => {
    http.post('/internal/kql_opt_in_stats', {
      version: KQL_TELEMETRY_ROUTE_LATEST_VERSION,
      body: JSON.stringify({ opt_in: lang === 'kuery' }),
    });

    const storageKey = KIBANA_USER_QUERY_LANGUAGE_KEY;
    storage.set(storageKey!, lang);

    const newQuery = { query: '', language: lang };
    onQueryStringChange(newQuery.query);
    onQueryBarSubmit({
      query: { query: fromUser(newQuery.query), language: newQuery.language },
      dateRange: getDateRange(),
    });
  };

  const luceneLabel = strings.getLuceneLanguageName();
  const kqlLabel = strings.getKqlLanguageName();

  const filtersRelatedPanels: ContextMenuItem[] = [
    {
      name: strings.getOptionsAddFilterButtonLabel(),
      icon: 'plus',
      onClick: () => {
        setRenderedComponent('addFilter');
      },
    },
    {
      name: strings.getOptionsApplyAllFiltersButtonLabel(),
      icon: 'filter',
      panel: 2,
      disabled: !Boolean(filters && filters.length > 0),
      'data-test-subj': 'filter-sets-applyToAllFilters',
    },
  ];

  const queryAndFiltersRelatedPanels: ContextMenuItem[] = [
    {
      name: savedQuery
        ? strings.getLoadOtherFilterSetLabel()
        : strings.getLoadCurrentFilterSetLabel(),
      panel: 4,
      width: 350,
      icon: 'filter',
      'data-test-subj': 'saved-query-management-load-button',
      disabled: !savedQueries.length,
    },
    {
      name: savedQuery ? strings.getSaveAsNewFilterSetLabel() : strings.getSaveFilterSetLabel(),
      icon: 'save',
      disabled:
        !Boolean(showSaveQuery) || !hasFiltersOrQuery || (savedQuery && !savedQueryHasChanged),
      panel: 1,
      'data-test-subj': 'saved-query-management-save-button',
    },
    { isSeparator: true },
  ];

  const items: ContextMenuItem[] = [];
  // apply to all actions are only shown when there are filters
  if (showFilterBar) {
    items.push(...filtersRelatedPanels);
  }
  // clear all actions are only shown when there are filters or query
  if (showFilterBar || showQueryInput) {
    items.push(
      {
        name: strings.getClearllFiltersButtonLabel(),
        disabled: !hasFiltersOrQuery && !Boolean(savedQuery),
        icon: 'cross',
        'data-test-subj': 'filter-sets-removeAllFilters',
        onClick: () => {
          closePopover();
          onQueryBarSubmit({
            query: { query: '', language },
            dateRange: getDateRange(),
          });
          onRemoveAll();
          onClearSavedQuery?.();
        },
      },
      { isSeparator: true }
    );
  }

  if (showFilterBar && quickFilters.length > 0) {
    items.push(...[...quickFiltersContextMenuData.items, { isSeparator: true } as const]);
  }

  // saved queries actions are only shown when the showQueryInput and showFilterBar is true
  if (showQueryInput && showFilterBar) {
    items.push(...queryAndFiltersRelatedPanels);
  }

  // language menu appears when the showQueryInput is true
  if (showQueryInput && !disableQueryLanguageSwitcher) {
    items.push({
      name: `Language: ${language === 'kuery' ? kqlLabel : luceneLabel}`,
      panel: 3,
      'data-test-subj': 'switchQueryLanguageButton',
    });
  }

  let panels = [
    {
      id: 0,
      title: savedQuery?.attributes.title ? (
        <>
          <EuiFlexGroup direction="column" gutterSize="s">
            <EuiFlexItem grow={false}>
              <EuiText
                color={savedQuery ? 'primary' : 'default'}
                size="s"
                data-test-subj="savedQueryTitle"
              >
                <strong>{savedQuery.attributes.title}</strong>
              </EuiText>
            </EuiFlexItem>
            {savedQuery && savedQueryHasChanged && Boolean(showSaveQuery) && hasFiltersOrQuery && (
              <EuiFlexItem grow={false}>
                <EuiButton
                  size="s"
                  fill
                  onClick={handleSave}
                  aria-label={strings.getSavedQueryPopoverSaveChangesButtonAriaLabel(
                    savedQuery?.attributes.title
                  )}
                  data-test-subj="saved-query-management-save-changes-button"
                >
                  {strings.getSavedQueryPopoverSaveChangesButtonText()}
                </EuiButton>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </>
      ) : undefined,
      items,
    },
    {
      id: 1,
      title: strings.getSaveCurrentFilterSetLabel(),
      disabled: !Boolean(showSaveQuery),
      content: <div style={{ padding: 16 }}>{saveAsNewQueryFormComponent}</div>,
    },
    {
      id: 2,
      initialFocusedItemIndex: 1,
      title: strings.getApplyAllFiltersButtonLabel(),
      items: [
        {
          name: strings.getEnableAllFiltersButtonLabel(),
          icon: 'eye',
          'data-test-subj': 'filter-sets-enableAllFilters',
          onClick: () => {
            closePopover();
            onEnableAll();
          },
        },
        {
          name: strings.getDisableAllFiltersButtonLabel(),
          'data-test-subj': 'filter-sets-disableAllFilters',
          icon: 'eyeClosed',
          onClick: () => {
            closePopover();
            onDisableAll();
          },
        },
        {
          name: strings.getInvertNegatedFiltersButtonLabel(),
          'data-test-subj': 'filter-sets-invertAllFilters',
          icon: 'invert',
          onClick: () => {
            closePopover();
            onToggleAllNegated();
          },
        },
        {
          name: strings.getPinAllFiltersButtonLabel(),
          'data-test-subj': 'filter-sets-pinAllFilters',
          icon: 'pin',
          onClick: () => {
            closePopover();
            onPinAll();
          },
        },
        {
          name: strings.getUnpinAllFiltersButtonLabel(),
          'data-test-subj': 'filter-sets-unpinAllFilters',
          icon: 'pin',
          onClick: () => {
            closePopover();
            onUnpinAll();
          },
        },
      ],
    },
    {
      id: 3,
      title: strings.getFilterLanguageLabel(),
      content: (
        <QueryLanguageSwitcher
          language={language}
          onSelectLanguage={onSelectLanguage}
          nonKqlMode={nonKqlMode}
          isOnTopBarMenu={true}
          deps={{
            docLinks: kibana.services.docLinks,
          }}
        />
      ),
    },
    {
      id: 4,
      title: strings.getLoadCurrentFilterSetLabel(),
      width: 400,
      content: <div>{manageFilterSetComponent}</div>,
    },
    ...quickFiltersContextMenuData.panels,
  ] as EuiContextMenuPanelDescriptor[];

  if (hiddenPanelOptions && hiddenPanelOptions.length > 0) {
    panels = panels.map((panel) => ({
      ...panel,
      items: panel.items?.filter((panelItem) => {
        if (!panelItem['data-test-subj']) {
          return true;
        }
        const panelFilterOption = MAP_ITEMS_TO_FILTER_OPTION[panelItem['data-test-subj']];
        if (!panelFilterOption) {
          return true;
        }
        return !hiddenPanelOptions.includes(panelFilterOption);
      }),
    }));
  }

  return panels;
}
