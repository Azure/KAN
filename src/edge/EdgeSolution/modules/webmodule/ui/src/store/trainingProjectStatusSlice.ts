import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';

import { State } from 'RootStateType';
import { createWrappedAsync } from './shared/createWrappedAsync';
import rootRquest from './rootRquest';

export type TrainingStatus = 'ok' | 'Training' | 'Failed' | 'Success' | 'No change';

export interface Status {
  id: number;
  log: string;
  need_to_send_notification: boolean;
  performance: string;
  project: number;
  status: TrainingStatus;
}

export const getTrainingProjectStatusList = createWrappedAsync('trainingProjectStatusSlice/get', async () => {
  const response = await rootRquest('/api/training_status');

  return response.data;
});

export const getOneTrainingProjectStatus = createWrappedAsync<any, number>(
  'trainingProjectStatusSlice/getOne',
  async (projectId) => {
    const response = await rootRquest(`/api/training_status/${projectId}`);

    return response.data;
  },
);

const entityAdapter = createEntityAdapter<Status>();

const slice = createSlice({
  name: 'trainingProjectStatusSlice',
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getTrainingProjectStatusList.fulfilled, entityAdapter.setAll);
    builder.addCase(getOneTrainingProjectStatus.fulfilled, entityAdapter.upsertOne);
  },
});

const { reducer } = slice;

export const { selectAll: selectAllTrainingProjectsStatus, selectById: selectTrainingProjectStatusById } =
  entityAdapter.getSelectors((state: State) => state.trainingProjectStatus);

export const trainingProjectStatusFactory = (modeId: number) =>
  createSelector(selectAllTrainingProjectsStatus, (trainingProjectStatusList) =>
    trainingProjectStatusList.find((status) => status.project === modeId),
  );

// export const trainingProjectOptionsSelectorFactory = (trainingProjectId: number) =>
// createSelector(
//   [selectAllTrainingProjects, (state: State) => state.scenario],
//   (trainingProjects, scenarios) => {
//     const relatedScenario = scenarios.find((e) => e.trainingProject === trainingProjectId);

//     const optionsList = trainingProjects
//       .filter(
//         (t) =>
//           t.id === relatedScenario?.trainingProject || (!t.isDemo && ['customvision'].includes(t.category)),
//       )
//       .map((e) => ({
//         key: e.id,
//         text: e.name,
//         title: 'model',
//         disabled: !e.is_trained,
//       }));

//     return optionsList;
//   },
// );

export default reducer;
