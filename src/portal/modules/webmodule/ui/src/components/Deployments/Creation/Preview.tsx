// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Text, Link } from '@fluentui/react';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { CreateDeploymentFormData, UpdateDeploymentFormData, PivotTabKey } from '../types';
import { selectAllCameras } from '../../../store/cameraSlice';
import { selectDeviceBySymphonyIdSelectorFactory } from '../../../store/computeDeviceSlice';
import { theme } from '../../../constant';

import PreviewLabel from '../../Common/PreviewLabel';
import PreviewTag from '../../Common/PreviewTag';
import PreviewLink from '../../Common/PreviewLink';

interface Props {
  localFormData: CreateDeploymentFormData | UpdateDeploymentFormData;
  onLinkClick: (key: PivotTabKey) => void;
}

const Preview = (props: Props) => {
  const { localFormData, onLinkClick } = props;

  // const device = useSelector(selectDeviceBySymphonyIdSelectorFactory(localFormData.device.key));
  const cameraList = useSelector((state: RootState) => selectAllCameras(state));

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }} tokens={{ childrenGap: 15 }}>
      <PreviewLabel title="Deployment name" content={localFormData.name} />
      <PreviewLabel title="Linked compute device" content={localFormData.device.text} />
      <PreviewLabel
        title="Linked cameras"
        content={localFormData.cameraList
          .map(
            (configureCamera) => cameraList.find((camera) => camera.symphony_id === configureCamera.camera).name,
          )
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
