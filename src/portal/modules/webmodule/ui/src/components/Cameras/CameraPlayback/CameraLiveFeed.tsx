// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react';
import { useHistory, generatePath } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { Camera, deleteCameras, getSingleCamera } from '../../../store/cameraSlice';
import { Url } from '../../../constant';

import { RTSPVideo } from '../../RTSPVideo';
import CameraSidePanel from '../CameraSidePanel';
import DeleteModal from '../../Common/DeleteModal';

interface Props {
  camera: Camera;
}

const LiveFeed = (props: Props) => {
  const { camera } = props;

  const [localSelectedCamera, setLocalSelectedCamera] = useState<Camera | null>(null);
  const [deletedCamera, setDeletedCamera] = useState<Camera | null>(null);
  const [loding, setLoading] = useState(false);

  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      setLoading(true);
      await dispatch(getSingleCamera({ id: camera.id, symphony_id: camera.symphony_id }));
      setLoading(false);
    })();
  }, [dispatch, camera.id, camera.symphony_id]);

  const onSingleCameraDelete = useCallback(async () => {
    await dispatch(deleteCameras({ id: deletedCamera.id, symphony_id: deletedCamera.symphony_id }));

    setLocalSelectedCamera(null);
    setDeletedCamera(null);
  }, [dispatch, deletedCamera]);

  const onPageRefresh = useCallback(() => {
    history.go(0);
  }, [history]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: {
        iconName: 'Refresh',
      },
      onClick: onPageRefresh,
    },
    {
      key: 'edit',
      text: 'Edit Camera',
      iconProps: {
        iconName: 'Edit',
      },
      onClick: () => history.push(generatePath(Url.CAMERAS_EDIT, { step: 'basics', id: camera.id })),
    },
  ];

  if (loding) return <></>;

  return (
    <>
      <CommandBar items={commandBarItems} styles={{ root: { paddingLeft: '0', marginBottom: '10px' } }} />
      <div style={{ height: '80%' }}>
        <RTSPVideo cameraId={camera.symphony_id} />
      </div>
      {localSelectedCamera && (
        <CameraSidePanel
          camereId={camera.id}
          symphonyId={camera.symphony_id}
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

export default LiveFeed;
