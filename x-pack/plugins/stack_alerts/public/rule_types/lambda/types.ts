/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { RuleTypeParams } from '@kbn/alerting-plugin/common';
import { LambdaAuthType } from './constants';

export interface Comparator {
  text: string;
  value: string;
  requiredValues: number;
}

export interface AggregationType {
  text: string;
  fieldRequired: boolean;
  value: string;
  validNormalizedTypes: string[];
}

export interface GroupByType {
  text: string;
  sizeRequired: boolean;
  value: string;
  validNormalizedTypes: string[];
}

export type TimeUnit = 's' | 'm' | 'h' | 'M';
export type TimeWithUnit = `${number}${TimeUnit}`;

export interface LambdaRuleParams extends RuleTypeParams {
  method: 'post' | 'put';
  url: string;
  username: string;
  password: string;
  authType: LambdaAuthType;
  additionalLookBackTime: TimeWithUnit;
}
