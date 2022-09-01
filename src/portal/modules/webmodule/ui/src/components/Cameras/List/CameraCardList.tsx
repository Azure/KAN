// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback } from 'react';
import { Stack } from '@fluentui/react';
import { useDispatch } from 'react-redux';

import { Camera, deleteCameras } from '../../../store/cameraSlice';

import CameraCard from './CameraCard';
import CameraSidePanel from '../CameraSidePanel';
import DeleteModal from '../../Common/DeleteModal';

interface Props {
  cameraList: Camera[];
  onCameraCardSelect: (checked: boolean, cameraId: number) => void;
  onLiveFeedRedirect: (id: number) => void;
}

const CameraList = (props: Props) => {
  const { cameraList, onCameraCardSelect, onLiveFeedRedirect } = props;

  const dispatch = useDispatch();

  const [localSelectedCamera, setLocalSelectedCamera] = useState<Camera | null>(null);
  const [deletedCamera, setDeletedCamera] = useState<Camera | null>(null);

  const onSingleCameraDelete = useCallback(async () => {
    const resolve = () => {
      setLocalSelectedCamera(null);
      setDeletedCamera(null);
    };

    await dispatch(deleteCameras({ ids: [deletedCamera.id], resolve }));
  }, [dispatch, deletedCamera]);

  return (
    <>
      <Stack
        styles={{ root: { marginTop: '40px' }, inner: { margin: '0' } }}
        wrap
        horizontal
        tokens={{ childrenGap: 30 }}
      >
        {cameraList.map((camera, key) => (
          <CameraCard
            key={key}
            camera={camera}
            onCameraCardSelect={onCameraCardSelect}
            onLiveFeedRedirect={onLiveFeedRedirect}
            onCameraSelected={(inputCamera) => setLocalSelectedCamera(inputCamera)}
            onDeleteModalOpen={(inputCamera) => setDeletedCamera(inputCamera)}
          />
        ))}
      </Stack>
      {localSelectedCamera && (
        <CameraSidePanel
          selectedCameraId={localSelectedCamera.id}
          onPanelClose={() => setLocalSelectedCamera(null)}
          onDeleteModalOpen={() => setDeletedCamera(localSelectedCamera)}
        />
      )}

      {deletedCamera && (
        <DeleteModal
          type="camera"
          name={deletedCamera.name}
          onDelte={onSingleCameraDelete}
          onClose={() => setDeletedCamera(null)}
        />
      )}
    </>
  );
};

export default CameraList;
