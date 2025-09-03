/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { EuiBasicTable } from '@elastic/eui';
import { css } from '@emotion/react';
import type { EsNetworkRequest } from '../../types/request';

export const Headers = ({
  type,
  request,
}: {
  type: 'request' | 'response';
  request: EsNetworkRequest;
}) => {
  const headers = request[type].headers;
  const items = Object.entries(headers).map(([key, value]) => ({
    key,
    value: Array.isArray(value) ? value.join(', ') : value,
  }));

  if (items.length === 0) {
    return <div>No {type} headers</div>;
  }

  const columns = [
    {
      field: 'key',
      name: 'Header',
      sortable: true,
      truncateText: true,
    },
    {
      field: 'value',
      name: 'Value',
      sortable: false,
      truncateText: true,
    },
  ];

  return (
    <EuiBasicTable
      items={items}
      columns={columns}
      css={css`
        height: 100%;
        overflow-y: auto;
      `}
      compressed
    />
  );
};
