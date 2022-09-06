// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useEffect, useState } from 'react';
import { Stack, Text, Label, IDropdownOption, IconButton, ProgressIndicator } from '@fluentui/react';

import { CreateComputeDeviceFormData, CPUArchitecture, cpuArchitectureOptions } from '../types';
import { theme } from '../../../constant';
import { x64AccelerationOptions, arm64AccelerationOptions } from '../../constant';
import rootRequest from '../../../store/rootRquest';

import HorizontalTextField from '../../Common/HorizontalTextField';
import HorizontalDropdown from '../../Common/HorizontalDropdown';
import HorizonChoiceGroup from '../../Common/HorizonChoiceGroup';
import AzureServicesHeader from '../Common/AzureServicesHeader';

interface Props {
  localFormData: CreateComputeDeviceFormData;
  onFormDataChange: (formData: CreateComputeDeviceFormData) => void;
}

const Basics = (props: Props) => {
  const { localFormData, onFormDataChange } = props;

  const [localIotHubOptions, setLocalIioHubOptions] = useState<IDropdownOption[]>([]);
  const [localIotHubDeviceOptions, setLocalIioHubDeviceOptions] = useState<IDropdownOption[]>([]);

  const onIotHubFetch = useCallback(async () => {
    const url = `${process.env.REACT_APP_DEV_TESTINT_IOTHUB_DOMAIN ?? ''}/api/compute_devices/list-iothub`;

    await rootRequest.get(url).then(({ data }) => {
      setLocalIioHubOptions(data.iothub.map((iotHub) => ({ key: iotHub, text: iotHub })));
    });
  }, []);

  const onIotHubDeviceFetch = useCallback(async (iotHub: string) => {
    const url = `${
      process.env.REACT_APP_DEV_TESTINT_IOTHUB_DOMAIN ?? ''
    }/api/compute_devices/list-devices?iothub=${iotHub}`;

    await rootRequest.get(url).then(({ data }) => {
      setLocalIioHubDeviceOptions(data.devices.map((device) => ({ key: device, text: device })));
    });
  }, []);

  useEffect(() => {
    onIotHubFetch();
  }, [onIotHubFetch]);

  useEffect(() => {
    if (localFormData.iothub) {
      onIotHubDeviceFetch(localFormData.iothub as string);
    }
  }, [localFormData.iothub, onIotHubDeviceFetch]);

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

  const onIotHubClick = useCallback(
    (option: IDropdownOption) => {
      onFormDataChange({
        ...localFormData,
        iothub: option.key as string,
        error: { ...localFormData.error, iotHub: '' },
      });

      onIotHubDeviceFetch(option.key as string);
    },
    [onFormDataChange, localFormData, onIotHubDeviceFetch],
  );

  const onIotHubDeviceClick = useCallback(
    (option: IDropdownOption) => {
      onFormDataChange({
        ...localFormData,
        iotedge_device: option.key as string,
        error: { ...localFormData.error, iotedge_device: '' },
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

  const onIotHubRefresh = useCallback(async () => {
    setLocalIioHubOptions([]);
    setLocalIioHubDeviceOptions([]);
    onFormDataChange({ ...localFormData, iothub: '', iotedge_device: '' });
    await onIotHubFetch();
  }, [onIotHubFetch, onFormDataChange, localFormData]);

  const onIotHubDeviceRefresh = useCallback(async () => {
    setLocalIioHubDeviceOptions([]);
    onFormDataChange({ ...localFormData, iotedge_device: '' });
    await onIotHubDeviceFetch(localFormData.iothub);
  }, [onIotHubDeviceFetch, onFormDataChange, localFormData]);

  return (
    <Stack styles={{ root: { padding: '40px 0' } }} tokens={{ childrenGap: 35 }}>
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
        <AzureServicesHeader />
        <Stack tokens={{ childrenGap: 20 }}>
          {localIotHubOptions.length === 0 ? (
            <Stack horizontal verticalAlign="center">
              <Text styles={{ root: { width: '200px' } }}>IoT Hub</Text>
              <ProgressIndicator styles={{ root: { width: '480px' } }} />
            </Stack>
          ) : (
            <Stack horizontal tokens={{ childrenGap: 15 }}>
              <HorizontalDropdown
                selectedKey={localFormData.iothub}
                options={localIotHubOptions}
                label="IoT Hub"
                onChange={(_, option) => onIotHubClick(option)}
                required
                errorMessage={localFormData.error.iotHub}
                styles={{ root: { width: '680px' } }}
              />
              <IconButton
                iconProps={{ iconName: 'Refresh' }}
                onClick={onIotHubRefresh}
                styles={{ root: { color: theme.palette.themeSecondary } }}
              />
            </Stack>
          )}
          {localFormData.iothub !== '' && localIotHubDeviceOptions.length === 0 ? (
            <Stack horizontal verticalAlign="center">
              <Text styles={{ root: { width: '200px' } }}>IoT Edge Device</Text>
              <ProgressIndicator styles={{ root: { width: '480px' } }} />
            </Stack>
          ) : (
            <Stack horizontal tokens={{ childrenGap: 15 }}>
              <HorizontalDropdown
                selectedKey={localFormData.iotedge_device}
                options={localIotHubDeviceOptions}
                label="IoT Edge Device"
                onChange={(_, option) => onIotHubDeviceClick(option)}
                required
                errorMessage={localFormData.error.iotedge_device}
                styles={{ root: { width: '680px' } }}
              />
              <IconButton
                iconProps={{ iconName: 'Refresh' }}
                onClick={onIotHubDeviceRefresh}
                styles={{ root: { color: theme.palette.themeSecondary } }}
              />
            </Stack>
          )}
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
    </Stack>
  );
};

export default Basics;
