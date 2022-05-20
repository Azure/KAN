import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Stack, Label, IconButton } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { theme, Url } from '../constant';
import { Camera, selectCameraById, getCameras } from '../store/cameraSlice';

import CameraLiveFeed from '../components/Cameras/CameraLiveFeed';
import { getLocations } from '../store/locationSlice';

const Camera2LiveFeed = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const history = useHistory();

  const camera = useSelector<RootState, Camera>((state) => selectCameraById(state, id));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await dispatch(getCameras(false));
      await dispatch(getLocations(false));
      setIsLoading(false);
    })();
  }, [dispatch]);

  const onCameraPageREdirect = useCallback(() => history.push(Url.CAMERAS2), [history]);

  if (isLoading || !camera) return <h1>Loading...</h1>;

  return (
    <Stack styles={{ root: { height: '100%', padding: '35px 20px 0', position: 'relative' } }}>
      <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
        <Label
          styles={{ root: { fontSize: '24px', lineHeight: '32px', color: theme.palette.neutralPrimary } }}
        >
          {camera.name} Live Feed
        </Label>
        <IconButton iconProps={{ iconName: 'Cancel' }} onClick={onCameraPageREdirect} />
      </Stack>

      <CameraLiveFeed camera={camera} />
    </Stack>
  );
};

export default Camera2LiveFeed;
