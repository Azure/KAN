// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import { Stack, Label, IconButton } from '@fluentui/react';
import { Switch, Route, useHistory, useRouteMatch } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { Url } from '../constant';
import { getParts } from '../store/partSlice';
import { getImages } from '../store/imageSlice';
import { getTrainingProjectStatusList } from '../store/trainingProjectStatusSlice';
import { getTrainingProject } from '../store/trainingProjectSlice';
import { getAiSkillList } from '../store/cascadeSlice';
import { thunkGetAllCvProjects } from '../store/setting/settingAction';

import ModelCreation from '../components/Models/ModelCreation';
import ModelDetailWrapper from '../components/Models/ModelDetailWrapper';
import PageLoading from '../components/Common/PageLoading';

const Model = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const isCreationMatch = useRouteMatch([Url.MODELS_CREATION]);
  const isModelZooMatch = useRouteMatch([Url.MODELS_BROWSE_ZOO]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await dispatch(getParts());
      await dispatch(getTrainingProject(false));
      await dispatch(getImages({ freezeRelabelImgs: false }));
      await dispatch(getTrainingProjectStatusList());
      await dispatch(getAiSkillList());
      await dispatch(thunkGetAllCvProjects());
      setIsLoading(false);
    })();
  }, [dispatch]);

  if (isLoading) return <PageLoading />;

  return (
    <section style={{ height: 'calc(100% - 35px)', padding: '35px 20px 0', position: 'relative' }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        {isModelZooMatch ? (
          <Label styles={{ root: { fontSize: '24px', lineHeight: '32px' } }}>Model Zoo</Label>
        ) : (
          <Label styles={{ root: { fontSize: '24px', lineHeight: '32px' } }}>Models</Label>
        )}
        {isCreationMatch && (
          <IconButton iconProps={{ iconName: 'Cancel' }} onClick={() => history.push(Url.MODELS)} />
        )}
      </Stack>

      <Switch>
        <Route path={Url.MODELS_CREATION} component={ModelCreation} />
        <Route path={Url.MODELS} render={() => <ModelDetailWrapper />} />
      </Switch>
    </section>
  );
};

export default Model;
