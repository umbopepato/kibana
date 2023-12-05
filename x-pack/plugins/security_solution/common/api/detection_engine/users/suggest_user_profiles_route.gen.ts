/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { z } from 'zod';

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 */

export type SuggestUserProfilesRequestQuery = z.infer<typeof SuggestUserProfilesRequestQuery>;
export const SuggestUserProfilesRequestQuery = z.object({
  /**
   * Query string used to match name-related fields in user profiles. The following fields are treated as name-related: username, full_name and email
   */
  searchTerm: z.string().optional(),
});
export type SuggestUserProfilesRequestQueryInput = z.input<typeof SuggestUserProfilesRequestQuery>;
