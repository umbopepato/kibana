/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import {
  EuiButtonEmpty,
  EuiFlyout,
  EuiListGroupItem,
  EuiPanel,
  EuiToolTip,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyoutFooter,
  useEuiTheme,
  logicalCSS,
  EuiButton,
} from '@elastic/eui';
import { capitalize, groupBy } from 'lodash';
import React, { useRef, useState, useCallback, useMemo } from 'react';

import { AlertFieldCategoriesMap, AlertFieldCategory } from '@kbn/alerting-types';
import type { AlertField } from '@kbn/alerting-types';
import {
  type FieldListGroups,
  type FieldListItem,
  type GroupedFieldsParams,
  type FieldsGroup,
} from '@kbn/unified-field-list';
import { FieldList } from '@kbn/unified-field-list/src/components/field_list';
import { FieldListGrouped } from '@kbn/unified-field-list/src/components/field_list_grouped';
import { FieldNameSearch } from '@kbn/unified-field-list/src/components/field_list_filters/field_name_search';
import { useFieldFilters } from '@kbn/unified-field-list/src/hooks/use_field_filters';
import { ExistenceFetchStatus } from '@kbn/unified-field-list/src/types';
import { FieldIcon, getFieldIconType } from '@kbn/field-utils';
import { css } from '@emotion/react';
import { i18n } from '@kbn/i18n';
import { FieldCaption } from '../field_caption/field_caption';
import type { FieldBrowserProps } from '../../types';
import * as translations from '../../translations';
import { styles } from './field_browser.styles';
import { FieldName } from '../field_name';

const FIELDS_BUTTON_CLASS_NAME = 'fields-button';

/** wait this many ms after the user completes typing before applying the filter input */
export const INPUT_TIMEOUT = 250;

/**
 * Manages the state of the field browser
 */
export const FieldBrowserComponent: React.FC<FieldBrowserProps> = ({
  columnIds,
  alertFields,
  onResetColumns,
  onToggleColumn,
}) => {
  const customizeColumnsButtonRef = useRef<HTMLButtonElement | null>(null);
  /** show the field browser */
  const [show, setShow] = useState(false);

  /** Shows / hides the field browser */
  const onShow = useCallback(() => {
    setShow(true);
  }, []);

  /** Invoked when the field browser should be hidden */
  const onHide = useCallback(() => {
    setShow(false);
  }, []);

  return (
    <div css={styles.buttonContainer} data-test-subj="fields-browser-button-container">
      <EuiToolTip content={translations.FIELDS_BROWSER}>
        <EuiButtonEmpty
          aria-label={translations.FIELDS_BROWSER}
          buttonRef={customizeColumnsButtonRef}
          className={FIELDS_BUTTON_CLASS_NAME}
          color="text"
          data-test-subj="show-field-browser"
          iconType="tableOfContents"
          onClick={onShow}
          size="xs"
        >
          {translations.FIELDS}
        </EuiButtonEmpty>
      </EuiToolTip>

      {show && (
        <AlertFieldsFlyout
          onClose={onHide}
          alertFieldsByCategory={alertFields}
          selectedFieldIds={columnIds}
          onResetColumns={onResetColumns}
          onToggleColumn={onToggleColumn}
        />
      )}
    </div>
  );
};

const AlertFieldsFlyout = ({
  onClose,
  alertFieldsByCategory,
  selectedFieldIds,
  onResetColumns,
  onToggleColumn,
}: {
  onClose: () => void;
  alertFieldsByCategory: AlertFieldCategoriesMap;
  selectedFieldIds: string[];
  onResetColumns: FieldBrowserProps['onResetColumns'];
  onToggleColumn: FieldBrowserProps['onToggleColumn'];
}) => {
  const { euiTheme } = useEuiTheme();
  const allFields = (Object.values(alertFieldsByCategory) as AlertFieldCategory[]).flatMap(
    ({ fields }) => Object.values(fields)
  );
  const sortedSelectedFields = useMemo(
    // TODO make this resilient to missing fields
    () => selectedFieldIds.map((fid) => allFields.find(({ name }) => name === fid) as AlertField),
    [allFields, selectedFieldIds]
  );
  const { fieldListFiltersProps, fieldListGroupedProps } = useGroupedFields({
    allFields,
    alertFieldCategories: alertFieldsByCategory,
    sortedSelectedFields,
    getCustomFieldType: (field) => field.category,
  });

  return (
    <EuiFlyout onClose={() => onClose()} size="s" paddingSize="m" hideCloseButton side="left">
      {/* Not using EuiFlyoutBody here since the field list has to manage its virtual scrolling */}
      <FieldList
        isProcessing={alertFieldsByCategory == null}
        prepend={
          <EuiPanel hasShadow={false} paddingSize="s">
            <FieldNameSearch
              data-test-subj="fieldNameSearch"
              nameFilter={fieldListFiltersProps.nameFilter}
              onChange={fieldListFiltersProps.onChangeNameFilter}
            />
          </EuiPanel>
        }
      >
        <div
          css={css`
            display: flex;
            flex-grow: 1;
            flex-shrink: 1;
            ${logicalCSS('padding-left', euiTheme.size.s)}
          `}
        >
          <FieldListGrouped
            {...fieldListGroupedProps}
            fieldsExistenceStatus={ExistenceFetchStatus.succeeded}
            fieldsExistInIndex={true}
            renderFieldItem={({ field, fieldSearchHighlight }) => {
              const isFieldSelected = selectedFieldIds.includes(field.name);
              return (
                <EuiListGroupItem
                  showToolTip={false}
                  label={
                    <EuiFlexGroup
                      gutterSize="s"
                      alignItems={!field.metadata?.short ? 'center' : 'flexStart'}
                    >
                      <EuiFlexItem grow={false}>
                        <EuiToolTip
                          content={field.type}
                          anchorProps={{
                            css: css`
                              display: flex;
                            `,
                          }}
                        >
                          <FieldIcon type={getFieldIconType(field)} />
                        </EuiToolTip>
                      </EuiFlexItem>
                      <EuiFlexItem
                        css={css`
                          min-width: 0;
                        `}
                      >
                        <EuiFlexGroup direction="column" gutterSize="none">
                          <EuiFlexItem>
                            <FieldName highlight={fieldSearchHighlight}>{field.name}</FieldName>
                          </EuiFlexItem>
                          {field.metadata?.short && (
                            <EuiFlexItem>
                              <FieldCaption highlight={fieldSearchHighlight}>
                                {field.metadata?.short}
                              </FieldCaption>
                            </EuiFlexItem>
                          )}
                        </EuiFlexGroup>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  }
                  extraAction={{
                    iconType: isFieldSelected ? 'cross' : 'plusInCircle',
                    color: isFieldSelected ? 'danger' : 'text',
                    'aria-label': isFieldSelected ? 'Remove' : 'Add',
                  }}
                  onClick={() => {
                    onToggleColumn(field.name);
                  }}
                />
              );
            }}
          />
        </div>
      </FieldList>
      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButton
              onClick={() => {
                onResetColumns();
                onClose();
              }}
              iconType="eraser"
            >
              Reset to default columns
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={onClose} flush="right" iconType="cross">
              Close
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
};

const useGroupedFields = ({
  allFields,
  alertFieldCategories,
  sortedSelectedFields,
  getCustomFieldType,
}: Pick<
  GroupedFieldsParams<AlertField>,
  'allFields' | 'sortedSelectedFields' | 'getCustomFieldType'
> & {
  alertFieldCategories: AlertFieldCategoriesMap;
}) => {
  const fieldListFilters = useFieldFilters<AlertField>({
    allFields,
    services: { core: { docLinks: {} as any } }, // Unused
    getCustomFieldType,
  });

  const onFilterFieldList = fieldListFilters.onFilterField;

  const scrollToTopResetCounter: number = useMemo(
    () => Date.now(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onFilterFieldList]
  );

  const unfilteredFieldGroups: FieldListGroups<AlertField> = useMemo(() => {
    const selectedFields = sortedSelectedFields || [];

    const sortedFields = [...(allFields || [])].sort(sortFields);

    const groupedFields = groupBy(sortedFields, (field) => field.category);

    const fieldGroupDefinitions: FieldListGroups<AlertField> = {
      SelectedFields: {
        fields: selectedFields,
        fieldCount: selectedFields.length,
        isInitiallyOpen: true,
        showInAccordion: true,
        title: i18n.translate('unifiedFieldList.useGroupedFields.selectedFieldsLabel', {
          defaultMessage: 'Selected fields',
        }),
        hideDetails: false,
        hideIfEmpty: true,
        isAffectedByGlobalFilter: false,
        isAffectedByTimeFilter: false,
        forceOpenWithSearchResults: true,
      },
      ...Object.fromEntries(
        Object.keys(groupedFields).map((category): [string, FieldsGroup<AlertField>] => [
          category,
          {
            fields: groupedFields[category],
            fieldCount: groupedFields[category].length,
            isAffectedByGlobalFilter: false,
            isAffectedByTimeFilter: false,
            isInitiallyOpen: category === 'base',
            showInAccordion: true,
            title: alertFieldCategories[category]?.title ?? capitalize(category),
            hideDetails: true,
            hideIfEmpty: true,
            forceOpenWithSearchResults: true,
            helpText: alertFieldCategories[category]?.description,
          },
        ])
      ),
    };

    return fieldGroupDefinitions;
  }, [sortedSelectedFields, allFields, alertFieldCategories]);

  const fieldGroups: FieldListGroups<AlertField> = useMemo(() => {
    if (!onFilterFieldList) {
      return unfilteredFieldGroups;
    }

    return Object.fromEntries(
      Object.entries(unfilteredFieldGroups).map(([name, group]) => [
        name,
        {
          ...group,
          fieldSearchHighlight: fieldListFilters.fieldSearchHighlight,
          fields: group.fields.filter(onFilterFieldList),
        },
      ])
    ) as FieldListGroups<AlertField>;
  }, [unfilteredFieldGroups, onFilterFieldList, fieldListFilters.fieldSearchHighlight]);

  const screenReaderDescriptionId =
    fieldListFilters.fieldListFiltersProps.screenReaderDescriptionId;
  const fieldListGroupedProps = useMemo(() => {
    return {
      fieldGroups,
      scrollToTopResetCounter,
      screenReaderDescriptionId,
    };
  }, [fieldGroups, scrollToTopResetCounter, screenReaderDescriptionId]);

  return {
    fieldListGroupedProps,
    fieldListFiltersProps: fieldListFilters.fieldListFiltersProps,
  };
};

const collator = new Intl.Collator(undefined, {
  sensitivity: 'base',
});

function sortFields<T extends FieldListItem>(fieldA: T, fieldB: T) {
  return collator.compare(fieldA.displayName || fieldA.name, fieldB.displayName || fieldB.name);
}

export const FieldBrowser = React.memo(FieldBrowserComponent);
