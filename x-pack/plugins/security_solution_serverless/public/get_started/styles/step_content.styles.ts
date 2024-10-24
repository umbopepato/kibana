/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useEuiShadow, useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import { useMemo } from 'react';

export const LEFT_CONTENT_PANEL_WIDTH = 486;
export const RIGHT_CONTENT_PANEL_WIDTH = 510;
export const RIGHT_CONTENT_HEIGHT = 320;
export const RIGHT_CONTENT_WIDTH = 480;

export const useStepContentStyles = () => {
  const { euiTheme } = useEuiTheme();
  const imageShadow = useEuiShadow('s');

  const customStyles = useMemo(
    () => ({
      stepContentGroupStyles: css`
        &.step-content-group {
          justify-content: space-between;
          margin-top: ${euiTheme.size.l};
          padding: ${euiTheme.size.l};
          transition: opacity ${euiTheme.animation.normal};
          overflow: hidden;
          border: 1px solid ${euiTheme.colors.lightShade};
          border-radius: ${euiTheme.border.radius.medium};
        }
      `,
      leftContentStyles: css`
        &.left-panel {
          padding: 0 0 0 ${euiTheme.size.s};
          width: ${LEFT_CONTENT_PANEL_WIDTH}px;
        }
      `,
      descriptionStyles: css`
        &.step-content-description {
          margin-bottom: 0px;
          margin-block-end: 0px !important;
          line-height: ${euiTheme.size.l};

          .step-paragraph {
            margin-top: ${euiTheme.size.xl};
          }
        }
      `,
      rightPanelStyles: css`
        &.right-panel {
          padding: 0 6px 0 ${euiTheme.size.l};
          width: ${RIGHT_CONTENT_PANEL_WIDTH}px;
        }
      `,
      rightPanelContentStyles: css`
        &.right-panel-wrapper {
          height: ${RIGHT_CONTENT_HEIGHT}px;
          width: ${RIGHT_CONTENT_WIDTH}px;
        }
      `,
      getRightContentStyles: ({ shadow }: { shadow: boolean }) => css`
        &.right-panel-content {
          height: 100%;
          width: 100%;
          position: relative;
          overflow: hidden;
          ${shadow ? imageShadow : ''}
          border-radius: ${euiTheme.border.radius.medium};
        }
      `,
    }),
    [
      euiTheme.animation.normal,
      euiTheme.border.radius.medium,
      euiTheme.colors.lightShade,
      euiTheme.size.l,
      euiTheme.size.s,
      euiTheme.size.xl,
      imageShadow,
    ]
  );

  return customStyles;
};
