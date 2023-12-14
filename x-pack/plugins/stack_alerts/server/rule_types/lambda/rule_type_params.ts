/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema, TypeOf } from '@kbn/config-schema';

export type Params = TypeOf<typeof ParamsSchema>;

export const ParamsSchema = schema.object({
  method: schema.string(),
  url: schema.uri(),
  authType: schema.string(),
  username: schema.maybe(schema.string({ minLength: 1 })),
  password: schema.maybe(schema.string({ minLength: 1 })),
});
