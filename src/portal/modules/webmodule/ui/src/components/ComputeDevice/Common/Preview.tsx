// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack } from '@fluentui/react';

import { CreateComputeDeviceFormData, PivotTabKey, UpdateComputeDeviceFromData } from '../types';

import PreviewLabel from '../../Common/PreviewLabel';
import PreviewTag from '../../Common/PreviewTag';
import PreviewLink from '../../Common/PreviewLink';

interface Props {
  localFormData: CreateComputeDeviceFormData | UpdateComputeDeviceFromData;
  onLinkClick: (key: PivotTabKey) => void;
}

const Preview = (props: Props) => {
  const { localFormData, onLinkClick } = props;

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }} tokens={{ childrenGap: 15 }}>
      <PreviewLabel title="Name" content={localFormData.name} />
      {localFormData.is_k8s ? (
        <PreviewLabel
          title="Cluster Context"
          content={localFormData.cluster_type === 'current' ? 'Current cluster' : 'Other cluster'}
        />
      ) : (
        <>
          <PreviewLabel title="IoT Hub" content={localFormData.iothub} />
          <PreviewLabel title="IoT Edge" content={localFormData.iotedge_device} />
        </>
      )}
      <PreviewLabel title="CPU Architecture" content={localFormData.architecture} />
      <PreviewLabel title="Acceleration" content={localFormData.acceleration} />
      <PreviewTag tagList={localFormData.tag_list} />
      <PreviewLink title="Edit Compute Device" onClick={() => onLinkClick('basics')} />
    </Stack>
  );
};

export default Preview;
