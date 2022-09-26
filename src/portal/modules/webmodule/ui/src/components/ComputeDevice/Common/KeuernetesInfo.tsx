// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Text, Label } from '@fluentui/react';

import { CreateComputeDeviceFormData, clusterOptions } from '../types';
import { ClusterType } from '../../../store/types';

import HorizonChoiceGroup from '../../Common/HorizonChoiceGroup';

interface Props {
  localFormData: CreateComputeDeviceFormData;
  onFormDataChange: (formData: CreateComputeDeviceFormData) => void;
}

const KeuernetesInfo = (props: Props) => {
  const { localFormData, onFormDataChange } = props;

  return (
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
        onChange={(_, option) =>
          onFormDataChange({
            ...localFormData,
            cluster_type: option.key as ClusterType,
            error: {
              ...localFormData.error,
            },
          })
        }
        required
      />
    </Stack>
  );
};

export default KeuernetesInfo;
