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
    // status: getStatusObject(
    //   // '{"fps_skill-a8e21f30-0465-44b4-80a9-ff0570b33405": "9.7", "status_code": "0", "status_description": "running"}',
    //   '{"status_code": "0", "status_description": "running"}',
    // ),
    iothub_insights: getArrayObject(deployment.iothub_insights),
  };
};

export const getDeployments = createWrappedAsync<any, undefined, { state: State }>(
  'Deployment/get',
  async () => {
    const response = await rootRquest.get(
      '/api/deployments/',
      // 'http://20.89.186.195/api/deployments/',
    );
    return response.data.map((result) => normalizeDeployment(result));
  },
);

export const getDeploymentInsight = createWrappedAsync<any, GetDeploymentInsightPayload, { state: State }>(
  'Deployment/getDeploymentProperty',
  async ({ deployment, skill_symphony_id, camera_symphony_id }) => {
    const response = await rootRquest.get(
      `/api/deployments/${deployment}/list_deployment_insights?skill_symphony_id=${skill_symphony_id}&device_symphony_id=${camera_symphony_id}`,
      // 'http://20.89.186.195/api/deployments/1/list_deployment_insights?skill_symphony_id=skill-38802ff1-dbce-4da9-9eff-86d0fe9f9531&device_symphony_id=device-ac6d15a1-1aa0-41a6-ba4a-883fbd67feee',
    );
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
    // 'http://20.89.186.195/api/deployments/2/list_deployment_videos?skill_displayname=fcpu&device_displayname=f8',
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
