// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Text, Link } from '@fluentui/react';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { CreateDeploymentFormData, UpdateDeploymentFormData } from '../types';
import { selectAllCameras } from '../../../store/cameraSlice';
import { selectComputeDeviceById } from '../../../store/computeDeviceSlice';
import { theme } from '../../../constant';
import { PivotTabKey } from '../types';

import PreviewLabel from '../../Common/PreviewLabel';
import PreviewTag from '../../Common/PreviewTag';
import PreviewLink from '../../Common/PreviewLink';

interface Props {
  localFormData: CreateDeploymentFormData | UpdateDeploymentFormData;
  onLinkClick: (key: PivotTabKey) => void;
  // onTagRedirect: () => void;
  // onConfigureRedirect: () => void;
}

const Preview = (props: Props) => {
  const { localFormData, onLinkClick } = props;

  const device = useSelector((state: RootState) => selectComputeDeviceById(state, localFormData.device.key));
  const cameraList = useSelector((state: RootState) => selectAllCameras(state));

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }} tokens={{ childrenGap: 15 }}>
      <PreviewLabel title="Deployment name" content={localFormData.name} />
      <PreviewLabel title="Linked compute device" content={device ? device.name : ''} />
      <PreviewLabel
        title="Linked cameras"
        content={localFormData.cameraList
          .map((configureCamera) => cameraList.find((camera) => camera.id === configureCamera.camera).name)
          .join(', ')}
      />
      <PreviewTag tagList={localFormData.tag_list} />
      <Stack horizontal>
        <Text
          styles={{
            root: {
              color: theme.palette.neutralPrimary,
              fontSize: '13px',
              lineHeight: '18px',
              width: '200px',
            },
          }}
        >
          Configured skills
        </Text>
        <Link onClick={() => onLinkClick('configure')}>See list</Link>
      </Stack>
      <PreviewLink title="Edit deployment" onClick={() => onLinkClick('basics')} />
    </Stack>
  );
};

export default Preview;
