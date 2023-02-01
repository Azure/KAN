import { createEntityAdapter, createSlice, createSelector } from '@reduxjs/toolkit';
import { pick, max } from 'ramda';

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
  DeleteDeploymentPayload,
} from './types';

type DeploymentForServer = {
  id: number;
  name: string;
  configure: string;
  tag_list: string;
  kan_id: string;
  compute_device: string;
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

const normalizeDeployment = (deployment: DeploymentForServer, id: number): Deployment => {
  return {
    ...deployment,
    id,
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
    const response = await rootRquest.get('/api/deployments/get_kan_objects');

    return response.data.map((result, i) => normalizeDeployment(result, i + 1));
  },
);

export const getDeploymentInsight = createWrappedAsync<any, GetDeploymentInsightPayload, { state: State }>(
  'Deployment/getDeploymentInsight',
  async ({ deploymentKanId, skillKanId, cameraKanId }) => {
    const response = await rootRquest.get(
      `/api/deployments/list_deployment_insights?instance_kan_id=${deploymentKanId}&skill_kan_id=${skillKanId}&device_kan_id=${cameraKanId}`,
    );
    return response.data;
  },
);

export const getDeploymentDefinition = createWrappedAsync<any, string>(
  'Deployment/getDeploymentDefinition',
  async (kan_id) => {
    const response = await rootRquest.get(`/api/deployments/get_properties?kan_id=${kan_id}`);

    return response.data;
  },
);

export const getDeploymentVideoRecordings = createWrappedAsync<
  any,
  GetDeploymentVideoRecordingsPayload,
  { state: State }
>('Deployment/getCameraVideoRecording', async ({ deploymentName, skillName, cameraName }) => {
  const response = await rootRquest.get(
    `/api/deployments/list_deployment_videos?instance_displayname=${deploymentName}&skill_displayname=${skillName}&device_displayname=${cameraName}`,
  );

  return response.data;
});

export const createDeployment = createWrappedAsync<any, CreateDeploymentPayload, { state: State }>(
  'Deployment/create',
  async (payload, { getState }) => {
    const maxId = getState().camera.ids.reduce((m, id) => {
      return max(m, id);
    }, 0);

    const response = await rootRquest.post('/api/deployments/create_kan_object', payload);
    return normalizeDeployment(response.data, +maxId + 1);
  },
);

export const updateDeployment = createWrappedAsync<any, UpdateDeploymentPayload, { state: State }>(
  'deployment/patch',
  async ({ body, id, kan_id }) => {
    const response = await rootRquest.patch(`/api/deployments/update_kan_object?kan_id=${kan_id}`, body);

    return normalizeDeployment(response.data, id);
  },
);

export const deleteDeployment = createWrappedAsync<any, DeleteDeploymentPayload, { state: State }>(
  'deployment/delete',
  async ({ id, kan_id }) => {
    await rootRquest.delete(`/api/deployments/delete_kan_object?kan_id=${kan_id}`);

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

export const selectHasUseAiSkillSelectorFactory = (skillKanId: string) =>
  createSelector(selectAllDeployments, (deploymentList) => {
    if (deploymentList.length === 0) return false;

    const result = deploymentList
      .map((deployment) => deployment.configure.map((configure) => configure.skills.map((skill) => skill.id)))
      .flat(2)
      .some((skill) => skill === skillKanId);

    return result;
  });

export const selectHasCameraDeploymentSelectorFactory = (cameraSymphonId: string) =>
  createSelector(selectAllDeployments, (deploymentList) => {
    if (deploymentList.length === 0) return false;

    const result = deploymentList
      .reduce((acc, deployment) => [...acc, ...deployment.configure.map((configure) => configure.camera)], [])
      .some((camera) => camera === cameraSymphonId);

    return result;
  });

export const selectHasDeviceDeploymentSelectorFactory = (deviceKanId: string) =>
  createSelector(selectAllDeployments, (deploymentList) => {
    if (deploymentList.length === 0) return false;

    const result = deploymentList
      .reduce((acc, deployment) => [...acc, deployment.compute_device], [])
      .some((device) => device === deviceKanId);

    return result;
  });
