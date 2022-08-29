import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

import { State } from 'RootStateType';
import rootRquest from './rootRquest';
import { createWrappedAsync } from './shared/createWrappedAsync';

import { CreateAiSkillPayload, AiSkill, UpdateAiSkillPayload } from './types';

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
  id: number;
  name: string;
  flow: string;
  raw_data: string;
  screenshot: string;
  tag_list: string;
  symphony_id: string;
  fps: string;
  acceleration: string;
};

const normalizeAiSkill = (aiSkill: AiSkillFromServer): AiSkill => {
  return {
    ...aiSkill,
    tag_list: aiSkill.tag_list !== '' ? JSON.parse(aiSkill.tag_list) : [],
    fps: parseInt(aiSkill.fps, 10),
  };
};

const cascadesAdapter = createEntityAdapter<AiSkill>();

export const getCascades = createWrappedAsync('cascade/Get', async () => {
  const response = await rootRquest.get(
    `/api/cascades`,
    // 'http://20.89.186.195/api/cascades',
  );

  return response.data.map((aiSkill) => normalizeAiSkill(aiSkill));
});

export const createCascade = createWrappedAsync<any, CreateCascadePayload>(
  'cascade/Create',
  async (payload) => {
    const response = await rootRquest.post(`/api/cascades/`, payload);
    return response.data;
  },
);

export const createAiSkill = createWrappedAsync<any, CreateAiSkillPayload>(
  'AI-Skill/Create',
  async (payload) => {
    const response = await rootRquest.post(`/api/cascades/`, payload);
    return normalizeAiSkill(response.data);
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
  'cascade/Update',
  async (payload) => {
    const { id, body } = payload;

    const response = await rootRquest.patch(`/api/cascades/${id}`, body);

    return normalizeAiSkill(response.data);
  },
);

export const deleteCascade = createWrappedAsync<any, number>('cascade/Delete', async (id: number) => {
  await rootRquest.delete(`/api/cascades/${id}/`);
  return id;
});

export const deleteAiSkill = createWrappedAsync<any, number>('AiSkill/Delete', async (id: number) => {
  await rootRquest.delete(`/api/cascades/${id}/`);
  return id;
});

const cascadeSlice = createSlice({
  name: 'cascades',
  initialState: cascadesAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCascades.fulfilled, cascadesAdapter.setAll)
      // .addCase(createCascade.fulfilled, cascadesAdapter.addOne)
      .addCase(createAiSkill.fulfilled, cascadesAdapter.addOne)
      // .addCase(updateCascade.fulfilled, cascadesAdapter.upsertOne)
      .addCase(updateAiSkill.fulfilled, cascadesAdapter.upsertOne)
      .addCase(deleteCascade.fulfilled, cascadesAdapter.removeOne)
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
