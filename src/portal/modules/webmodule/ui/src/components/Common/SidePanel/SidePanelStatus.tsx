// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Icon, Text } from '@fluentui/react';

import { ConntectedStatus } from '../../../store/types';
import { theme } from '../../../constant';

interface Props {
  name: string;
  status: ConntectedStatus;
}

const SidePanelStatus = (props: Props) => {
  const { name, status } = props;

  return (
    <Stack tokens={{ childrenGap: 5 }} horizontal verticalAlign="center">
      {status === 'connected' ? (
        <Icon iconName="SkypeCircleCheck" styles={{ root: { color: '#57A300' } }} />
      ) : (
        <Icon iconName="StatusErrorFull" styles={{ root: { color: '#A4262C' } }} />
      )}
      <Text styles={{ root: { color: theme.palette.black } }}>{`${name} ${
        status === 'disconnected' ? '(not reachable)' : ''
      }`}</Text>
    </Stack>
  );
};

export default SidePanelStatus;
