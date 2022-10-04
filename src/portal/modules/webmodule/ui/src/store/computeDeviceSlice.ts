import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { max } from 'ramda';

import { State as RootState } from 'RootStateType';
import rootRquest from './rootRquest';
import { createWrappedAsync } from './shared/createWrappedAsync';
import {
  ComputeDevice,
  CreateComputeDevicePayload,
  UpdateComputeDevicePayload,
  DeleteComputeDevicePayload,
  ClusterType,
  GetSingleComputeDeivcePayload,
} from './types';

const computeDeviceAdapter = createEntityAdapter<ComputeDevice>();

type ComputeDeviceFromServer = {
  // id: number;
  name: string;
  iothub: string;
  iotedge_device: string;
  architecture: string;
  acceleration: string;
  tag_list: string;
  symphony_id: string;
  solution_id: string;
  status: string;
  is_k8s: boolean;
  cluster_type: string;
};

const getArrayObject = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return [];
  }
};

const getStatus = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    return {};
  }
};

const normalizeComputeDevice = (response: ComputeDeviceFromServer, id: number): ComputeDevice => ({
  ...response,
  id,
  tag_list: getArrayObject(response.tag_list),
  status: getStatus(response.status),
  cluster_type: response.cluster_type as ClusterType,
});

export const getComputeDeviceList = createWrappedAsync('ComputeDevice/Get', async () => {
  const response = await rootRquest.get(`/api/compute_devices/get_symphony_objects`);

  return response.data.map((da, i) => normalizeComputeDevice(da, i + 1));
});

export const getSingleComputeDevice = createWrappedAsync<
  any,
  GetSingleComputeDeivcePayload,
  { state: RootState }
>('ComputeDevice/GetSingle', async ({ id, symphony_id }) => {
  const response = await rootRquest.get(
    `/api/compute_devices/get_symphony_object?symphony_id=${symphony_id}`,
  );

  return normalizeComputeDevice(response.data, id);
});

export const getComputeDeviceDefinition = createWrappedAsync<any, string, { state: RootState }>(
  'ComputeDevice/getDefinition',
  async (symphony_id) => {
    const response = await rootRquest.get(`/api/compute_devices/get_properties?symphony_id=${symphony_id}`);

    return response.data;
  },
);

export const createComputeDevice = createWrappedAsync<any, CreateComputeDevicePayload, { state: RootState }>(
  'ComputeDevice/Create',
  async (payload, { getState }) => {
    const maxId = getState().computeDevice.ids.reduce((m, id) => {
      return max(m, id);
    }, 0);

    const response = await rootRquest.post(`/api/compute_devices/create_symphony_object`, payload);

    return normalizeComputeDevice(response.data, +maxId + 1);
  },
);

export const updateComputeDevice = createWrappedAsync<any, UpdateComputeDevicePayload>(
  'ComputeDevice/Update',
  async ({ id, symphony_id, body }) => {
    const response = await rootRquest.patch(
      `/api/compute_devices/update_symphony_object?symphony_id=${symphony_id}`,
      body,
    );

    return normalizeComputeDevice(response.data, id);
  },
);

export const deleteComputeDevice = createWrappedAsync<any, DeleteComputeDevicePayload>(
  'ComputeDevice/Delete',
  async ({ id, symphony_id, resolve }) => {
    const url = `/api/compute_devices/delete_symphony_object?symphony_id=${symphony_id}`;

    await rootRquest.delete(url);

    if (resolve) {
      resolve();
    }

    return id;
  },
);

const computeDeviceSlice = createSlice({
  name: 'computeDevice',
  initialState: computeDeviceAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getComputeDeviceList.fulfilled, computeDeviceAdapter.setAll)
      .addCase(getSingleComputeDevice.fulfilled, computeDeviceAdapter.upsertOne)
      .addCase(createComputeDevice.fulfilled, computeDeviceAdapter.addOne)
      .addCase(updateComputeDevice.fulfilled, computeDeviceAdapter.upsertOne)
      .addCase(deleteComputeDevice.fulfilled, computeDeviceAdapter.removeOne);
  },
});

const { reducer } = computeDeviceSlice;

export default reducer;

export const {
  selectAll: selectAllComputeDevices,
  selectById: selectComputeDeviceById,
  selectEntities: selectComputeDeviceEntities,
} = computeDeviceAdapter.getSelectors<RootState>((state) => state.computeDevice);

export const selectDeviceSymphonyIdsFactory = (idList: string[]) =>
  createSelector(selectAllComputeDevices, (entities) =>
    entities.filter((device) => idList.includes(device.symphony_id)),
  );
