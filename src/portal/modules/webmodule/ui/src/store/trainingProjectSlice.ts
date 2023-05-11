import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';

import { State } from 'RootStateType';
import {
  getInitialDemoState,
  isCRDAction,
  insertDemoFields,
  getSliceApiByDemo,
  getNonDemoSelector,
} from './shared/DemoSliceUtils';
import { createWrappedAsync } from './shared/createWrappedAsync';
import { getParts } from './partSlice';
// import { thunkGetAllCvProjects } from './setting/settingAction';
import { getTrainingProjectStatusList } from './trainingProjectStatusSlice';
import {
  CreateCustomVisionModelPayload,
  AddExistingCustomVisionModelPayload,
  ModelProjectType,
  ModelCategory,
  ModelNodeType,
  TrainingProject,
} from './types';
import { getModleZooDisplayName } from './utils';
import {
  customViisionModelAcceleration,
  openVinoModelAcceleration,
  Acceleration,
} from '../components/constant';
import rootRquest from './rootRquest';

export type Params = { confidence_threshold: string; filter_label_id: string };

export type NodeType = 'source' | 'openvino_model' | 'openvino_library' | 'sink' | 'customvision_model';
// type TrainingProjectCategory = 'customvision' | 'openvino';
export type MetadataType = 'image' | 'bounding_box' | 'classification' | 'regression';
export type ProjectType = 'ObjectDetection' | 'Classification';
export type ClassificationType = '' | 'Multiclass' | 'Multilabel';

export type Metadata = {
  type: MetadataType;
  shape: number[];
  layout: string[];
  color_format: string;
  labels?: string[];
};

export type CreatOwnModelPayload = {
  is_prediction_module: boolean;
  name: string;
  labels: string;
  prediction_uri: string;
  prediction_header: string;
};

export type UpdateCustomVisionProjectTagsPayload = {
  id: string;
  tags: string[];
};

const getModelDisplayName = (modelName: string, nodeType: ModelNodeType) => {
  if (nodeType === 'source') return 'Camera input';
  if (nodeType === 'transform' && modelName === 'filter_transform') return 'Filter';
  if (nodeType === 'transform' && modelName === 'grpc_transform') return 'gRPC Custom Processing';
  if (nodeType === 'export' && modelName === 'video_snippet_export') return 'Export Video Snippet';
  if (nodeType === 'export' && modelName === 'iothub_export') return 'Send Insights to IoT Hub';
  if (nodeType === 'export' && modelName === 'iotedge_export') return 'Send Insights to IoT Edge Module';
  if (nodeType === 'export' && modelName === 'http_export') return 'Send Insights to HTTP Endpoint';
  if (nodeType === 'export' && modelName === 'mqtt_export') return 'Send Insights to MQTT Endpoint';

  return modelName;
};

const getArrayObject = (input: string) => {
  try {
    return JSON.parse(input);
  } catch (e) {
    return [];
  }
};

const normalize = (e): TrainingProject => ({
  id: e.id,
  name: e.name,
  customVisionId: e.customvision_id,
  isDemo: e.is_demo,
  isPredicationModel: e.is_prediction_module,
  predictionUri: e.prediction_uri,
  predictionHeader: e.prediction_header,
  category: e.category,
  projectType: e.project_type,
  isCascade: e.is_cascade,
  inputs: getArrayObject(e.inputs),
  outputs: getArrayObject(e.outputs),
  nodeType: e.node_type,
  // demultiply_count: e.demultiply_count,
  combined: e.combined,
  openvino_library_name: e.openvino_library_name,
  openvino_model_name: e.openvino_model_name,
  download_uri_openvino: e.download_uri_openvino,
  classification_type: e.classification_type,
  is_trained: e.is_trained,
  kan_id: e.kan_id,
  accelerationList: (e.category === 'customvision'
    ? customViisionModelAcceleration
    : openVinoModelAcceleration) as Acceleration[],
  tag_list: getArrayObject(e.tag_list),

  // Display
  displayName: getModelDisplayName(e.name, e.node_type as ModelNodeType),
  displayType: e.project_type === 'ObjectDetection' ? 'Object Detection' : 'Classification',
  trainStatus: e.is_trained ? 'Trained' : 'Untrained',
});

const extractConvertCustomProject = (project) => {
  return {
    is_prediction_module: true,
    name: project.name,
    labels: project.labels,
    prediction_uri: project.endPoint,
    prediction_header: project.header,
  };
};

export const getTrainingProject = createWrappedAsync<any, boolean, { state: State }>(
  'trainingSlice/get',
  async (isDemo): Promise<TrainingProject[]> => {
    // FIXME Make it better!
    const response = await getSliceApiByDemo('projects', true);
    return response.data.map(normalize);
  },
  // {
  //   condition: (isDemo, { getState }) => {
  //     if (isDemo && getState().trainingProject.isDemo.length) return false;
  //     if (!isDemo && getState().trainingProject.nonDemo.length) return false;
  //     return true;
  //   },
  // },
);

export const getSingleTrainingProject = createWrappedAsync<any, number, { state: State }>(
  'trainingSlice/getSingleProject',
  async (projectId) => {
    const response = await rootRquest(`/api/projects/${projectId}`);

    return normalize(response.data);
  },
);

export const refreshTrainingProject = createWrappedAsync(
  'trainingProject/refresh',
  async (_, { dispatch }) => {
    const response = await rootRquest(`/api/projects/`);
    dispatch(getParts());
    return response.data.map(normalize);
  },
);

export const addExistingCustomVisionProject = createWrappedAsync<
  any,
  AddExistingCustomVisionModelPayload,
  { state: State }
>('trainingProject/addExistingCustomVisionProject', async ({ customVisionId }, { dispatch }) => {
  await rootRquest.get(`/api/projects/pull_cv_project?customvision_project_id=${customVisionId}&partial=1`);
  // Get training project because the origin project name will be mutate
  dispatch(refreshTrainingProject());
  dispatch(getParts());
  dispatch(getTrainingProjectStatusList());
});

export const getCustomVisionProjectDefinition = createWrappedAsync<any, number, { state: State }>(
  'trainingSlice/getDefinition',
  async (id) => {
    const response = await rootRquest.get(`/api/projects/${id}/get_properties`);

    return response.data;
  },
);

export const createCustomVisionProject = createWrappedAsync<any, CreateCustomVisionModelPayload>(
  'trainingSlice/createCustomVisionProject',
  async (payload, { dispatch }) => {
    await rootRquest.post(`/api/projects/9/create_cv_project/`, payload);

    dispatch(refreshTrainingProject());
    dispatch(getParts());
    // dispatch(thunkGetAllCvProjects());
    dispatch(getTrainingProjectStatusList());
  },
);

export const updateCustomVisionProjectTags = createWrappedAsync<
  any,
  UpdateCustomVisionProjectTagsPayload,
  { state: State }
>('trainingSlice/updateCustomVisionTags', async ({ id, tags }, { dispatch }) => {
  await rootRquest.post(`/api/projects/${id}/update_tags`, { tags });

  dispatch(getParts());
  dispatch(refreshTrainingProject());
});

export const createCustomProject = createWrappedAsync<any, CreatOwnModelPayload, { state: State }>(
  'trainingSlice/createNewCustom',
  async (payload) => {
    const response = await rootRquest.post(`/api/projects`, payload);
    return normalize(response.data);
  },
);

export const updateCustomProject = createWrappedAsync<any, any, { state: State }>(
  'trainingSlice/UpdateCustom',
  async (project) => {
    const data = extractConvertCustomProject(project);

    const response = await rootRquest.patch(`/api/projects/${project.id}`, data);
    return normalize(response.data);
  },
);

export const deleteTrainingProject = createWrappedAsync<any, { id: number }>(
  'trainingSlice/DeleteCustom',
  async ({ id }) => {
    await rootRquest.delete(`/api/projects/${id}/`);

    return id;
  },
);

export const getSelectedProjectInfo = createWrappedAsync<any, string, { state: State }>(
  'trainingSlice/GetSelectedProjectInfo',
  async (id, { getState }) => {
    const settingId = getState().setting.id;

    // await rootRquest.delete(`/api/settings/9/project_info?customvision_id=${id}`);
    const response = await rootRquest.get(`/api/settings/${settingId}/project_info?customvision_id=${id}`);

    return response.data;
  },
);

export const trainCustomVisionProject = createWrappedAsync<any, number>(
  'trainingSlice/updateCustomVisionProject',
  async (projectId) => {
    await rootRquest.get(`/api/projects/${projectId}/retrain`);
  },
);

const entityAdapter = createEntityAdapter<TrainingProject>();

const slice = createSlice({
  name: 'trainingSlice',
  initialState: getInitialDemoState(entityAdapter.getInitialState()),
  reducers: {
    onEmptySelectedProjectInfo: (state) => ({
      ...state,
      selectedProjectInfo: null,
      selectedProjectStatus: null,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTrainingProject.fulfilled, entityAdapter.setAll)
      .addCase(getSingleTrainingProject.fulfilled, entityAdapter.upsertOne)
      .addCase(refreshTrainingProject.fulfilled, entityAdapter.setAll)
      .addCase(createCustomProject.fulfilled, entityAdapter.upsertOne)
      .addCase(updateCustomProject.fulfilled, entityAdapter.upsertOne)
      .addCase(deleteTrainingProject.fulfilled, entityAdapter.removeOne)
      .addCase(getSelectedProjectInfo.fulfilled, (state, action) => {
        const { payload } = action;

        state.selectedProjectInfo = payload;
      })
      .addMatcher(isCRDAction, insertDemoFields);
  },
});

const { reducer } = slice;
export default reducer;

export const {
  selectAll: selectAllTrainingProjects,
  selectById: selectTrainingProjectById,
  selectEntities: selectTrainingProjectEntities,
} = entityAdapter.getSelectors((state: State) => state.trainingProject);
export const { onEmptySelectedProjectInfo } = slice.actions;

export const selectNonDemoProject = getNonDemoSelector('trainingProject', selectTrainingProjectEntities);

/**
 * Return the non demo project in the shape of IDropdownOptions.
 * If the given training project is in the predefined scenarios, also return the training project of the scenario.
 * @param trainingProjectId
 */
export const trainingProjectOptionsSelectorFactory = (trainingProjectId: number) =>
  createSelector(
    [selectAllTrainingProjects, (state: State) => state.scenario],
    (trainingProjects, scenarios) => {
      const relatedScenario = scenarios.find((e) => e.trainingProject === trainingProjectId);

      const optionsList = trainingProjects
        .filter(
          (t) =>
            t.id === relatedScenario?.trainingProject || (!t.isDemo && ['customvision'].includes(t.category)),
        )
        .map((e) => ({
          key: e.id,
          text: e.name,
          title: 'model',
          disabled: !e.is_trained,
        }));

      return optionsList;
    },
  );

export const trainingProjectIsPredictionModelFactory = () =>
  createSelector(selectAllTrainingProjects, (entities) =>
    entities.filter((project) => !project.isDemo).filter((project) => project.id !== 9),
  );

export const customVisionTrainingProjectFactory = () =>
  createSelector(selectAllTrainingProjects, (entities) =>
    entities.filter((project) => !project.isDemo).filter((project) => project.category === 'customvision'),
  );

export const trainingProjectModelFactory = (categroy: ModelCategory) =>
  createSelector(selectAllTrainingProjects, (entities) =>
    entities
      .filter((project) => !project.isDemo && project.category === categroy)
      .map((project) => ({ ...project, name: getModleZooDisplayName(project.name) })),
  );

export const trainingProjectIsCascadesFactory = () =>
  createSelector(selectAllTrainingProjects, (entities) =>
    entities.filter((project) => !project.isDemo).filter((project) => project.isCascade),
  );

export const projectTypeModelSelectorFactory = (projectType: ModelProjectType, acceleration: string) =>
  createSelector(selectAllTrainingProjects, (entities) => {
    const matchedCategory: ModelCategory[] = ['customvision'];

    if (openVinoModelAcceleration.includes(acceleration)) matchedCategory.push('modelzoo');

    return entities.filter(
      (project) =>
        !project.isDemo && project.projectType === projectType && matchedCategory.includes(project.category),
    );
  });

export const nodeTypeModelFactory = (nodeTypeList: ModelNodeType[]) =>
  createSelector(selectAllTrainingProjects, (entities) =>
    entities.filter((project) => !project.isDemo && nodeTypeList.includes(project.nodeType)),
  );
