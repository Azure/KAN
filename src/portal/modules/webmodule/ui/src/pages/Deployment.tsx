// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import { Label, Stack, IconButton } from '@fluentui/react';
import { Switch, Route, useRouteMatch, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Url } from '../constant';
import { getCameras } from '../store/cameraSlice';
import { getComputeDeviceList } from '../store/computeDeviceSlice';
import { getAiSkillList } from '../store/cascadeSlice';
import { getLocations } from '../store/locationSlice';
import { getDeployments } from '../store/deploymentSlice';
import { formattedDeploymentSelectorFactory } from '../store/selectors';

import DeploymentCreation from '../components/Deployments/DeploymentCreation';
import DeploymentWrapper from '../components/Deployments/DeploymentWrapper';
import DeploymentEdit from '../components/Deployments/DeploymentEdit';
import DeploymentSkillList from '../components/Deployments/DeploymentSkillList';
import DeploymentSkillCamera from '../components/Deployments/DeploymentSkillCamera';
import PageLoading from '../components/Common/PageLoading';

const DEPLOYMENT = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const isRouteMatch = useRouteMatch([
    Url.DEPLOYMENT_DETAIL,
    Url.DEPLOYMENT_DETAIL_SKILL,
    Url.DEPLOYMENT_EDIT,
  ]);
  const isEditRouteMatch = useRouteMatch(Url.DEPLOYMENT_EDIT);
  const isCancelMatch = useRouteMatch([Url.DEPLOYMENT_CREATION, Url.DEPLOYMENT_EDIT]);
  const isDeploymentDetail = useRouteMatch(Url.DEPLOYMENT_DETAIL);

  const formattedDeploymentList = useSelector(formattedDeploymentSelectorFactory);

  console.log('formattedDeploymentList', formattedDeploymentList);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await dispatch(getComputeDeviceList());
      await dispatch(getCameras(false));
      await dispatch(getAiSkillList());
      await dispatch(getDeployments());
      await dispatch(getLocations(false));
      setIsLoading(false);
    })();
  }, [dispatch]);

  if (isLoading) return <PageLoading />;

  return (
    <section style={{ height: '100%', position: 'relative' }}>
      {!isDeploymentDetail && (
        <Stack
          horizontal
          verticalAlign="center"
          horizontalAlign="space-between"
          styles={{ root: { padding: '35px 20px 0' } }}
        >
          <Label styles={{ root: { fontSize: '24px', lineHeight: '32px' } }}>
            {!isRouteMatch && 'Deployments'}
            {isEditRouteMatch && 'Edit Deployments'}
          </Label>
          {isCancelMatch && (
            <IconButton iconProps={{ iconName: 'Cancel' }} onClick={() => history.push(Url.DEPLOYMENT)} />
          )}
        </Stack>
      )}
      <Switch>
        <Route path={Url.DEPLOYMENT_DETAIL_SKILL} render={() => <DeploymentSkillCamera />} />
        <Route path={Url.DEPLOYMENT_DETAIL} render={() => <DeploymentSkillList />} />
        <Route path={Url.DEPLOYMENT_EDIT} render={() => <DeploymentEdit />} />
        <Route
          path={Url.DEPLOYMENT_CREATION}
          render={() => (
            <DeploymentCreation
              existingNameList={formattedDeploymentList.map((deployment) => deployment.name)}
            />
          )}
        />
        <Route
          path={Url.DEPLOYMENT}
          render={() => <DeploymentWrapper formattedDeploymentList={formattedDeploymentList} />}
        />
      </Switch>
    </section>
  );
};

export default DEPLOYMENT;
