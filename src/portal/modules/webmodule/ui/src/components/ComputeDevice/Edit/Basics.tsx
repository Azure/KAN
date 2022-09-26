// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, Text, Label, IDropdownOption } from '@fluentui/react';

import {
  UpdateComputeDeviceFromData,
  CPUArchitecture,
  cpuArchitectureOptions,
  clusterOptions,
} from '../types';
import { x64AccelerationOptions, arm64AccelerationOptions } from '../../constant';

import HorizontalTextField from '../../Common/HorizontalTextField';
import HorizontalDropdown from '../../Common/HorizontalDropdown';
import HorizonChoiceGroup from '../../Common/HorizonChoiceGroup';
import AzureServicesHeader from '../Common/AzureServicesHeader';

interface Props {
  localFormData: UpdateComputeDeviceFromData;
  onFormDataChange: (formData: UpdateComputeDeviceFromData) => void;
}

const Basics = (props: Props) => {
  const { localFormData } = props;

  return (
    <Stack styles={{ root: { padding: '40px 0' } }} tokens={{ childrenGap: 35 }}>
      <Stack tokens={{ childrenGap: 15 }}>
        <Stack>
          <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Basic Info</Label>
          <Stack>
            <Text>Create a name for your linked device.</Text>
          </Stack>
        </Stack>
        <HorizontalTextField label="Device Name" value={localFormData.name} disabled required />
      </Stack>
      {localFormData.is_k8s ? (
        <Stack tokens={{ childrenGap: 10 }}>
          <Stack>
            <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Kubernetes Info</Label>
            <Stack>
              <Text>Provide some details of your Kubernetes device.</Text>
            </Stack>
          </Stack>
          <HorizonChoiceGroup
            label="Cluster Context"
            selectedKey={localFormData.cluster_type}
            options={clusterOptions}
            required
            disabled
          />
        </Stack>
      ) : (
        <Stack tokens={{ childrenGap: 10 }}>
          <AzureServicesHeader />
          <Stack tokens={{ childrenGap: 20 }}>
            <HorizontalDropdown
              selectedKey={localFormData.iothub}
              options={[
                {
                  key: localFormData.iothub,
                  text: localFormData.iothub,
                },
              ]}
              label="IoT Hub"
              required
              styles={{ root: { width: '680px' } }}
              disabled
            />
            <HorizontalDropdown
              selectedKey={localFormData.iotedge_device}
              options={[
                {
                  key: localFormData.iotedge_device,
                  text: localFormData.iotedge_device,
                },
              ]}
              label="IoT Edge Device"
              disabled
              required
              styles={{ root: { width: '680px' } }}
            />
          </Stack>
        </Stack>
      )}

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
          required
          disabled
        />
        <HorizontalDropdown
          selectedKey={localFormData.acceleration}
          options={localFormData.architecture === 'X64' ? x64AccelerationOptions : arm64AccelerationOptions}
          label="Acceleration"
          required
          disabled
        />
      </Stack>
    </Stack>
  );
};

export default Basics;
