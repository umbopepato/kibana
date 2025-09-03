/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useMemo, useState } from 'react';
import {
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiTab,
  EuiTabs,
  EuiText,
  logicalCSS,
  useEuiTheme,
} from '@elastic/eui';
import { css } from '@emotion/react';
import { ConnectingLine } from './connecting_line';
import { HttpMethodBadge } from './http_method_badge';
import type { EsNetworkRequest } from '../../types/request';
import { Body } from './body';
import { Headers } from './headers';

export interface EsRequestDetailProps {
  request: EsNetworkRequest;
}

enum Tab {
  BODY = 'body',
  HEADERS = 'headers',
}

export const EsRequestDetail = ({ request }: EsRequestDetailProps) => {
  const { euiTheme } = useEuiTheme();

  const [selectedRequestTab, setSelectedRequestTab] = useState<Tab>(Tab.BODY);
  const [selectedResponseTab, setSelectedResponseTab] = useState<Tab>(Tab.BODY);

  const requestTabContent = useMemo(() => {
    if (selectedRequestTab === Tab.BODY) {
      return <Body type="request" request={request} />;
    } else if (selectedRequestTab === Tab.HEADERS) {
      return <Headers type="request" request={request} />;
    }
    return null;
  }, [request, selectedRequestTab]);

  const responseTabContent = useMemo(() => {
    if (selectedResponseTab === Tab.BODY) {
      return <Body type="response" request={request} />;
    } else if (selectedResponseTab === Tab.HEADERS) {
      return <Headers type="response" request={request} />;
    }
    return null;
  }, [request, selectedResponseTab]);

  return (
    <EuiFlexGroup
      direction="column"
      gutterSize="m"
      css={css`
        height: 100%;

        .euiTab {
          ${logicalCSS('padding-horizontal', euiTheme.size.m)}
        }
      `}
    >
      <EuiFlexItem grow={false}>
        <EuiFieldText
          value={request.request.url}
          prepend={<HttpMethodBadge method={request.request.method} />}
          fullWidth
          compressed
        />
      </EuiFlexItem>
      <EuiFlexItem
        css={css`
          flex: 1;
          min-height: 0;
        `}
      >
        <EuiPanel hasShadow={false} hasBorder paddingSize="none" css={{ height: '100%' }}>
          <EuiFlexGroup direction="column" gutterSize="none" css={{ height: '100%' }}>
            <EuiFlexItem grow={false}>
              <EuiFlexGroup gutterSize="none">
                <EuiFlexItem grow>
                  <EuiTabs size="s">
                    <EuiTab
                      isSelected={selectedRequestTab === Tab.BODY}
                      onClick={() => setSelectedRequestTab(Tab.BODY)}
                    >
                      Body
                    </EuiTab>
                    <EuiTab
                      isSelected={selectedRequestTab === Tab.HEADERS}
                      onClick={() => setSelectedRequestTab(Tab.HEADERS)}
                    >
                      Headers
                    </EuiTab>
                  </EuiTabs>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFlexGroup
                    alignItems="center"
                    gutterSize="none"
                    css={css`
                      align-self: stretch;
                      border-bottom: ${euiTheme.border.thin};
                      ${logicalCSS('padding-right', euiTheme.size.s)}
                    `}
                  >
                    <EuiFlexItem grow={false}>
                      <EuiIcon type="sortUp" color="subdued" />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiText
                        size="xs"
                        color="subdued"
                        css={css`
                          ${logicalCSS('margin-left', euiTheme.size.s)}
                          user-select: none;
                          font-weight: ${euiTheme.font.weight.semiBold};
                        `}
                      >
                        Request
                      </EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>

            <EuiFlexItem
              css={css`
                flex: 1;
                min-height: 0;
              `}
            >
              {requestTabContent}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiFlexItem>

      <EuiFlexItem
        grow={false}
        css={css`
          ${logicalCSS('padding-horizontal', euiTheme.size.m)}
          ${logicalCSS('margin-vertical', `-16px`)}
        `}
      >
        <EuiFlexGroup responsive={false} direction="row" alignItems="center">
          <EuiFlexItem grow={false}>
            <ConnectingLine />
          </EuiFlexItem>
          <EuiFlexItem grow>
            <EuiText size="xs" color="subdued">
              Fired at {new Date(request['@timestamp']).toLocaleString()}
              <br />
              Took {request.duration} ms
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>

      <EuiFlexItem
        css={css`
          flex: 1;
          min-height: 0;
        `}
      >
        <EuiPanel hasShadow={false} hasBorder paddingSize="none" css={{ height: '100%' }}>
          <EuiFlexGroup direction="column" gutterSize="none" css={{ height: '100%' }}>
            <EuiFlexItem grow={false}>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup gutterSize="none">
                  <EuiFlexItem grow>
                    <EuiTabs size="s">
                      <EuiTab
                        isSelected={selectedResponseTab === Tab.BODY}
                        onClick={() => setSelectedResponseTab(Tab.BODY)}
                      >
                        Body
                      </EuiTab>
                      <EuiTab
                        isSelected={selectedResponseTab === Tab.HEADERS}
                        onClick={() => setSelectedResponseTab(Tab.HEADERS)}
                      >
                        Headers
                      </EuiTab>
                    </EuiTabs>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiFlexGroup
                      alignItems="center"
                      gutterSize="none"
                      css={css`
                        align-self: stretch;
                        border-bottom: ${euiTheme.border.thin};
                        ${logicalCSS('padding-right', euiTheme.size.s)}
                      `}
                    >
                      <EuiFlexItem grow={false}>
                        <EuiIcon type="sortDown" color="subdued" />
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiText
                          size="xs"
                          color="subdued"
                          css={css`
                            ${logicalCSS('margin-left', euiTheme.size.s)}
                            user-select: none;
                            font-weight: ${euiTheme.font.weight.semiBold};
                          `}
                        >
                          Response
                        </EuiText>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexItem>

            <EuiFlexItem
              css={css`
                flex: 1;
                min-height: 0;
              `}
            >
              {responseTabContent}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
