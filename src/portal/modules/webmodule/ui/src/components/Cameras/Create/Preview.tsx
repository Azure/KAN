// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack } from '@fluentui/react';

import { CreateCameraFormData, PivotTabKey, UpdateCameraFormData } from '../types';

import PreviewTag from '../../Common/PreviewTag';
import PreviewLabel from '../../Common/PreviewLabel';
import PreviewLink from '../../Common/PreviewLink';

interface Props {
  localFormData: CreateCameraFormData | UpdateCameraFormData;
  onLinkClick: (key: PivotTabKey) => void;
}

const Preview = (props: Props) => {
  const { localFormData, onLinkClick } = props;

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }} tokens={{ childrenGap: 15 }}>
      <PreviewLabel title="Name" content={localFormData.name} />
      <PreviewLabel title="Camera or Video" content={localFormData.media_type} />
      {localFormData.media_type === 'Camera' ? (
        <>
          <PreviewLabel
            title="Devices"
            content={localFormData.selectedDeviceList.length > 0 ? 'Yes' : 'No'}
          />
          <PreviewLabel title="RTSP URL" content={localFormData.rtsp} />
          <PreviewLabel title="Username" content={localFormData.userName} />
          <PreviewLabel title="Password" content={localFormData.password} />
        </>
      ) : (
        <PreviewLabel title="URL" content={localFormData.media_source} />
      )}
      <PreviewLabel title="Location" content={localFormData.location} />
      <PreviewTag tagList={localFormData.tag_list} />
      <PreviewLink title="Edit Camera" onClick={() => onLinkClick('basics')} />
    </Stack>
  );
};

export default Preview;
