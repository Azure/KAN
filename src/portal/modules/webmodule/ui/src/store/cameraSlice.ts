import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';

import * as R from 'ramda';
import { State } from 'RootStateType';
import { schema, normalize } from 'normalizr';

import { CreateCameraPayload, UpdateCameraPayload, ConntectedStatus } from './types';
import { BoxLabel, PolygonLabel, LineLabel } from './type';
import { toggleShowAOI, toggleShowCountingLines, toggleShowDangerZones } from './actions';
import {
  insertDemoFields,
  isCRDAction,
  getInitialDemoState,
  getSliceApiByDemo,
  getConditionBySlice,
  getNonDemoSelector,
} from './shared/DemoSliceUtils';
import { Purpose } from './shared/BaseShape';
import { createWrappedAsync } from './shared/createWrappedAsync';
import rootRquest from './rootRquest';

type CameraFromServer = {
  id: number;
  name: string;
  rtsp: string;
  area: string;
  lines: string;
  danger_zones: string;
  is_demo: boolean;
  location: number;
  media_type: string;
  tag_list: string;
  username: string;
  password: string;
  allowed_devices: string;
  snapshot: string;
  is_live: boolean;
  status: string;
  symphony_id: string;
};

type CameraFromServerWithSerializeArea = Omit<CameraFromServer, 'area' | 'line' | 'danger_zones'> & {
  area: {
    useAOI: boolean;
    AOIs: [
      {
        id: string;
        type: string;
        label: BoxLabel | PolygonLabel;
      },
    ];
  };
  lines: {
    useCountingLine: boolean;
    countingLines: [
      {
        id: string;
        type: string;
        label: LineLabel;
      },
    ];
  };
  danger_zones: {
    useDangerZone: boolean;
    dangerZones: [
      {
        id: string;
        type: string;
        label: BoxLabel;
      },
    ];
  };
  tag_list: { name: string; value: string }[];
  allowed_devices: string[];
  status: [string, ConntectedStatus][];
};

export type Camera = {
  id: number;
  name: string;
  rtsp: string;
  area: string;
  useAOI: boolean;
  location: number;
  useCountingLine: boolean;
  useDangerZone: boolean;
  isDemo: boolean;
  media_type: string;
  tag_list: { name: string; value: string }[];
  username: string;
  password: string;
  allowed_devices: string[];
  snapshot: string;
  is_live: boolean;
  status: Record<string, ConntectedStatus>;
  symphony_id: string;
};

const mapPurpose = (purpose: Purpose, annos) => annos.map((a) => ({ ...a, purpose }));

const normalizeCameraShape = (response: CameraFromServerWithSerializeArea) => {
  return {
    id: response.id,
    name: response.name,
    rtsp: response.rtsp,
    useAOI: response.area.useAOI,
    useCountingLine: response.lines.useCountingLine,
    useDangerZone: response.danger_zones.useDangerZone,
    AOIs: [
      ...mapPurpose(Purpose.AOI, response.area.AOIs),
      ...mapPurpose(Purpose.Counting, response.lines.countingLines),
      ...mapPurpose(Purpose.DangerZone, response.danger_zones.dangerZones),
    ],
    location: response.location,
    isDemo: response.is_demo,
    media_type: response.media_type,
    snapshot: response.snapshot,
    is_live: response.is_live,
    username: response.username,
    password: response.password,
    tag_list: response.tag_list,
    allowed_devices: response.allowed_devices,
    status: response.status,
    symphony_id: response.symphony_id,
  };
};

const normalizeCamerasAndAOIsByNormalizr = (data: CameraFromServerWithSerializeArea[]) => {
  const AOIs = new schema.Entity('AOIs', undefined, {
    processStrategy: (value, parent) => {
      return {
        id: value.id,
        type: value.type,
        vertices: value.label,
        camera: parent.id,
        purpose: value.purpose,
      };
    },
  });

  const cameras = new schema.Entity(
    'cameras',
    { AOIs: [AOIs] },
    {
      processStrategy: normalizeCameraShape,
    },
  );

  return normalize(data, [cameras]);
};

const getAreaData = (cameraArea: string) => {
  try {
    return JSON.parse(cameraArea);
  } catch (e) {
    return {
      useAOI: false,
      AOIs: [],
    };
  }
};

const getLineData = (countingLines: string) => {
  try {
    return JSON.parse(countingLines);
  } catch (e) {
    return { useCountingLine: false, countingLines: [] };
  }
};

const getDangerZoneData = (dangerZone: string) => {
  try {
    return JSON.parse(dangerZone);
  } catch (e) {
    return { useDangerZone: false, dangerZones: [] };
  }
};

const getArrayObject = (tagList: string) => {
  try {
    return JSON.parse(tagList);
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

const serializeJSONStr = R.map<CameraFromServer, CameraFromServerWithSerializeArea>((e) => ({
  ...e,
  area: getAreaData(e.area),
  lines: getLineData(e.lines),
  danger_zones: getDangerZoneData(e.danger_zones),
  tag_list: getArrayObject(e.tag_list),
  allowed_devices: getArrayObject(e.allowed_devices),
  status: getStatus(e.status),
}));

const normalizeCameras = R.compose(normalizeCamerasAndAOIsByNormalizr, serializeJSONStr);

const entityAdapter = createEntityAdapter<Camera>();

export const getCameras = createWrappedAsync<any, boolean, { state: State }>(
  'Cameras/get',
  async (isDemo) => {
    const response = await getSliceApiByDemo('cameras', isDemo);
    return normalizeCameras(response.data);
  },
  {
    condition: (isDemo, { getState }) => getConditionBySlice('camera', getState(), isDemo),
  },
);

export const getSingleCamera = createWrappedAsync<any, number, { state: State }>(
  'Cameras/getSingle',
  async (id) => {
    const response = await rootRquest.get(`/api/cameras/${id}/update_status`);

    return normalizeCameras([response.data]);
  },
  // {
  //   condition: (isDemo, { getState }) => getConditionBySlice('camera', getState(), isDemo),
  // },
);

export const getCameraDefinition = createWrappedAsync<any, number>('Cameras/getDefinition', async (id) => {
  const response = await rootRquest.get(`/api/cameras/${id}/get_properties`);

  return response.data;
});

export const postRTSPCamera = createWrappedAsync(
  'Cameras/rtsp/post',
  async (payload: CreateCameraPayload) => {
    const response = await rootRquest.post(`/api/cameras/`, payload);

    return {
      ...response.data,
      tag_list: response.data.tag_list !== '' ? JSON.parse(response.data.tag_list) : [],
      allowed_devices: response.data.allowed_devices !== '' ? JSON.parse(response.data.allowed_devices) : [],
    };
  },
);

export const putRTSPCamera = createWrappedAsync('Cameras/rtsp/put', async (newCamera: any) => {
  const response = await rootRquest.put(`/api/cameras/${newCamera.id}/`, newCamera);

  return response.data;
});

export const postMediaSourceCamera = createWrappedAsync(
  'Cameras/mediaSource/post',
  async (payload: CreateCameraPayload) => {
    // Don't wait response, avoid timeout

    rootRquest.post(`/api/cameras/`, payload);
  },
);

export const updateCamera = createWrappedAsync('Cameras/update', async (payload: UpdateCameraPayload) => {
  const response = await rootRquest.patch(`/api/cameras/${payload.id}`, payload.body);

  return normalizeCameras([response.data]);
});

export const putMediaSourceCamera = createWrappedAsync('Cameras/mediaSource/put', async (newCamera: any) => {
  // Don't wait response, avoid timeout

  rootRquest.put(`/api/cameras/${newCamera.id}/`, newCamera);
});

export const deleteCameras = createWrappedAsync<any, { ids: number[]; resolve?: () => void }>(
  'Cameras/delete',
  async ({ ids, resolve }) => {
    const url = `/api/cameras/bulk-delete?${ids.map((id) => `id=${id}`).join('&')}`;

    if (resolve) {
      resolve();
    }

    await rootRquest.delete(url);
    return ids;
  },
);

const slice = createSlice({
  name: 'cameras',
  initialState: getInitialDemoState(entityAdapter.getInitialState()),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCameras.fulfilled, (state, action) =>
        entityAdapter.setAll(state, action.payload.entities.cameras || {}),
      )
      .addCase(getSingleCamera.fulfilled, (state, action) => {
        entityAdapter.upsertOne(state, action.payload.entities.cameras[action.payload.result[0]]);
      })
      .addCase(postRTSPCamera.fulfilled, entityAdapter.addOne)
      .addCase(putRTSPCamera.fulfilled, entityAdapter.upsertOne)
      // .addCase(updateCamera.fulfilled, entityAdapter.upsertOne)
      .addCase(updateCamera.fulfilled, (state, action) => {
        // @ts-ignore
        entityAdapter.upsertOne(state, action.payload.entities.cameras[action.payload.result[0]]);
      })
      .addCase(deleteCameras.fulfilled, entityAdapter.removeMany)
      .addCase(toggleShowAOI.pending, (state, action) => {
        const { checked, cameraId } = action.meta.arg;
        state.entities[cameraId].useAOI = checked;
      })
      .addCase(toggleShowAOI.rejected, (state, action) => {
        const { checked, cameraId } = action.meta.arg;
        state.entities[cameraId].useAOI = !checked;
      })
      .addCase(toggleShowCountingLines.pending, (state, action) => {
        const { checked, cameraId } = action.meta.arg;
        state.entities[cameraId].useCountingLine = checked;
      })
      .addCase(toggleShowCountingLines.rejected, (state, action) => {
        const { checked, cameraId } = action.meta.arg;
        state.entities[cameraId].useCountingLine = !checked;
      })
      .addCase(toggleShowDangerZones.pending, (state, action) => {
        const { checked, cameraId } = action.meta.arg;
        state.entities[cameraId].useDangerZone = checked;
      })
      .addCase(toggleShowDangerZones.rejected, (state, action) => {
        const { checked, cameraId } = action.meta.arg;
        state.entities[cameraId].useDangerZone = !checked;
      })
      .addMatcher(isCRDAction, insertDemoFields);
  },
});

const { reducer } = slice;
export default reducer;

export const {
  selectAll: selectAllCameras,
  selectById: selectCameraById,
  selectEntities: selectCameraEntities,
} = entityAdapter.getSelectors((state: State) => state.camera);

export const selectNonDemoCameras = getNonDemoSelector('camera', selectCameraEntities);

export const cameraOptionsSelector = createSelector(selectAllCameras, (cameras) =>
  cameras
    .filter((e) => !e.isDemo)
    .map((e) => ({
      key: e.id,
      text: e.name,
    })),
);

/**
 * Return the non demo camera in the shape of IDropdownOptions.
 * If the given training project is in the predefined scenarios, also return the camera of the scenario.
 * @param trainingProjectId
 */
export const cameraOptionsSelectorFactoryInConfig = (trainingProjectId: number, cameraList: number[]) =>
  createSelector([selectAllCameras, (state: State) => state.scenario], (cameras, scenarios) => {
    const relatedScenario = scenarios.find((e) => e.trainingProject === trainingProjectId);

    return cameras
      .filter((c) => !c.isDemo || relatedScenario?.cameras.includes(c.id) || cameraList.includes(c.id))
      .map((e) => ({
        key: e.id,
        text: e.name,
      }));
  });

export const camerasSelectorFactory = (ids) =>
  createSelector(selectCameraEntities, (entities) => ids.map((id) => entities[id]));

export const belongDeviceCameraSelectorFactory = (symphonyId: string) =>
  createSelector(selectAllCameras, (cameraList) =>
    cameraList.filter((camera) => camera.allowed_devices.includes(symphonyId)),
  );
