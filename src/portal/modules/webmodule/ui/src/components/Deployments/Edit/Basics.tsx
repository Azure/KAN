// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { Stack, Text, Label, IDropdownOption, IconButton } from '@fluentui/react';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { selectAllComputeDevices } from '../../../store/computeDeviceSlice';
import { belongDeviceCameraSelectorFactory } from '../../../store/cameraSlice';
import { UpdateDeploymentFormData } from '../types';

import HorizontalTextField from '../../Common/HorizontalTextField';
import HorizontalDropdown from '../../Common/HorizontalDropdown';
import TagLabel from '../../Common/TagLabel';

interface Props {
  localFormData: UpdateDeploymentFormData;
}

const Basics = (props: Props) => {
  const { localFormData } = props;

  const deviceList = useSelector((state: RootState) => selectAllComputeDevices(state));
  const belongCameraSelector = useMemo(
    () => belongDeviceCameraSelectorFactory(localFormData.device.key),
    [localFormData],
  );
  const belongCameraList = useSelector(belongCameraSelector);

  const deviceOptions: IDropdownOption[] = useMemo(
    () =>
      deviceList.map((device) => ({
        key: device.symphony_id,
        text: device.name,
      })),
    [deviceList],
  );

  const cameraOptions: IDropdownOption[] = useMemo(
    () =>
      belongCameraList.map((l) => ({
        key: l.id,
        text: l.name,
      })),
    [belongCameraList],
  );

  return (
    <>
      <Stack styles={{ root: { padding: '40px 0' } }} tokens={{ childrenGap: 35 }}>
        <Stack tokens={{ childrenGap: 10 }}>
          <Stack>
            <Label>Basic Info</Label>
            <Text>Create a name for your deployment.</Text>
          </Stack>
          <HorizontalTextField label="Deployment Name" required value={localFormData.name} disabled />
        </Stack>
        <Stack tokens={{ childrenGap: 10 }}>
          <Stack>
            <Label>Devices</Label>
            <Text>Select one compute device to link with your deployment.</Text>
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <HorizontalDropdown
              label="Compute Device"
              options={deviceOptions}
              selectedKey={localFormData.device.key}
              required
              styles={{ root: { width: '400px' }, dropdown: { width: '200px' } }}
              disabled
            />
            <IconButton iconProps={{ iconName: 'Refresh' }} />
          </Stack>
        </Stack>
        <Stack tokens={{ childrenGap: 10 }}>
          <Stack>
            <Label>Cameras</Label>
            <Text>Select all cameras to link with your deployment.</Text>
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 20 }}>
            <HorizontalDropdown
              label="Cameras"
              options={cameraOptions}
              required
              multiSelect
              selectedKeys={localFormData.cameraList.map((camera) => camera.camera)}
              disabled
              styles={{
                dropdown: { width: '200px' },
              }}
            />
            <Stack horizontal tokens={{ childrenGap: 8 }}>
              {localFormData.cameraList.map((camera, idx) => (
                <TagLabel key={idx} id={idx} text={camera.name} onDelete={(id: number) => {}} />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export default Basics;
