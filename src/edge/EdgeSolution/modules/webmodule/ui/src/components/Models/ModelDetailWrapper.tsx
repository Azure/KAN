// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { ICommandBarItemProps, CommandBar } from '@fluentui/react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { projectTypeModelSelectorFactory } from '../../store/selectors';
import { commonCommandBarItems } from '../utils';
import { Url } from '../../constant';

import ModelDashboardWrapper from './ModelDetail/ModelDashboardWrapper';
import IntelModelZoo from './ModelDetail/IntelModelZooDashboard';

const ModelDetail = () => {
  const history = useHistory();

  const customVisionModelList = useSelector(projectTypeModelSelectorFactory('customvision'));
  const intelModelList = useSelector(projectTypeModelSelectorFactory('modelzoo'));

  const [isFilter, setIsFilter] = useState(false);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'addCustom',
      text: 'Create Custom Model',
      iconProps: {
        iconName: 'CircleAddition',
      },
      onClick: () => history.push(Url.MODELS_CREATION_BASIC),
    },
    {
      key: 'browseModel',
      text: 'Browse Model Zoo',
      iconProps: {
        iconName: 'Package',
      },
      onClick: () => history.push(Url.MODELS_BROWSE_ZOO),
    },
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: {
        iconName: 'Refresh',
      },
      buttonStyles: {
        root: { borderLeft: '1px solid #C8C6C4' },
      },
      onClick: () => history.go(0),
    },
    {
      key: 'filter',
      text: 'Filter',
      iconProps: {
        iconName: 'Filter',
      },
      onClick: () => setIsFilter((prev) => !prev),
    },
    ...commonCommandBarItems,
  ];

  return (
    <>
      <CommandBar styles={{ root: { marginTop: '24px', paddingLeft: 0 } }} items={commandBarItems} />
      <Switch>
        <Route path={Url.MODELS_BROWSE_ZOO} render={() => <IntelModelZoo modelList={intelModelList} />} />
        <Route
          path={Url.MODELS}
          render={() => <ModelDashboardWrapper modelList={customVisionModelList} isFilter={isFilter} />}
        />
      </Switch>
    </>
  );
};

export default ModelDetail;
