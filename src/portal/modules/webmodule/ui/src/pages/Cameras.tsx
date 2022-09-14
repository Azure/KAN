// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState, useCallback } from 'react';
import { Stack, IconButton, Label } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route, useLocation, useHistory } from 'react-router-dom';

import { theme, Url } from '../constant';
import { getComputeDeviceList } from '../store/computeDeviceSlice';
import { getCameras } from '../store/cameraSlice';
import { getLocations } from '../store/locationSlice';
import { getDeployments } from '../store/deploymentSlice';
import { formattedCameraSelectoryFactory } from '../store/selectors';

import CamerasDetailWrapper from '../components/Cameras/CamerasDetailWrapper';
import CameraCreation from '../components/Cameras/CameraCreation';
import CameraEdit from '../components/Cameras/CameraEdit';
import PageLoading from '../components/Common/PageLoading';

const Cameras = () => {
  const [isLoading, setIsLoading] = useState(true);

  const formattedCameraList = useSelector(formattedCameraSelectoryFactory);

  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await dispatch(getComputeDeviceList());
      await dispatch(getCameras(false));
      await dispatch(getLocations(false));
      await dispatch(getDeployments());
      setIsLoading(false);
    })();
  }, [dispatch]);

  const onCameraPageRedirect = useCallback(() => history.push(Url.CAMERAS), [history]);

  if (isLoading) return <PageLoading />;

  return (
    <section style={{ height: 'calc(100% - 35px)', padding: '35px 20px 0', position: 'relative' }}>
      <Stack styles={{ root: { position: 'relative' } }} horizontal horizontalAlign="space-between">
        <Label
          styles={{ root: { fontSize: '24px', lineHeight: '32px', color: theme.palette.neutralPrimary } }}
        >
          Cameras
        </Label>
        {location.pathname !== Url.CAMERAS && (
          <IconButton iconProps={{ iconName: 'Cancel' }} onClick={onCameraPageRedirect} />
        )}
      </Stack>
      <Switch>
        <Route path={Url.CAMERAS_EDIT} render={() => <CameraEdit />} />
        <Route
          path={Url.CAMERAS_CREATION}
          render={() => (
            <CameraCreation existingNameList={formattedCameraList.map((camera) => camera.name)} />
          )}
        />
        <Route
          path={Url.CAMERAS}
          render={() => <CamerasDetailWrapper formattedList={formattedCameraList} />}
        />
      </Switch>
    </section>
  );
};

export default Cameras;
