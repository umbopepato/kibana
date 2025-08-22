/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { css } from '@emotion/react';
import { useEuiTheme } from '@elastic/eui';

export const ConnectingLine = () => {
  const { euiTheme } = useEuiTheme();
  return (
    <div
      css={css`
        position: relative;
        overflow: hidden;
        width: 6px;
      `}
    >
      <div
        css={css`
          border-left: 2px solid ${euiTheme.colors.borderBaseSubdued};
          width: 0;
          height: 5rem;
          margin-left: 2px;
        `}
      />
      <div
        css={css`
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${euiTheme.colors.borderBaseSubdued};
          top: -3px;
        `}
      />
      <div
        css={css`
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${euiTheme.colors.borderBaseSubdued};
          bottom: -3px;
        `}
      />
    </div>
  );
};
