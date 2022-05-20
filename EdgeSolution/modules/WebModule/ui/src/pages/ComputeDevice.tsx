import React, { useEffect } from 'react';
import { Stack, Label } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route } from 'react-router-dom';

import { theme, Url } from '../constant';
import { getComputeDeviceList } from '../store/computeDeviceSlice';

import ComputeDeviceDetail from '../components/ComputeDevice/ComputeDeviceDetail';
import ComputeDeviceCreation from '../components/ComputeDevice/ComputeDeviceCreation';

const ComputeDevice = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getComputeDeviceList());
  }, [dispatch]);

  return (
    <Stack styles={{ root: { height: '100%', padding: '35px 20px 0', position: 'relative' } }}>
      <Label styles={{ root: { fontSize: '24px', lineHeight: '32px', color: theme.palette.neutralPrimary } }}>
        Compute Devices
      </Label>
      <Switch>
        <Route path={Url.COMPUTE_DEVICE_CREATION} component={ComputeDeviceCreation} />
        <Route path={Url.COMPUTE_DEVICE} render={() => <ComputeDeviceDetail />} />
      </Switch>
    </Stack>
  );
};

export default ComputeDevice;
