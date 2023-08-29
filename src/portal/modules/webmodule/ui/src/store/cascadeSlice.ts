import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { max } from 'ramda';

import { State } from 'RootStateType';
import rootRquest from './rootRquest';
import { createWrappedAsync } from './shared/createWrappedAsync';

import { CreateAiSkillPayload, AiSkill, UpdateAiSkillPayload, DeleteAiSkillPayload } from './types';

export type Cascade = {
  id: number;
  name: string;
  flow: string;
  prediction_uri: string;
  raw_data: string;
  screenshot: string;
  symphony_id: string;
};

export type CascadePayload = {
  name: string;
  flow: string;
  raw_data: string;
};

export type CreateCascadePayload = CascadePayload & {
  screenshot: string;
};

export type UpdateCascadePayload = {
  id: number;
  data: CascadePayload & {
    screenshot: string;
  };
};

type AiSkillFromServer = {
  name: string;
  flow: string;
  screenshot: string;
  tag_list: string;
  symphony_id: string;
  fps: string;
  acceleration: string;
};

const getArrayObject = (tagList: string) => {
  try {
    return JSON.parse(tagList);
  } catch (e) {
    return [];
  }
};

const normalizeAiSkill = (aiSkill: AiSkillFromServer, id: number): AiSkill => {
  return {
    ...aiSkill,
    id,
    tag_list: getArrayObject(aiSkill.tag_list),
    fps: parseInt(aiSkill.fps, 10),
  };
};

const cascadesAdapter = createEntityAdapter<AiSkill>();

export const getAiSkillList = createWrappedAsync('AI-Skill/Get', async () => {
  const response = await rootRquest.get(`/api/cascades/get_symphony_objects`);

  return response.data.map((aiSkill, idx) => normalizeAiSkill(aiSkill, idx + 1));
});

export const getAiSkillDefinition = createWrappedAsync<any, string>(
  'AI-Skill/GetDefinition',
  async (symphony_id) => {
    const response = await rootRquest.get(`/api/cascades/get_properties?symphony_id=${symphony_id}`);

    return response.data;
  },
);

export const createCascade = createWrappedAsync<any, CreateCascadePayload>(
  'cascade/Create',
  async (payload) => {
    const response = await rootRquest.post(`/api/cascades/`, payload);
    return response.data;
  },
);

export const createAiSkill = createWrappedAsync<any, CreateAiSkillPayload, { state: State }>(
  'AI-Skill/Create',
  async (payload, { getState }) => {
    const maxId = getState().cascade.ids.reduce((m, id) => {
      return max(m, id);
    }, 0);

    const response = await rootRquest.post(`/api/cascades/create_symphony_object`, payload);

    return normalizeAiSkill(response.data, +maxId + 1);
  },
);

export const updateCascade = createWrappedAsync<any, UpdateCascadePayload>(
  'cascade/Update',
  async (payload) => {
    const { id, data } = payload;

    const response = await rootRquest.patch(`/api/cascades/${id}`, data);

    return response.data;
  },
);

export const updateAiSkill = createWrappedAsync<any, UpdateAiSkillPayload>(
  'AI-Skill/Update',
  async ({ id, symphony_id, body }) => {
    const response = await rootRquest.patch(`/api/cascades/update_symphony_object?symphony_id=${symphony_id}`, body);

    return normalizeAiSkill(response.data, id);
  },
);

export const deleteCascade = createWrappedAsync<any, number>('cascade/Delete', async (id: number) => {
  await rootRquest.delete(`/api/cascades/${id}/`);
  return id;
});

export const deleteAiSkill = createWrappedAsync<any, DeleteAiSkillPayload>(
  'AiSkill/Delete',
  async ({ id, symphony_id }) => {
    await rootRquest.delete(`/api/cascades/delete_symphony_object?symphony_id=${symphony_id}`);

    return id;
  },
);

const cascadeSlice = createSlice({
  name: 'cascades',
  initialState: cascadesAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAiSkillList.fulfilled, cascadesAdapter.setAll)
      .addCase(createAiSkill.fulfilled, cascadesAdapter.addOne)
      .addCase(updateAiSkill.fulfilled, cascadesAdapter.upsertOne)
      .addCase(deleteAiSkill.fulfilled, cascadesAdapter.removeOne);
  },
});

const { reducer } = cascadeSlice;

export default reducer;

export const {
  selectAll: selectAllCascades,
  selectById: selectCascadeById,
  selectEntities: selectCascadeEntities,
} = cascadesAdapter.getSelectors<State>((state) => state.cascade);

export const selectHasUseAiSkillSelectorFactory = (modelSymphonyId: string) =>
  createSelector(selectAllCascades, (skillList) => {
    if (skillList.length === 0) return false;

    const isUsed = skillList
      .reduce(
        (accModelList, skill) => [
          ...accModelList,
          ...skill.flow.nodes.filter((node) => node.type === 'model'),
        ],
        [],
      )
      .some((model) => model.name === modelSymphonyId);

    return isUsed;
  });

export const selectAiSkillBySymphonyIdSelectorFactory = (symphonyId: string) =>
  createSelector(selectAllCascades, (skillList) => skillList.find((skill) => skill.symphony_id === symphonyId));
