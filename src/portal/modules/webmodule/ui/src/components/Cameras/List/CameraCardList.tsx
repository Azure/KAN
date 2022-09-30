// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback } from 'react';
import { Stack } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';

import { Camera, deleteCameras } from '../../../store/cameraSlice';
import { selectHasCameraDeploymentSelectoryFactory } from '../../../store/deploymentSlice';

import CameraCard from './CameraCard';
import CameraSidePanel from '../CameraSidePanel';
import DeleteModal from '../../Common/DeleteModal';
import DefinitionPanel from '../../Common/DefinitionPanel';

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
  const [selectedDefinition, setSelectedDefinition] = useState<Camera | null>(null);
  const hasCameraDeployment = useSelector(selectHasCameraDeploymentSelectoryFactory(deletedCamera?.id ?? 0));

  const onSingleCameraDelete = useCallback(async () => {
    const resolve = () => {
      setLocalSelectedCamera(null);
      setDeletedCamera(null);
    };

    await dispatch(deleteCameras({ id: deletedCamera.id, symphony_id: deletedCamera.symphony_id, resolve }));
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
            onCameraSelected={() => setLocalSelectedCamera(camera)}
            onDeleteModalOpen={() => setDeletedCamera(camera)}
            onDefinitionOpen={() => setSelectedDefinition(camera)}
          />
        ))}
      </Stack>
      {localSelectedCamera && (
        <CameraSidePanel
          camereId={localSelectedCamera.id}
          symphonyId={localSelectedCamera.symphony_id}
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
          isUsed={hasCameraDeployment}
        />
      )}
      {selectedDefinition && (
        <DefinitionPanel
          onPanelClose={() => setSelectedDefinition(null)}
          selectedTargetId={selectedDefinition.symphony_id}
          pageType="camera"
          onDeleteModalOpen={() => setDeletedCamera(selectedDefinition)}
        />
      )}
    </>
  );
};

export default CameraList;
