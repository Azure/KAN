import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import Axios from 'axios';
import { State as RootState } from 'RootStateType';
import { createWrappedAsync } from './shared/createWrappedAsync';

import { ComputeDevice, CreateComputeDevicePayload } from './types';

const computeDeviceAdapter = createEntityAdapter<ComputeDevice>();

type ComputeDeviceFromServer = {
  id: number;
  name: string;
  iotHub: string;
  iotedge_device: string;
  architecture: string;
  acceleration: string;
  tag_list: string;
};

const normalizeComputeDevice = (data: ComputeDeviceFromServer): ComputeDevice => ({
  ...data,
  tag_list: data.tag_list !== '' ? JSON.parse(data.tag_list) : [],
});

export const getComputeDeviceList = createWrappedAsync('computeDevice/Get', async () => {
  const response = await Axios.get(`/api/compute_devices`);

  return response.data.map((da) => normalizeComputeDevice(da));
});

export const createComputeDevice = createWrappedAsync<any, CreateComputeDevicePayload, { state: RootState }>(
  'computeDevice/Create',
  async (payload) => {
    const response = await Axios.post(`/api/compute_devices`, payload);

    console.log('response', response);
  },
);

export const updateComputeDevice = createWrappedAsync<any, any>('computeDevice/Update', async (payload) => {
  // const { id, data } = payload;
  // const response = await Axios.patch(`/api/cascades/${id}`, data);
  // return response.data;
});

export const deleteComputeDevice = createWrappedAsync<any, number[]>(
  'computeDevice/Delete',
  async (ids: number[]) => {
    // await Axios.delete(`/api/cascades/${id}/`);
    return ids;
  },
);

const computeDeviceSlice = createSlice({
  name: 'computeDevice',
  initialState: computeDeviceAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getComputeDeviceList.fulfilled, computeDeviceAdapter.setAll)
      .addCase(createComputeDevice.fulfilled, computeDeviceAdapter.addOne)
      .addCase(updateComputeDevice.fulfilled, computeDeviceAdapter.upsertOne)
      .addCase(deleteComputeDevice.fulfilled, computeDeviceAdapter.removeMany);
  },
});

const { reducer } = computeDeviceSlice;

export default reducer;

export const {
  selectAll: selectAllComputeDevices,
  selectById: selectComputeDeviceById,
  selectEntities: selectComputeDeviceEntities,
} = computeDeviceAdapter.getSelectors<RootState>((state) => state.computeDevice);
