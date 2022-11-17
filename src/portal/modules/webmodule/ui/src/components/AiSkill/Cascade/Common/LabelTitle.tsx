// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Text, Icon, Label } from '@fluentui/react';

import { theme } from '../../../../constant';

type Props = {
  label: string;
  isBold?: boolean;
};

const LabelTitle = (props: Props) => {
  const { label, isBold } = props;

  return (
    <Stack
      horizontal
      verticalAlign="center"
      styles={{ root: { width: '150px' } }}
      tokens={{ childrenGap: 4 }}
    >
      {isBold ? <Label>{label}</Label> : <Text>{label}</Text>}
      <span style={{ color: theme.palette.redDark }}>*</span>
      <Icon iconName="Info" />
    </Stack>
  );
};

export default LabelTitle;
