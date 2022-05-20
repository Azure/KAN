import React from 'react';
import { Stack, Text } from '@fluentui/react';
import { useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { CreateDeploymentFormData } from '../types';
import { selectAllCameras } from '../../../store/cameraSlice';
import { selectComputeDeviceById } from '../../../store/computeDeviceSlice';
import { theme } from '../../../constant';

import PreviewLabel from '../../Common/PreviewLabel';
import PreviewTag from '../../Common/PreviewTag';

interface Props {
  localFormData: CreateDeploymentFormData;
  // deploymentName: string;
  // cameraName: string;
  // deviceName: string;
}

const Preview = (props: Props) => {
  const { localFormData } = props;

  const device = useSelector((state: RootState) => selectComputeDeviceById(state, localFormData.device.key));
  const cameraList = useSelector((state: RootState) => selectAllCameras(state));

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }} tokens={{ childrenGap: 15 }}>
      <PreviewLabel title="Deployment name" content={localFormData.name} />
      <PreviewLabel title="Linked compute device" content={device ? device.name : ''} />
      <PreviewLabel
        title="Linked cameras"
        content={localFormData.cameraList
          .map((camera) => cameraList.find((c) => c.id === camera.key))
          .join(', ')}
      />
      <PreviewTag tagList={localFormData.tagList} onTagRedirect={() => {}} />
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
        {/* <Text className={classes.title}>{title}</Text> */}
      </Stack>
    </Stack>
  );
};

export default Preview;
