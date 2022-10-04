// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Stack, Label, IconButton, DefaultButton } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { theme, Url } from '../constant';
import { Camera, selectCameraById, getCameras } from '../store/cameraSlice';
import { getCameraLiveFeedClasses } from './styles';

import CameraLiveFeed from '../components/Cameras/CameraPlayback/CameraLiveFeed';
import { getLocations } from '../store/locationSlice';

const Camera2LiveFeed = () => {
  const { id } = useParams<{ id: string }>();

  const dispatch = useDispatch();
  const history = useHistory();
  const classes = getCameraLiveFeedClasses();

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

  const onCameraPageREdirect = useCallback(() => history.push(Url.CAMERAS), [history]);

  if (isLoading || !camera) return <h1>Loading...</h1>;

  return (
    <section className={classes.section}>
      <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
        <Label styles={{ root: classes.label }}>{camera.name} Playback</Label>
        <IconButton iconProps={{ iconName: 'Cancel' }} onClick={onCameraPageREdirect} />
      </Stack>

      <CameraLiveFeed camera={camera} />
      <Stack
        styles={{
          root: classes.buttonWrapper,
        }}
      >
        <DefaultButton
          styles={{ root: classes.button }}
          iconProps={{ iconName: 'ChevronLeft' }}
          onClick={() => history.push(Url.CAMERAS)}
        >
          Back to Cameras
        </DefaultButton>
      </Stack>
    </section>
  );
};

export default Camera2LiveFeed;
