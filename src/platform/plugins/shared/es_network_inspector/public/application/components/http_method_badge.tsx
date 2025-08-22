/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { EuiText, useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import { asEuiThemeColorsKey } from '../utils/as_eui_theme_colors_key';

export const HttpMethodBadge = ({ method }: { method: string }) => {
  const { euiTheme } = useEuiTheme();
  const color =
    {
      GET: 'accentSecondary',
      POST: 'primary',
      PUT: 'warning',
      PATCH: 'risk',
      DELETE: 'accent',
    }[method] ?? 'neutral';
  const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1);
  return (
    <EuiText
      size="xs"
      css={css`
        font-weight: ${euiTheme.font.weight.bold};
        color: ${euiTheme.colors[asEuiThemeColorsKey(`text${capitalizedColor}`)]};
      `}
    >
      {method}
    </EuiText>
  );
};
