/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import { ValidationResult } from '@kbn/triggers-actions-ui-plugin/public';
import { isUrl } from '@kbn/es-ui-shared-plugin/static/validators/string';
import { LambdaAuthType } from './constants';
import { LambdaRuleParams } from './types';

const REQUIRED_FIELDS = ['method', 'url', 'additionalLookBackTime'] as Array<
  keyof LambdaRuleParams
>;
const REQUIRED_BASIC_AUTH_FIELDS = ['username', 'password'] as Array<keyof LambdaRuleParams>;
const REQUIRED_FIELD_MESSAGE = i18n.translate('xpack.stackAlerts.lambda.ui.requiredField', {
  defaultMessage: 'This field is required.',
});

export const validateExpression = (ruleParams: LambdaRuleParams): ValidationResult => {
  const { url, authType, additionalLookBackTime } = ruleParams;
  const validationResult = { errors: {} };
  const errors: Record<keyof LambdaRuleParams, string[]> = {
    method: new Array<string>(),
    url: new Array<string>(),
    authType: new Array<string>(),
    username: new Array<string>(),
    password: new Array<string>(),
    additionalLookBackTime: new Array<string>(),
  };
  validationResult.errors = errors;

  REQUIRED_FIELDS.forEach((f) => {
    if (!ruleParams[f]) {
      errors[f].push(REQUIRED_FIELD_MESSAGE);
    }
  });

  if (authType === LambdaAuthType.Basic) {
    REQUIRED_BASIC_AUTH_FIELDS.forEach((f) => {
      if (!ruleParams[f]) {
        errors[f].push(REQUIRED_FIELD_MESSAGE);
      }
    });
  }

  if (url && !isUrl(url)) {
    errors.url.push(
      i18n.translate('xpack.stackAlerts.lambda.ui.urlInvalid', {
        defaultMessage: 'This is not a valid url.',
      })
    );
  }

  if (additionalLookBackTime.length > 1) {
    const unit = additionalLookBackTime.at(-1);
    if (!['s', 'm', 'h', 'M'].includes(unit!)) {
      errors.additionalLookBackTime.push(
        i18n.translate('xpack.stackAlerts.lambda.ui.invalidTimeUnit', {
          defaultMessage: 'Invalid time unit.',
        })
      );
    }
    const time = parseInt(
      additionalLookBackTime.substring(0, additionalLookBackTime.length - 1),
      10
    );
    if (isNaN(time) || time < 1) {
      errors.additionalLookBackTime.push(
        i18n.translate('xpack.stackAlerts.lambda.ui.invalidTime', {
          defaultMessage: 'Invalid time.',
        })
      );
    }
  }

  return validationResult;
};
