import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';

import { State as RootState } from 'RootStateType';
import rootRquest from './rootRquest';
import { createWrappedAsync } from './shared/createWrappedAsync';
import { ComputeDevice, CreateComputeDevicePayload, UpdateComputeDevicePayload } from './types';

const computeDeviceAdapter = createEntityAdapter<ComputeDevice>();

type ComputeDeviceFromServer = {
  id: number;
  name: string;
  iothub: string;
  iotedge_device: string;
  architecture: string;
  acceleration: string;
  tag_list: string;
  symphony_id: string;
  solution_id: string;
  status: string;
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

const normalizeComputeDevice = (response: ComputeDeviceFromServer): ComputeDevice => ({
  ...response,
  tag_list: getArrayObject(response.tag_list),
  status: getStatus(response.status),
});

export const getComputeDeviceList = createWrappedAsync('computeDevice/Get', async () => {
  const response = await rootRquest.get(
    `/api/compute_devices`,
    // 'http://20.89.186.195/api/compute_devices',
  );

  return response.data.map((da) => normalizeComputeDevice(da));
});

export const getSingleComputeDevice = createWrappedAsync<any, number, { state: RootState }>(
  'computeDevice/GetSingle',
  async (id) => {
    const response = await rootRquest.get(
      `/api/compute_devices/${id}`,
      // http://20.89.186.195/api/compute_devices/${id}`
    );

    return normalizeComputeDevice(response.data);
  },
);

export const createComputeDevice = createWrappedAsync<any, CreateComputeDevicePayload, { state: RootState }>(
  'computeDevice/Create',
  async (payload) => {
    const response = await rootRquest.post(`/api/compute_devices`, payload);

    return normalizeComputeDevice(response.data);
  },
);

export const updateComputeDevice = createWrappedAsync<any, UpdateComputeDevicePayload>(
  'computeDevice/Update',
  async (payload) => {
    const { id, body } = payload;
    const response = await rootRquest.patch(`/api/compute_devices/${id}`, body);

    return normalizeComputeDevice(response.data);
  },
);

export const deleteComputeDevice = createWrappedAsync<any, { ids: number[]; resolve?: () => void }>(
  'computeDevice/Delete',
  async ({ ids, resolve }) => {
    const url = `/api/compute_devices/bulk-delete?${ids.map((id) => `id=${id}`).join('&')}`;

    await rootRquest.delete(url);

    if (resolve) {
      resolve();
    }

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
      .addCase(getSingleComputeDevice.fulfilled, computeDeviceAdapter.upsertOne)
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

export const selectDeviceSymphonyIdsFactory = (idList: string[]) =>
  createSelector(selectAllComputeDevices, (entities) =>
    entities.filter((device) => idList.includes(device.symphony_id)),
  );