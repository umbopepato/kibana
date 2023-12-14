/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { Fragment, useEffect } from 'react';
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
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { LambdaRuleParams } from './types';
import * as i18n from './translations';
import { LambdaAuthType } from './constants';

const HTTP_VERBS = ['post', 'put'];

export const LambdaRuleTypeExpression: React.FunctionComponent<
  Omit<RuleTypeParamsExpressionProps<LambdaRuleParams>, 'unifiedSearch'>
> = ({ ruleParams, setRuleParams, setRuleProperty, errors }) => {
  const { method, url, authType, username, password } = ruleParams;

  useEffect(() => {
    setRuleProperty('params', {
      method: ruleParams.method ?? 'post',
      url: ruleParams.url ?? '',
      authType: ruleParams.authType ?? LambdaAuthType.None,
      username: ruleParams.username ?? '',
      password: ruleParams.password ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <EuiFormRow label={i18n.METHOD_LABEL}>
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
            label={i18n.URL_LABEL}
            fullWidth
            error={errors.url}
            isInvalid={!!errors.url?.length}
          >
            <EuiFieldText
              value={url}
              required
              placeholder={i18n.URL_PLACEHOLDER}
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
              label: i18n.AUTHENTICATION_NONE,
            },
            {
              value: LambdaAuthType.Basic,
              label: i18n.AUTHENTICATION_BASIC,
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
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export { LambdaRuleTypeExpression as default };
