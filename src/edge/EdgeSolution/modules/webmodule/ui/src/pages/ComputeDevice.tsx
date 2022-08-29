// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import { Label, IconButton, Stack } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { Switch, Route, useRouteMatch, useHistory } from 'react-router-dom';

import { State as RootState } from 'RootStateType';
import { Url } from '../constant';
import { getComputeDeviceList, selectAllComputeDevices } from '../store/computeDeviceSlice';
import { getPageClasses } from './styles';

import DeviceDetailWrapper from '../components/ComputeDevice/DeviceDetailWrapper';
import DeviceCreation from '../components/ComputeDevice/DeviceCreation';
import DeviceEdit from '../components/ComputeDevice/DeviceEdit';
import PageLoading from '../components/Common/PageLoading';

const ComputeDevice = () => {
  const claases = getPageClasses();
  const dispatch = useDispatch();
  const history = useHistory();

  const deviceList = useSelector((state: RootState) => selectAllComputeDevices(state));

  const [isLoading, setIsLoading] = useState(true);
  const isRouteMatch = useRouteMatch([Url.COMPUTE_DEVICE_CREATION, Url.COMPUTE_DEVICE_EDIT]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await dispatch(getComputeDeviceList());
      setIsLoading(false);
    })();
  }, [dispatch]);

  if (isLoading) return <PageLoading />;

  return (
    <section className={claases.section} style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Stack verticalAlign="center" horizontalAlign="space-between" horizontal>
        <Label styles={{ root: claases.pageTitle }}>Compute Devices</Label>
        {!!isRouteMatch && (
          <IconButton iconProps={{ iconName: 'Cancel' }} onClick={() => history.push(Url.COMPUTE_DEVICE)} />
        )}
      </Stack>

      <Switch>
        <Route path={Url.COMPUTE_DEVICE_EDIT} render={() => <DeviceEdit />} />
        <Route
          path={Url.COMPUTE_DEVICE_CREATION}
          render={() => <DeviceCreation exisintNameList={deviceList.map((device) => device.name)} />}
        />
        <Route path={Url.COMPUTE_DEVICE} render={() => <DeviceDetailWrapper deviceList={deviceList} />} />
      </Switch>
    </section>
  );
};

export default ComputeDevice;
