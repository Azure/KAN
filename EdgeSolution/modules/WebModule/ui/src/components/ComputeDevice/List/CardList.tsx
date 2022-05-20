import React from 'react';
import { Stack } from '@fluentui/react';

import { ComputeDevice } from '../../../store/types';

import DeviceCard from './DeviceCard';

interface Props {
  deviceList: ComputeDevice[];
  onDeviceCardSelect: (checked: boolean, cameraId: number) => void;
}

const CardList = (props: Props) => {
  const { deviceList, onDeviceCardSelect } = props;

  return (
    <Stack horizontal styles={{ root: { marginTop: '40px' } }} tokens={{ childrenGap: 50 }}>
      {deviceList.map((device, idx) => (
        <DeviceCard key={idx} device={device} onDeviceCardSelect={onDeviceCardSelect} />
      ))}
    </Stack>
  );
};

export default CardList;
