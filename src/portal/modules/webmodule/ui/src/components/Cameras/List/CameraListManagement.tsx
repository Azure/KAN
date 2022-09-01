// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { useHistory, generatePath } from 'react-router-dom';

import { Camera } from '../../../store/cameraSlice';
import { ViewMode } from '../types';
import { Url } from '../../../constant';

import CameraCardList from './CameraCardList';
import CameraList from './CameraList';

interface Props {
  cameraList: Camera[];
  onCameraCardSelect: (checked: boolean, cameraId: number) => void;
  onCameraListSelect: (ids: number[]) => void;
  viewMode: ViewMode;
}

const CameraListManagement = (props: Props) => {
  const { cameraList, onCameraCardSelect, viewMode, onCameraListSelect } = props;

  const history = useHistory();

  const onLiveFeedRedirect = useCallback(
    (id: number) => {
      history.push(
        generatePath(Url.CAMERAS_LIVE_FEED, {
          id,
        }),
      );
    },
    [history],
  );

  return (
    <>
      {viewMode === 'card' ? (
        <CameraCardList
          cameraList={cameraList}
          onCameraCardSelect={onCameraCardSelect}
          onLiveFeedRedirect={onLiveFeedRedirect}
        />
      ) : (
        <CameraList
          cameraList={cameraList}
          onCameraListSelect={onCameraListSelect}
          onLiveFeedRedirect={onLiveFeedRedirect}
        />
      )}
    </>
  );
};

export default CameraListManagement;
