// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, Text, Label, IDropdownOption } from '@fluentui/react';

import {
  CreateComputeDeviceFormData,
  CPUArchitecture,
  DeviceCreateType,
  k8sCpuArchitectureOptions,
} from '../types';
import { getAccelerationOptions } from '../utils';
import { cpuArchitectureOptions } from '../../constant';

import HorizontalDropdown from '../../Common/HorizontalDropdown';
import HorizonChoiceGroup from '../../Common/HorizonChoiceGroup';

interface Props {
  localFormData: CreateComputeDeviceFormData;
  onFormDataChange: (formData: CreateComputeDeviceFormData) => void;
  createType: DeviceCreateType;
}

const DeviceSpecs = (props: Props) => {
  const { localFormData, onFormDataChange, createType } = props;

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
        options={localFormData.is_k8s ? k8sCpuArchitectureOptions : cpuArchitectureOptions}
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
        options={getAccelerationOptions(localFormData.architecture, createType)}
        label="Acceleration"
        onChange={(_, option) => onAccelerationClick(option)}
        required
        errorMessage={localFormData.error.acceleration}
      />
    </Stack>
  );
};

export default DeviceSpecs;
