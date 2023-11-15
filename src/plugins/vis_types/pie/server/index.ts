/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PluginConfigDescriptor, PluginInitializerContext } from '@kbn/core/server';
import { configSchema, PieConfig } from '../config';

export const config: PluginConfigDescriptor<PieConfig> = {
  exposeToBrowser: {
    readOnly: true,
  },
  schema: configSchema,
};

export const plugin = async (initializerContext: PluginInitializerContext) => {
  const { VisTypePieServerPlugin } = await import('./plugin');
  return new VisTypePieServerPlugin(initializerContext);
};
