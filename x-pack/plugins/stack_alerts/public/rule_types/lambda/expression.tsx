/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { Fragment, useEffect, useState } from 'react';
import { RuleTypeParamsExpressionProps } from '@kbn/triggers-actions-ui-plugin/public';
import './expression.scss';
import {
  EuiFlexGroup,
  EuiFormRow,
  EuiFieldText,
  EuiFlexItem,
  EuiSelect,
  EuiSpacer,
  EuiCheckableCard,
  EuiFieldPassword,
  EuiFieldNumber,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { LambdaRuleParams, TimeUnit, TimeWithUnit } from './types';
import * as translations from './translations';
import { LambdaAuthType } from './constants';

const HTTP_VERBS = ['post', 'put'];

export const LambdaRuleTypeExpression: React.FunctionComponent<
  Omit<RuleTypeParamsExpressionProps<LambdaRuleParams>, 'unifiedSearch'>
> = ({ ruleParams, setRuleParams, setRuleProperty, errors }) => {
  const { method, url, authType, username, password, additionalLookBackTime } = ruleParams;
  const initialLookBackTime =
    additionalLookBackTime?.length > 1
      ? Number(additionalLookBackTime?.substring(0, additionalLookBackTime.length - 1))
      : null;
  const [lookBackTime, setLookBackTime] = useState(
    initialLookBackTime && !isNaN(initialLookBackTime) ? initialLookBackTime : 1
  );
  const [lookBackUnit, setLookBackUnit] = useState<TimeUnit>(
    (additionalLookBackTime?.at(-1) as TimeUnit) ?? 'm'
  );

  useEffect(() => {
    setRuleProperty('params', {
      method: ruleParams.method ?? 'post',
      url: ruleParams.url ?? '',
      authType: ruleParams.authType ?? LambdaAuthType.None,
      username: ruleParams.username ?? '',
      password: ruleParams.password ?? '',
      additionalLookBackTime: ruleParams.additionalLookBackTime ?? '1m',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRuleParams(
      'additionalLookBackTime',
      [lookBackTime ?? 1, lookBackUnit ?? 'm'].join('') as TimeWithUnit
    );
  }, [lookBackTime, lookBackUnit, setRuleParams]);

  const basicAuthFields = (
    <EuiFlexGroup justifyContent="spaceBetween">
      <EuiFlexItem>
        <EuiFormRow
          label={
            <FormattedMessage
              id="xpack.stackAlerts.lambda.ui.userTextFieldLabel"
              defaultMessage="Username"
            />
          }
          error={errors.username}
          isInvalid={!!errors.username?.length}
        >
          <EuiFieldText
            value={username}
            required
            onChange={({ target }) => setRuleParams('username', target.value)}
            isInvalid={!!errors.username?.length}
          />
        </EuiFormRow>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFormRow
          label={
            <FormattedMessage
              id="xpack.stackAlerts.lambda.ui.passwordTextFieldLabel"
              defaultMessage="Password"
            />
          }
          error={errors.password}
          isInvalid={!!errors.password?.length}
        >
          <EuiFieldPassword
            value={password}
            required
            onChange={({ target }) => setRuleParams('password', target.value)}
            isInvalid={!!errors.password?.length}
          />
        </EuiFormRow>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  return (
    <>
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiFormRow label={translations.METHOD_LABEL}>
            <EuiSelect
              value={method}
              defaultValue="post"
              onChange={({ target }) =>
                setRuleParams('method', target.value as LambdaRuleParams['method'])
              }
              options={HTTP_VERBS.map((verb) => ({ text: verb.toUpperCase(), value: verb }))}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow
            label={translations.URL_LABEL}
            fullWidth
            error={errors.url}
            isInvalid={!!errors.url?.length}
          >
            <EuiFieldText
              value={url}
              required
              placeholder={translations.URL_PLACEHOLDER}
              onChange={({ target }) => setRuleParams('url', target.value)}
              fullWidth
              isInvalid={!!errors.url?.length}
            />
          </EuiFormRow>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="m" />

      <EuiFormRow
        label={
          <FormattedMessage
            id="xpack.stackAlerts.lambda.ui.authenticationLabel"
            defaultMessage="Authentication"
          />
        }
        fullWidth
      >
        <>
          {[
            {
              value: LambdaAuthType.None,
              label: translations.AUTHENTICATION_NONE,
            },
            {
              value: LambdaAuthType.Basic,
              label: translations.AUTHENTICATION_BASIC,
              children: authType === LambdaAuthType.Basic && basicAuthFields,
            },
          ].map(({ label, value, children }) => (
            <Fragment key={`authRadioGroup-${value}`}>
              <EuiCheckableCard
                id={`authRadioGroup-${value}`}
                label={label}
                value={value}
                name="authRadioGroup"
                checked={authType === value}
                onChange={() => setRuleParams('authType', value)}
              >
                {children}
              </EuiCheckableCard>
              <EuiSpacer size="s" />
            </Fragment>
          ))}
        </>
      </EuiFormRow>

      <EuiSpacer size="m" />

      <EuiFlexItem>
        <EuiFormRow
          fullWidth
          data-test-subj="intervalFormRow"
          display="rowCompressed"
          isInvalid={!!errors.additionalLookBackTime?.length}
          error={errors.additionalLookBackTime}
        >
          <EuiFlexGroup gutterSize="s">
            <EuiFlexItem grow={2}>
              <EuiFieldNumber
                prepend={i18n.translate('xpack.stackAlerts.lambda.ui.additionalLookBackTime', {
                  defaultMessage: 'Look back time',
                })}
                fullWidth
                min={1}
                isInvalid={!!errors.additionalLookBackTime?.length}
                value={lookBackTime}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value !== '') {
                    const parsedValue = parseInt(value, 10);
                    if (!isNaN(parsedValue)) {
                      setLookBackTime(parsedValue);
                    }
                  }
                }}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={3}>
              <EuiSelect
                fullWidth
                value={lookBackUnit}
                options={[
                  {
                    text: 'second',
                    value: 's',
                  },
                  {
                    text: 'minute',
                    value: 'm',
                  },
                  {
                    text: 'hour',
                    value: 'h',
                  },
                  {
                    text: 'month',
                    value: 'M',
                  },
                ]}
                onChange={(e) => {
                  setLookBackUnit(e.target.value as TimeUnit);
                }}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFormRow>
      </EuiFlexItem>

      <EuiSpacer size="m" />
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export { LambdaRuleTypeExpression as default };
