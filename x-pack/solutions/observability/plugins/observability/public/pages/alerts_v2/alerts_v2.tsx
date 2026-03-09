/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { useFetchRules } from '@kbn/alerting-v2-plugin/public';

export function AlertsV2Page() {
  const { data: rules, isLoading: isLoadingRules } = useFetchRules({
    page: 0,
    perPage: 10000,
  });

  return (
    <div>
      {i18n.translate('xpack.observability.alertsV2Page.div.testingDILabel', {
        defaultMessage: 'Testing DI',
      })}
    </div>
  );
}
