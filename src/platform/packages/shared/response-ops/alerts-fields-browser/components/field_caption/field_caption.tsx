/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { EuiHighlight, EuiText, EuiToolTip } from '@elastic/eui';
import { css } from '@emotion/react';

/** Renders a field caption */
export const FieldCaption = React.memo<{
  children: string;
  highlight?: string;
}>(({ children, highlight = '' }) => {
  return (
    <EuiToolTip content={children}>
      <EuiText
        size="xs"
        css={css`
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `}
        color="subdued"
      >
        <EuiHighlight data-test-subj={`field-${children}-caption`} search={highlight}>
          {children}
        </EuiHighlight>
      </EuiText>
    </EuiToolTip>
  );
});

FieldCaption.displayName = 'FieldCaption';
