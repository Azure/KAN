// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Text, Label } from '@fluentui/react';

import { CreateComputeDeviceFormData } from '../types';

import HorizontalTextField from '../../Common/HorizontalTextField';

interface Props {
  localFormData: CreateComputeDeviceFormData;
  onFormDataChange: (formData: CreateComputeDeviceFormData) => void;
}

const BasicInfo = (props: Props) => {
  const { localFormData, onFormDataChange } = props;

  return (
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
        onChange={(_, newValue) =>
          onFormDataChange({
            ...localFormData,
            name: newValue,
            error: { ...localFormData.error, name: '' },
          })
        }
        required
        errorMessage={localFormData.error.name}
      />
    </Stack>
  );
};

export default BasicInfo;
