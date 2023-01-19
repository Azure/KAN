import { createSlice, createEntityAdapter, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { max } from 'ramda';

import { State as RootState } from 'RootStateType';
import rootRquest from './rootRquest';
import { createWrappedAsync } from './shared/createWrappedAsync';
import {
  ComputeDevice,
  CreateComputeDevicePayload,
  ValidateComputeDeviceConfigPayload,
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
  kan_id: string;
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
  const response = await rootRquest.get(`/api/compute_devices/get_kan_objects`);

  return response.data.map((da, i) => normalizeComputeDevice(da, i + 1));
});

export const getSingleComputeDevice = createWrappedAsync<
  any,
  GetSingleComputeDeivcePayload,
  { state: RootState }
>('ComputeDevice/GetSingle', async ({ id, kan_id }) => {
  const response = await rootRquest.get(`/api/compute_devices/get_kan_object?kan_id=${kan_id}`);

  return normalizeComputeDevice(response.data, id);
});

export const getComputeDeviceDefinition = createWrappedAsync<any, string, { state: RootState }>(
  'ComputeDevice/getDefinition',
  async (kan_id) => {
    const response = await rootRquest.get(`/api/compute_devices/get_properties?kan_id=${kan_id}`);

    return response.data;
  },
);

export const createComputeDevice = createWrappedAsync<any, CreateComputeDevicePayload, { state: RootState }>(
  'ComputeDevice/Create',
  async (payload, { getState }) => {
    const maxId = getState().computeDevice.ids.reduce((m, id) => {
      return max(m, id);
    }, 0);

    const response = await rootRquest.post(`/api/compute_devices/create_kan_object`, payload);

    return normalizeComputeDevice(response.data, +maxId + 1);
  },
);

export const validateComputeDeviceConfig = createAsyncThunk<
  any,
  ValidateComputeDeviceConfigPayload,
  { state: RootState }
>('ComputeDevice/ValidateConfig', async (payload) => {
  try {
    const response = await rootRquest.post(`/api/compute_devices/verify_config_data`, payload);

    return response.status;
  } catch (e) {
    return e.response.status;
  }
});

export const updateComputeDevice = createWrappedAsync<any, UpdateComputeDevicePayload>(
  'ComputeDevice/Update',
  async ({ id, kan_id, body }) => {
    const response = await rootRquest.patch(`/api/compute_devices/update_kan_object?kan_id=${kan_id}`, body);

    return normalizeComputeDevice(response.data, id);
  },
);

export const deleteComputeDevice = createWrappedAsync<any, DeleteComputeDevicePayload>(
  'ComputeDevice/Delete',
  async ({ id, kan_id, resolve }) => {
    const url = `/api/compute_devices/delete_kan_object?kan_id=${kan_id}`;

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

export const selectDeviceByKanIdSelectorFactory = (id: string) =>
  createSelector(selectAllComputeDevices, (deviceList) => deviceList.find((device) => device.kan_id === id));
