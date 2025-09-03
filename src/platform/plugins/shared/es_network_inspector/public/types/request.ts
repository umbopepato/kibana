/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

export interface EsNetworkRequest {
  // Time field
  '@timestamp': string;
  duration: number;

  // Request
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
    body_size_bytes: number;
  };

  // Response
  response: {
    status_code: string;
    headers: Record<string, string>;
    body?: string;
    body_size_bytes: number;
  };

  // Timing
  // 'timing.client_connection_established': string;
  // 'timing.first_response_byte': string;
  // 'timing.first_request_byte': string;
  // 'timing.request_complete': string;
  // 'timing.response_complete': string;
  // 'timing.server_connection_initiated': string;
  // 'timing.server_connection_tcp_handshake': string;
  // 'timing.duration': number;

  // Operation
  index_pattern?: string;
  operation: string;
}
