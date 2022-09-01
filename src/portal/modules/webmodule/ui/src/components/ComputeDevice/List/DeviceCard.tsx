// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Label, Text } from '@fluentui/react';

import { ComputeDevice } from '../../../store/types';
import { theme } from '../../../constant/theme';
import { cardBorderStyle } from '../../constant';
import { getLimitText } from '../../utils';

import MenuButton from '../../Common/MenuButton';

interface Props {
  device: ComputeDevice;
  onDeviceCardSelect: (checked: boolean, cameraId: number) => void;
  onDeviceSelected: (device: ComputeDevice) => void;
  onDeleteModalOpen: (id) => void;
}

const DeviceCard = (props: Props) => {
  const { device, onDeviceCardSelect, onDeviceSelected, onDeleteModalOpen } = props;

  return (
    <Stack
      styles={{
        root: {
          width: '300px',
          height: '220px',
          ...cardBorderStyle,
        },
      }}
      onClick={() => onDeviceSelected(device)}
    >
      <Stack
        horizontal
        horizontalAlign="space-between"
        verticalAlign="center"
        styles={{ root: { outline: '0.3px solid rgba(0,0,0,0.1)' } }}
      >
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <Stack styles={{ root: { width: '60px', height: '60px' } }}>
            <img src="/icons/computeDevice/deviceCard.png" alt="compute" />
          </Stack>
          <Stack>
            <Label>{device.name}</Label>
            <Label styles={{ root: { color: theme.palette.neutralSecondaryAlt, fontSize: '12px' } }}>
              IoT Edge Compute Device
            </Label>
          </Stack>
        </Stack>
        <Stack>
          <MenuButton
            iconName="MoreVertical"
            onTargetSelected={() => onDeviceSelected(device)}
            onDeleteModalOpen={() => onDeleteModalOpen(device)}
          />
        </Stack>
      </Stack>
      <Stack
        styles={{ root: { position: 'relative', height: '100%', padding: '14px 24px 0' } }}
        tokens={{ childrenGap: 5 }}
      >
        <Stack>
          <Label
            styles={{
              root: { color: theme.palette.neutralSecondaryAlt, fontSize: '13px', fontWeight: 400 },
            }}
          >
            Acceleration
          </Label>
          <Text styles={{ root: { fontSize: '13px', color: theme.palette.black } }}>
            {getLimitText(device.acceleration, 33)}
          </Text>
        </Stack>
        <Stack>
          <Label
            styles={{
              root: { color: theme.palette.neutralSecondaryAlt, fontSize: '13px', fontWeight: 400 },
            }}
          >
            CPU Architecture
          </Label>
          <Text styles={{ root: { fontSize: '13px', color: theme.palette.black } }}>
            {getLimitText(device.architecture, 33)}
          </Text>
        </Stack>
        {/* <Stack verticalAlign="end">
          <Stack tokens={{ childrenGap: 10 }} horizontal verticalAlign="center">
            <ActionButton
              styles={{
                root: { fontSize: '12px', color: theme.palette.themeSecondary, padding: 0 },
                textContainer: { textDecoration: 'underline' },
              }}
              iconProps={{
                iconName: 'NavigateBackMirrored',
              }}
            >
              view connected cameras
            </ActionButton>
          </Stack>
        </Stack> */}
        {/* <Checkbox
          styles={{ root: { position: 'absolute', right: '10px', bottom: '10px' } }}
          onChange={(_, checked) => onDeviceCardSelect(checked, device.id)}
        /> */}
      </Stack>
    </Stack>
  );
};

export default DeviceCard;
