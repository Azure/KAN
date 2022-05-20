import React, { useEffect } from 'react';
import { Stack, Label } from '@fluentui/react';
import { Switch, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { Url } from '../constant';
import { getCameras } from '../store/cameraSlice';

import DeploymentCreation from '../components/Deployments/DeploymentCreation';
import DeploymentDetail from '../components/Deployments/DeploymentDetail';

const Deployment2 = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCameras(false));
  }, [dispatch]);

  return (
    <Stack styles={{ root: { height: '100%', padding: '35px 20px 0', position: 'relative' } }}>
      <Label styles={{ root: { fontSize: '24px', lineHeight: '32px' } }}>Deployments</Label>

      <Switch>
        <Route path={Url.DEPLOYMENT2_CREATION} component={DeploymentCreation} />
        <Route path={Url.DEPLOYMENT2} render={() => <DeploymentDetail />} />
      </Switch>
    </Stack>
  );
};

export default Deployment2;
