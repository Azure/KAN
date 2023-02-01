// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack } from '@fluentui/react';

import { CreateComputeDeviceFormData, DeviceCreateType } from '../types';

import BasicInfo from '../Common/BasicInfo';
import AzureServices from '../Common/AzureServices';
import KeuernetesInfo from '../Common/KeuernetesInfo';
import DeviceSpecs from '../Common/DeviceSpecs';

interface Props {
  localFormData: CreateComputeDeviceFormData;
  onFormDataChange: (formData: CreateComputeDeviceFormData) => void;
  createType: DeviceCreateType;
}

const Basics = (props: Props) => {
  const { localFormData, onFormDataChange, createType } = props;

  return (
    <Stack styles={{ root: { padding: '40px 0' } }} tokens={{ childrenGap: 35 }}>
      <BasicInfo localFormData={localFormData} onFormDataChange={onFormDataChange} />

      {createType === 'iot' && (
        <AzureServices localFormData={localFormData} onFormDataChange={onFormDataChange} />
      )}
      {createType === 'k8s' && (
        <KeuernetesInfo localFormData={localFormData} onFormDataChange={onFormDataChange} />
      )}

      <DeviceSpecs
        localFormData={localFormData}
        onFormDataChange={onFormDataChange}
        createType={createType}
      />
    </Stack>
  );
};

export default Basics;
