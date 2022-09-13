import { createEntityAdapter, createSlice, createSelector } from '@reduxjs/toolkit';
import { pick } from 'ramda';

import { State } from 'RootStateType';
import rootRquest from './rootRquest';
import { createWrappedAsync } from './shared/createWrappedAsync';
import {
  Deployment,
  CreateDeploymentPayload,
  UpdateDeploymentPayload,
  GetDeploymentVideoRecordingsPayload,
  DeploymentFPS,
  GetDeploymentInsightPayload,
} from './types';

type DeploymentForServer = {
  id: number;
  name: string;
  configure: string;
  tag_list: string;
  symphony_id: string;
  compute_device: number;
  status: string;
  iothub_insights: string;
};

const getArrayObject = (object: string) => {
  try {
    return JSON.parse(object);
  } catch (e) {
    return [];
  }
};

const getStatusObject = (status: string) => {
  try {
    const parseContent = JSON.parse(status) as { status_code: string; status_description: string };

    const fps: DeploymentFPS = Object.entries(parseContent)
      .filter(([key]) => key.match(/fps_skill-/))
      .reduce((acc, [key, value]) => ({ ...acc, [key.replace('fps_', '')]: value }), {});

    return {
      ...pick(['status_code', 'status_description'], parseContent),
      fps,
    };
  } catch (e) {
    return { status_code: '400', status_description: '', fps: {} };
  }
};

const entityAdapter = createEntityAdapter<Deployment>();

const normalizeDeployment = (deployment: DeploymentForServer): Deployment => {
  return {
    ...deployment,
    compute_device: deployment.compute_device,
    tag_list: getArrayObject(deployment.tag_list),
    configure: getArrayObject(deployment.configure),
    status: getStatusObject(deployment.status),
    iothub_insights: getArrayObject(deployment.iothub_insights),
  };
};

export const getDeployments = createWrappedAsync<any, undefined, { state: State }>(
  'Deployment/get',
  async () => {
    const response = await rootRquest.get('/api/deployments/');
    return response.data.map((result) => normalizeDeployment(result));
  },
);

export const getDeploymentInsight = createWrappedAsync<any, GetDeploymentInsightPayload, { state: State }>(
  'Deployment/getDeploymentInsight',
  async ({ deployment, skill_symphony_id, camera_symphony_id }) => {
    const response = await rootRquest.get(
      `/api/deployments/${deployment}/list_deployment_insights?skill_symphony_id=${skill_symphony_id}&device_symphony_id=${camera_symphony_id}`,
    );
    return response.data;
  },
);

export const getDeploymentProperty = createWrappedAsync<any, number, { state: State }>(
  'Deployment/getDeploymentInsight',
  async (id) => {
    const response = await rootRquest.get(`/api/deployments/${id}/get_deployment_properties`);
    return response.data;
  },
);

export const getDeploymentVideoRecordings = createWrappedAsync<
  any,
  GetDeploymentVideoRecordingsPayload,
  { state: State }
>('Deployment/getCameraVideoRecording', async ({ deployment, skillName, cameraName }) => {
  const response = await rootRquest.get(
    `/api/deployments/${deployment}/list_deployment_videos?skill_displayname=${skillName}&device_displayname=${cameraName}`,
  );
  return response.data;
});

export const createDeployment = createWrappedAsync<any, CreateDeploymentPayload, { state: State }>(
  'Deployment/create',
  async (payload) => {
    const response = await rootRquest.post('/api/deployments/', payload);
    return normalizeDeployment(response.data);
  },
);

export const updateDeployment = createWrappedAsync<any, UpdateDeploymentPayload, { state: State }>(
  'deployment/patch',
  async ({ body, id }) => {
    const response = await rootRquest.patch(`/api/deployments/${id}/`, body);

    return normalizeDeployment(response.data);
  },
);

export const deleteDeployment = createWrappedAsync<any, number, { state: State }>(
  'deployment/delete',
  async (id) => {
    await rootRquest.delete(`/api/deployments/${id}/`);
    return id;
  },
);

const slice = createSlice({
  name: 'deployment',
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDeployments.fulfilled, entityAdapter.setAll)
      .addCase(createDeployment.fulfilled, entityAdapter.upsertOne)
      .addCase(updateDeployment.fulfilled, entityAdapter.upsertOne)
      .addCase(deleteDeployment.fulfilled, entityAdapter.removeOne);
  },
});

const { reducer } = slice;
export default reducer;

export const {
  selectAll: selectAllDeployments,
  selectById: selectDeploymentById,
  selectEntities: selectDeploymentEntities,
} = entityAdapter.getSelectors<State>((state) => state.deployment);

export const selectHasUseAiSkillSelectoryFactory = (skillId: number) =>
  createSelector(selectAllDeployments, (deploymentList) => {
    if (deploymentList.length === 0) return false;

    const result = deploymentList
      .map((deployment) => deployment.configure.map((configure) => configure.skills.map((skill) => skill.id)))
      .flat(2)
      .some((skill) => skill === skillId);

    return result;
  });
