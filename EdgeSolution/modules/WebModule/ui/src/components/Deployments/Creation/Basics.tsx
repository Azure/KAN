import React, { useMemo, useCallback } from 'react';
import { Stack, Text, Label, IDropdownOption, IconButton } from '@fluentui/react';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { selectAllComputeDevices } from '../../../store/computeDeviceSlice';
import { selectAllCameras, selectNonDemoCameras } from '../../../store/cameraSlice';
import { CreateDeploymentFormData } from '../types';
// import { selectNonDemoCameras } from '../../store/cameraSlice';

import HorizontalTextField from '../../Common/HorizontalTextField';
import HorizontalDropdown from '../../Common/HorizontalDropdown';
import TagLabel from '../../Common/TagLabel';

interface Props {
  localFormData: CreateDeploymentFormData;
  onFormDataChange: (formData: CreateDeploymentFormData) => void;
}

const Basics = (props: Props) => {
  const { localFormData, onFormDataChange } = props;

  const deviceList = useSelector((state: RootState) => selectAllComputeDevices(state));
  const cameraList = useSelector((state: RootState) => selectNonDemoCameras(state));
  const cameraList2 = useSelector((state: RootState) => selectAllCameras(state));
  // selectAllCameras;
  // selectNonDemoCameras(state)
  // const itemsInStore = useSelector(selector);

  console.log('cameraList', cameraList);
  console.log('cameraList2', cameraList2);

  const deviceOptions: IDropdownOption[] = useMemo(
    () =>
      deviceList.map((l) => ({
        key: l.id,
        text: l.name,
      })),
    [deviceList],
  );

  const cameraOptions: IDropdownOption[] = useMemo(
    () =>
      cameraList.map((l) => ({
        key: l.id,
        text: l.name,
      })),
    [cameraList],
  );

  const onMultiDropdownChange = useCallback(
    (option: IDropdownOption) => {
      if (option.selected) {
        onFormDataChange({
          ...localFormData,
          cameraList: [...localFormData.cameraList, { key: +option.key, text: option.text }],
        });
      } else {
        onFormDataChange({
          ...localFormData,
          cameraList: [...localFormData.cameraList].filter((camera) => camera.key !== option.key),
        });
      }
    },
    [localFormData, onFormDataChange],
  );

  console.log('cameraOptions', cameraOptions);

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }} tokens={{ childrenGap: 35 }}>
      <Stack tokens={{ childrenGap: 10 }}>
        <Stack>
          <Label>Basic Info</Label>
          <Text>Create a name for your deployment.</Text>
        </Stack>
        <HorizontalTextField
          label="Deployment Name"
          required
          value={localFormData.name}
          onChange={(_, newValue: string) => onFormDataChange({ ...localFormData, name: newValue })}
        />
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
            onChange={(_, option) =>
              onFormDataChange({ ...localFormData, device: { key: +option.key, text: option.text } })
            }
            required
            styles={{ dropdown: { width: '200px' } }}
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
            selectedKeys={localFormData.cameraList.map((camera) => camera.key)}
            onChange={(_, option) => onMultiDropdownChange(option)}
            styles={{
              dropdown: { width: '200px' },
            }}
          />
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            {localFormData.cameraList.map((camera, idx) => (
              <TagLabel
                key={idx}
                id={camera.key}
                text={camera.text}
                onDelete={(id: number) =>
                  onFormDataChange({
                    ...localFormData,
                    cameraList: localFormData.cameraList.filter((device) => +device.key !== id),
                  })
                }
              />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Basics;
