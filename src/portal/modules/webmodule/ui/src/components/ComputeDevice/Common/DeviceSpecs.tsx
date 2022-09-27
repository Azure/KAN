// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, Text, Label, IDropdownOption } from '@fluentui/react';

import { CreateComputeDeviceFormData, CPUArchitecture, cpuArchitectureOptions } from '../types';
import { x64AccelerationOptions, arm64AccelerationOptions } from '../../constant';

import HorizontalDropdown from '../../Common/HorizontalDropdown';
import HorizonChoiceGroup from '../../Common/HorizonChoiceGroup';

interface Props {
  localFormData: CreateComputeDeviceFormData;
  onFormDataChange: (formData: CreateComputeDeviceFormData) => void;
}

const DeviceSpecs = (props: Props) => {
  const { localFormData, onFormDataChange } = props;

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
          onFormDataChange({
            ...localFormData,
            architecture: option.key as CPUArchitecture,
            acceleration: '-',
          })
        }
        required
      />
      <HorizontalDropdown
        selectedKey={localFormData.acceleration}
        options={localFormData.architecture === 'X64' ? x64AccelerationOptions : arm64AccelerationOptions}
        label="Acceleration"
        onChange={(_, option) => onAccelerationClick(option)}
        required
        errorMessage={localFormData.error.acceleration}
      />
    </Stack>
  );
};

export default DeviceSpecs;
