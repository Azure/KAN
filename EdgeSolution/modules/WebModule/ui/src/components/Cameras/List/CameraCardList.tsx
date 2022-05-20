import React from 'react';
import { Stack } from '@fluentui/react';

import { Camera } from '../../../store/cameraSlice';

import CameraCard from './CameraCard';

interface Props {
  cameraList: Camera[];
  onCameraCardSelect: (checked: boolean, cameraId: number) => void;
  onLiveFeedRedirect: (id: number) => void;
}

const CameraList = (props: Props) => {
  const { cameraList, onCameraCardSelect, onLiveFeedRedirect } = props;

  return (
    <Stack styles={{ root: { paddingTop: '35px' } }} horizontal tokens={{ childrenGap: 30 }}>
      {cameraList.map((camera, key) => (
        <CameraCard
          key={key}
          camera={camera}
          onCameraCardSelect={onCameraCardSelect}
          onLiveFeedRedirect={onLiveFeedRedirect}
        />
      ))}
    </Stack>
  );
};

export default CameraList;
