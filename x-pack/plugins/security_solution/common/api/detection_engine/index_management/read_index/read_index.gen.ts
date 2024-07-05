/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Get alerts index name API endpoint
 *   version: 2023-10-31
 */

import { z } from 'zod';

export type GetAlertsIndexResponse = z.infer<typeof GetAlertsIndexResponse>;
export const GetAlertsIndexResponse = z.object({
  name: z.string(),
  index_mapping_outdated: z.boolean().nullable(),
});
