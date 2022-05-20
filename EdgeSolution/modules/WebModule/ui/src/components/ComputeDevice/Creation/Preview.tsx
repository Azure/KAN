import React from 'react';
import { Stack } from '@fluentui/react';

import { CreateComputeDeviceFormData } from '../types';

import PreviewLabel from '../../Common/PreviewLabel';
import PreviewTag from '../../Common/PreviewTag';

interface Props {
  localFormData: CreateComputeDeviceFormData;
  onTagRedirect: () => void;
}

const Preview = (props: Props) => {
  const { localFormData, onTagRedirect } = props;

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }} tokens={{ childrenGap: 15 }}>
      <PreviewLabel title="name" content={localFormData.name} />
      <PreviewLabel title="IoT Hub" content={localFormData.iotHub} />
      <PreviewLabel title="IoT Edge" content={localFormData.iotedge_device} />
      <PreviewLabel title="CPU Architecture" content={localFormData.architecture} />
      <PreviewLabel title="Acceleration" content={localFormData.acceleration} />
      <PreviewTag tagList={localFormData.tag_list} onTagRedirect={() => onTagRedirect()} />
    </Stack>
  );
};

export default Preview;
