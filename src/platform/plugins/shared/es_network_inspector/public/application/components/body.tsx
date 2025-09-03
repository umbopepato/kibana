/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useMemo } from 'react';
import { noop } from 'lodash';
import { XJsonLang } from '@kbn/monaco';
import { CodeEditor } from '@kbn/code-editor';
import { EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui';
import type { EsNetworkRequest } from '../../types/request';

export const Body = ({
  type,
  request,
}: {
  type: 'request' | 'response';
  request: EsNetworkRequest;
}) => {
  const body = request[type].body;
  const bodySize = request[type].body_size_bytes ? Number(request[type].body_size_bytes) : 0;
  const contentType = request[type].headers['content-type'];
  const formattedBody = useMemo(
    () => (body && bodySize ? JSON.stringify(JSON.parse(body), null, 2) : null),
    [body, bodySize]
  );

  if (!formattedBody || !bodySize) {
    return (
      <EuiFlexGroup alignItems="center" justifyContent="center">
        <EuiFlexItem grow={false}>
          <EuiText size="xs" color="subdued">
            No {type} body
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  if (!contentType.includes('json')) {
    return <div>Cannot visualize {contentType} format</div>;
  }

  return (
    <CodeEditor
      languageId={XJsonLang.ID}
      width="100%"
      height="100%"
      value={(formattedBody ?? body) || ''}
      editorDidMount={noop}
      options={{
        automaticLayout: false,
        fontSize: 12,
        lineNumbers: 'off',
        minimap: {
          enabled: false,
        },
        folding: true,
        showFoldingControls: 'always',
        overviewRulerBorder: false,
        readOnly: true,
        scrollbar: {
          alwaysConsumeMouseWheel: false,
        },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        wrappingIndent: 'indent',
      }}
    />
  );
};
