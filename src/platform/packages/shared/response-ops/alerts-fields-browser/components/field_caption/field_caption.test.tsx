/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { mount } from 'enzyme';
import React from 'react';

import { FieldCaption } from './field_caption';

const timestampFieldId = '@timestamp';
const timestampFieldCaption = 'Timestamp';

const defaultProps = {
  children: timestampFieldCaption,
};

describe('FieldCaption', () => {
  beforeEach(() => {
    jest.useFakeTimers({ legacyFakeTimers: true });
  });

  test('it renders the field caption', () => {
    const wrapper = mount(<FieldCaption {...defaultProps} />);

    expect(
      wrapper.find(`[data-test-subj="field-${timestampFieldId}-caption"]`).first().text()
    ).toEqual(timestampFieldCaption);
  });

  test('it highlights the text specified by the `highlight` prop', () => {
    const highlight = 'stamp';

    const wrapper = mount(<FieldCaption {...{ ...defaultProps, highlight }} />);

    expect(wrapper.find('mark').first().text()).toEqual(highlight);
  });
});
