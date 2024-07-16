/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { IFieldSubType } from '@kbn/es-query';
import type { RuntimeField } from '@kbn/data-views-plugin/common';

export interface BrowserField {
  aggregatable: boolean;
  category: string;
  description?: string | null;
  example?: string | number | null;
  fields: Readonly<Record<string, Partial<BrowserField>>>;
  format?: string;
  indexes: string[];
  name: string;
  searchable: boolean;
  type: string;
  subType?: IFieldSubType;
  readFromDocValues: boolean;
  runtimeField?: RuntimeField;
}

export type BrowserFields = Record<string, Partial<BrowserField>>;
