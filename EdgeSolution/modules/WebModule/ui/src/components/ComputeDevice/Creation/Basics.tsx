import React, { useCallback } from 'react';
import { Stack, Text, Label, IDropdownOption, ActionButton } from '@fluentui/react';

import {
  CreateComputeDeviceFormData,
  CPUArchitecture,
  cpuArchitectureOptions,
  accelerationOptions,
} from '../types';

import HorizontalTextField from '../../Common/HorizontalTextField';
import HorizontalDropdown from '../../Common/HorizontalDropdown';
import HorizonChoiceGroup from '../../Common/HorizonChoiceGroup';
import { theme } from '../../../constant';

interface Props {
  localFormData: CreateComputeDeviceFormData;
  onFormDataChange: (formData: CreateComputeDeviceFormData) => void;
}

const Basics = (props: Props) => {
  const { localFormData, onFormDataChange } = props;

  const onFromDataChange = useCallback(
    (key: keyof CreateComputeDeviceFormData, newValue: string) => {
      onFormDataChange({
        ...localFormData,
        [key]: newValue,
        error: { ...localFormData.error, [key]: '' },
      });
    },
    [onFormDataChange, localFormData],
  );

  const onAccelerationClick = useCallback(
    (option: IDropdownOption) => {
      onFormDataChange({
        ...localFormData,
        acceleration: option.key as string,
        error: { ...localFormData.error, acceleration: '' },
      });
    },
    [onFormDataChange, localFormData],
  );

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }} tokens={{ childrenGap: 35 }}>
      <Stack tokens={{ childrenGap: 15 }}>
        <Stack>
          <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Basic Info</Label>
          <Stack>
            <Text>Create a name for your linked device.</Text>
          </Stack>
        </Stack>
        <HorizontalTextField
          label="Device Name"
          value={localFormData.name}
          onChange={(_, newValue) => onFromDataChange('name', newValue)}
          required
          errorMessage={localFormData.error.name}
        />
      </Stack>
      <Stack tokens={{ childrenGap: 10 }}>
        <Stack>
          <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Azure Services</Label>
          <Stack>
            <Text>
              You must have an Azure IoT Hub account and IoT Edge Device in order to add a compute device.
            </Text>
            <Stack horizontal verticalAlign="center">
              <Text>Don’t have an account?</Text>
              <ActionButton
                styles={{
                  root: { color: theme.palette.themeSecondary },
                  flexContainer: {
                    flexDirection: 'row-reverse',
                  },
                }}
                iconProps={{ iconName: 'OpenInNewWindow' }}
              >
                Create one
              </ActionButton>
            </Stack>
          </Stack>
        </Stack>
        <Stack tokens={{ childrenGap: 20 }}>
          <HorizontalTextField
            label="IoT Hub"
            value={localFormData.iotHub}
            onChange={(_, newValue) => onFromDataChange('iotHub', newValue)}
            required
            errorMessage={localFormData.error.iotHub}
          />
          <HorizontalTextField
            label="IoT Edge Device"
            value={localFormData.iotedge_device}
            onChange={(_, newValue) => onFromDataChange('iotedge_device', newValue)}
            required
            errorMessage={localFormData.error.iotedge_device}
          />
        </Stack>
      </Stack>
      <Stack tokens={{ childrenGap: 15 }}>
        <Stack>
          <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Device Specs</Label>
          <Stack>
            <Text>Provide some hardware specifications of your linked device.</Text>
          </Stack>
        </Stack>
        <HorizonChoiceGroup
          label="CPU Architecture"
          selectedKey={localFormData.architecture}
          options={cpuArchitectureOptions}
          onChange={(_, option) =>
            onFormDataChange({ ...localFormData, architecture: option.key as CPUArchitecture })
          }
          required
        />
        <HorizontalDropdown
          selectedKey={localFormData.acceleration}
          options={accelerationOptions}
          label="Acceleration"
          onChange={(_, option) => onAccelerationClick(option)}
          required
          errorMessage={localFormData.error.acceleration}
        />
      </Stack>
    </Stack>
  );
};

export default Basics;
