/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema, TypeOf } from '@kbn/config-schema';
import { CoreQueryParamsSchemaProperties } from '@kbn/triggers-actions-ui-plugin/server';

// rule type parameters

export type Params = TypeOf<typeof ParamsSchema>;

export const ParamsSchema = schema.object({
  ...CoreQueryParamsSchemaProperties,
  url: schema.uri(),
  username: schema.string({ minLength: 1 }),
  password: schema.string({ minLength: 1 }),
});
