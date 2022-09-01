// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { Url } from '../constant';

// import { Home } from '../pages/deprecation/Home';
// import { Cameras } from '../pages/deprecation/Cameras';
// import CameraDetails from '../pages/deprecation/CameraDetails';
// import { PartDetails } from '../pages/deprecation/PartDetails';
// import { Parts } from '../pages/deprecation/Parts';
// import { Images } from '../pages/deprecation/Images';
// import { Models } from '../pages/Models';
// import ImageDetail from '../pages/deprecation/ImageDetail';
import CVModelPage from '../pages/CVModelPage';
import { DeploymentPage } from '../pages/deprecation/Deployment';
import Cameras from '../pages/Cameras';
import CameraLiveFeed from '../pages/CameraLiveFeed';
import AzureLogin from '../pages/AzureLogin';
import ComputeDevice from '../pages/ComputeDevice';
import Deployment from '../pages/Deployment';
import AiSkill from '../pages/AiSkill';
import Model from '../pages/Model';
import HomePage from '../pages/HomePage';

export const RootRouter: FC = () => {
  // const history = useHistory();

  // const projectHasConfiged = useSelector((state: State) => state.project.status !== Status.None);

  // useEffect(() => {
  //   if (!localStorage.getItem('azure_token')) {
  //     history.push(Url.AZURE_LOGIN);
  //   }
  // }, [history]);

  return (
    <Switch>
      <Route path={Url.AI_SKILL} component={AiSkill} />
      <Route path={Url.DEPLOYMENT} component={Deployment} />
      <Route path={Url.COMPUTE_DEVICE} component={ComputeDevice} />
      <Route path={Url.AZURE_LOGIN} component={AzureLogin} />
      <Route path={Url.DEPLOYMENT} component={DeploymentPage} />
      {/* <Route path={Url.CASCADES} component={Cascades} /> */}
      <Route path={Url.MODELS_CUSTOM_VISION_DETAIL} component={CVModelPage} />
      <Route path={Url.MODELS} component={Model} />
      <Route path={Url.CAMERAS_LIVE_FEED} component={CameraLiveFeed} />
      <Route path={Url.CAMERAS} component={Cameras} />
      {/* <Route path={Url.CAMERAS_DETAIL} component={CameraDetails} /> */}
      {/* <Route path={Url.CAMERAS} component={Cameras} /> */}
      {/* <Ro-- path={Url.PARTS} component={Parts} /> */}
      {/* <Route path={Url.IMAGES_DETAIL} component={ImageDetail} /> */}
      {/* <Route path={Url.IMAGES} component={Images} /> */}
      {/* <Route path={Url.HOME2} component={Home2} /> */}
      <Route path={Url.HOME} component={HomePage} />
      <Route path={Url.ROOT}>
        <Redirect to={Url.HOME} />
      </Route>
    </Switch>
  );
};
