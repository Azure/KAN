import React, {
  FC,
  //  useEffect
} from 'react';
import {
  Switch,
  Route,
  Redirect,
  //  useHistory
} from 'react-router-dom';
import { useSelector } from 'react-redux';

import { State } from 'RootStateType';
import { Status } from '../store/project/projectTypes';
import { Url } from '../constant';

import { Home } from '../pages/Home';
import { Cameras } from '../pages/Cameras';
import CameraDetails from '../pages/CameraDetails';
import { PartDetails } from '../pages/PartDetails';
import { Parts } from '../pages/Parts';
import { Images } from '../pages/Images';
import { DeploymentPage } from '../pages/Deployment';
import { Models } from '../pages/Models';
import { ModelDetail } from '../pages/ModelDetail';
import ImageDetail from '../pages/ImageDetail';
import Cascades from '../pages/Cascades';
import Cameras2 from '../pages/Cameras2';
import Camera2LiveFeed from '../pages/Camera2LiveFeed';
import AzureLogin from '../pages/AzureLogin';
import ComputeDevice from '../pages/ComputeDevice';
import Deployment2 from '../pages/Deployment2';

export const RootRouter: FC = () => {
  // const history = useHistory();

  const projectHasConfiged = useSelector((state: State) => state.project.status !== Status.None);

  // useEffect(() => {
  //   if (!localStorage.getItem('azure_token')) {
  //     history.push(Url.AZURE_LOGIN);
  //   }
  // }, [history]);

  return (
    <Switch>
      <Route path={Url.DEPLOYMENT2} component={Deployment2} />
      <Route path={Url.COMPUTE_DEVICE} component={ComputeDevice} />
      <Route path={Url.AZURE_LOGIN} component={AzureLogin} />
      <Route path={Url.DEPLOYMENT} component={DeploymentPage} />
      <Route path={Url.CASCADES} component={Cascades} />
      <Route path={Url.MODELS_CV_MODEL} component={ModelDetail} />
      <Route path={Url.MODELS} component={Models} />
      <Route path={Url.CAMERAS_DETAIL} component={CameraDetails} />
      <Route path={Url.CAMERAS2_LIVE_FEED} component={Camera2LiveFeed} />
      <Route path={Url.CAMERAS2} component={Cameras2} />
      <Route path={Url.CAMERAS} component={Cameras} />
      <Route path={Url.PARTS_DETAIL} component={PartDetails} />
      <Route path={Url.PARTS} component={Parts} />
      <Route path={Url.IMAGES_DETAIL} component={ImageDetail} />
      <Route path={Url.IMAGES} component={Images} />
      <Route path={Url.HOME} component={Home} />
      <Route path={Url.ROOT}>
        <Redirect to={projectHasConfiged ? Url.DEPLOYMENT : Url.HOME} />
      </Route>
    </Switch>
  );
};
