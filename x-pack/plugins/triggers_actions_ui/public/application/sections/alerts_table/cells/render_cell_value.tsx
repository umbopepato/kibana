/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { isEmpty } from 'lodash';
import React, { type ReactNode } from 'react';
import {
  ALERT_DURATION,
  ALERT_RULE_NAME,
  ALERT_RULE_UUID,
  ALERT_START,
  TIMESTAMP,
} from '@kbn/rule-data-utils';
import {
  FIELD_FORMAT_IDS,
  FieldFormatParams,
  FieldFormatsRegistry,
} from '@kbn/field-formats-plugin/common';
import { EuiLink } from '@elastic/eui';
import { GetRenderCellValue } from '../../../../types';
import { useKibana } from '../../../../common/lib/kibana';

interface Props {
  columnId: string;
  data: any;
}

export const getMappedNonEcsValue = ({
  data,
  fieldName,
}: {
  data: any[];
  fieldName: string;
}): string[] | undefined => {
  const item = data.find((d) => d.field === fieldName);
  if (item != null && item.value != null) {
    return item.value;
  }
  return undefined;
};

const getRenderValue = (mappedNonEcsValue: any) => {
  const value = Array.isArray(mappedNonEcsValue) ? mappedNonEcsValue.join() : mappedNonEcsValue;

  if (!isEmpty(value)) {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value;
  }

  return '—';
};

export const getRenderCellValue = (fieldFormats: FieldFormatsRegistry): GetRenderCellValue => {
  const alertValueFormatter = getAlertFormatters(fieldFormats);

  return () =>
    (props): ReactNode => {
      const { columnId, data } = props as Props;
      if (data == null) return null;

      const mappedNonEcsValue = getMappedNonEcsValue({
        data,
        fieldName: columnId,
      });
      const value = getRenderValue(mappedNonEcsValue);

      return alertValueFormatter(columnId, value, data);
    };
};

const defaultParam: Record<string, FieldFormatParams> = {
  [FIELD_FORMAT_IDS.DURATION]: {
    inputFormat: 'milliseconds',
    outputFormat: 'humanizePrecise',
  },
  [FIELD_FORMAT_IDS.NUMBER]: {
    pattern: '00.00',
  },
};

export const getFieldFormatterProvider =
  (fieldFormats: FieldFormatsRegistry) =>
  (fieldType: FIELD_FORMAT_IDS, params?: FieldFormatParams) => {
    const fieldFormatter = fieldFormats.deserialize({
      id: fieldType,
      params: params ?? defaultParam[fieldType],
    });
    return fieldFormatter.convert.bind(fieldFormatter);
  };

export function useFieldFormatter(fieldType: FIELD_FORMAT_IDS) {
  const { fieldFormats } = useKibana().services;
  return getFieldFormatterProvider(fieldFormats as FieldFormatsRegistry)(fieldType);
}

const AlertRuleLink = ({ alertFields }: { alertFields: Array<{ field: string; value: any }> }) => {
  const { http } = useKibana().services;
  const ruleName = alertFields.find((f) => f.field === ALERT_RULE_NAME)?.value?.[0];
  const ruleUuid = alertFields.find((f) => f.field === ALERT_RULE_UUID)?.value?.[0];

  if (!ruleName || !ruleUuid) {
    return null;
  }

  return (
    <EuiLink
      href={http.basePath.prepend(
        `/app/management/insightsAndAlerting/triggersActions/rule/${ruleUuid}`
      )}
    >
      {ruleName}
    </EuiLink>
  );
};

export function getAlertFormatters(fieldFormats: FieldFormatsRegistry) {
  const getFormatter = getFieldFormatterProvider(fieldFormats);

  return (columnId: string, value: any, rowData?: any): React.ReactElement => {
    switch (columnId) {
      case TIMESTAMP:
      case ALERT_START:
        return <>{getFormatter(FIELD_FORMAT_IDS.DATE)(value)}</>;
      case ALERT_RULE_NAME:
        return <AlertRuleLink alertFields={rowData} />;
      case ALERT_DURATION:
        return (
          <>
            {getFormatter(FIELD_FORMAT_IDS.DURATION, {
              inputFormat: 'microseconds',
              outputFormat: 'humanizePrecise',
            })(value) || '--'}
          </>
        );
      default:
        return <>{value}</>;
    }
  };
}

export type RegisterFormatter = ReturnType<typeof getAlertFormatters>;
