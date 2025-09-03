/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { RouteComponentProps } from 'react-router-dom';
import type { Storage } from '@kbn/kibana-utils-plugin/public';
import type { CoreStart } from '@kbn/core-lifecycle-browser';
import type { DataView } from '@kbn/data-views-plugin/common';
import type { PublicStartDependencies } from './plugin_dependencies';

export interface RenderAppParams {
  element: HTMLElement;
  history: RouteComponentProps['history'];
  isDevMode: boolean;
  networkInspectorDataView: DataView;
  services: {
    storage: Storage;
  } & PublicStartDependencies &
    Pick<
      CoreStart,
      'http' | 'application' | 'rendering' | 'uiSettings' | 'notifications' | 'docLinks'
    >;
}
