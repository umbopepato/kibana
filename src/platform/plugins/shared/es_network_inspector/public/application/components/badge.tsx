/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import type { EuiBadgeProps } from '@elastic/eui';
import { EuiBadge, useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import { asEuiThemeColorsKey } from '../utils/as_eui_theme_colors_key';

export const Badge = ({ color = 'plain', ...props }: EuiBadgeProps) => {
  const { euiTheme } = useEuiTheme();
  const capitalizedColor = color.charAt(0).toUpperCase() + color.slice(1);
  return (
    <EuiBadge
      {...props}
      css={css`
        margin-top: -4px;
        padding: 0 4px;
        border-width: 1px;
        border-style: solid;
        background: ${euiTheme.colors[asEuiThemeColorsKey(`backgroundBase${capitalizedColor}`)]};
        border-color: ${euiTheme.colors[asEuiThemeColorsKey(`borderBase${capitalizedColor}`)]};
        color: ${euiTheme.colors[asEuiThemeColorsKey(color)]};
        font-weight: ${euiTheme.font.weight.bold};
        border-radius: ${euiTheme.border.radius.medium};
      `}
    />
  );
};
