import React, { useEffect, useState, useCallback } from 'react';
import { Stack, ProgressIndicator, DefaultButton, IconButton, Label } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route, useLocation, useHistory } from 'react-router-dom';

import { State as RootState } from 'RootStateType';
import { theme, Url } from '../constant';
import { thunkCancelCameraSetting } from '../store/cameraSetting/cameraSettingActions';
import { getCameras, selectAllCameras } from '../store/cameraSlice';
import { getLocations } from '../store/locationSlice';

import CamerasWrapper from '../components/Cameras/CamerasWrapper';
import CameraCreation from '../components/Cameras/CameraCreation';

const Cameras2 = () => {
  const [isLoading, setIsLoading] = useState(true);

  const cameraList = useSelector((state: RootState) => selectAllCameras(state));
  const isMediaSourceCameraCreating = useSelector((state: RootState) => state.cameraSetting.isCreating);

  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await dispatch(getCameras(false));
      await dispatch(getLocations(false));
      setIsLoading(false);
    })();
  }, [dispatch]);

  const onMediaSourceCameraCancel = useCallback(() => {
    dispatch(thunkCancelCameraSetting());
  }, [dispatch]);

  const onCameraPageREdirect = useCallback(() => history.push(Url.CAMERAS2), [history]);

  if (isLoading) return <h1>Loading...</h1>;

  return (
    <Stack styles={{ root: { height: '100%', padding: '35px 20px 0', position: 'relative' } }}>
      <Stack styles={{ root: { position: 'relative' } }} horizontal horizontalAlign="space-between">
        <Label
          styles={{ root: { fontSize: '24px', lineHeight: '32px', color: theme.palette.neutralPrimary } }}
        >
          Cameras
        </Label>
        {isMediaSourceCameraCreating && (
          <Stack
            styles={{
              root: {
                position: 'absolute',
                top: '15px',
                left: '200px',
                '> div': {
                  marginTop: '5px',
                },
              },
            }}
            horizontal
            horizontalAlign="center"
            tokens={{ childrenGap: '20px' }}
          >
            <ProgressIndicator styles={{ root: { width: '500px' } }} />
            <DefaultButton text="Cancel" onClick={onMediaSourceCameraCancel} />
          </Stack>
        )}
        {location.pathname !== Url.CAMERAS2 && (
          <IconButton iconProps={{ iconName: 'Cancel' }} onClick={onCameraPageREdirect} />
        )}
      </Stack>
      <Switch>
        <Route path={Url.CAMERAS2_CREATION} component={CameraCreation} />
        <Route path={Url.CAMERAS2} render={() => <CamerasWrapper cameraList={cameraList} />} />
      </Switch>
    </Stack>
  );
};

export default Cameras2;
