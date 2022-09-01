// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ChoiceGroup,
  IChoiceGroupProps,
  IChoiceGroupStyleProps,
  IChoiceGroupStyles,
  styled,
} from '@fluentui/react';

const HorizontalChoiceGroup = styled<IChoiceGroupProps, IChoiceGroupStyleProps, IChoiceGroupStyles>(
  ChoiceGroup,
  () => ({
    root: { display: 'flex' },
    label: { width: '200px', fontWeight: 400 },
  }),
);

export default HorizontalChoiceGroup;
