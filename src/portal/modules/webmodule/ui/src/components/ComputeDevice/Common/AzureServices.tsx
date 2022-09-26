// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
import { Stack, Text, IDropdownOption, ProgressIndicator, IconButton } from '@fluentui/react';

import rootRequest from '../../../store/rootRquest';
import { CreateComputeDeviceFormData } from '../types';
import { theme } from '../../../constant';

import HorizontalDropdown from '../../Common/HorizontalDropdown';
import AzureServicesHead from './AzureServicesHeader';

interface Props {
  localFormData: CreateComputeDeviceFormData;
  onFormDataChange: (formData: CreateComputeDeviceFormData) => void;
}

const AzureServices = (props: Props) => {
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
    <Stack tokens={{ childrenGap: 10 }}>
      <Stack>
        <AzureServicesHead />

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
    </Stack>
  );
};

export default AzureServices;
