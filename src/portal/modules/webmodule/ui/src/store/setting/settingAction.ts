import Axios, { AxiosRequestConfig } from 'axios';

import {
  // UpdateKeyAction,
  // UpdateNamespaceAction,
  GetSettingRequestAction,
  GetSettingSuccessAction,
  Setting,
  GetSettingFailedAction,
  SettingThunk,
  GetAllCvProjectsRequestAction,
  GetAllCvProjectsSuccessAction,
  GetAllCvProjectsErrorAction,
  OnSettingStatusCheckAction,
  CVProject,
} from './settingType';
import { getTrainingProject } from '../trainingProjectSlice';
import { getAppInsights } from '../../TelemetryService';
import { createWrappedAsync } from '../shared/createWrappedAsync';
import rootRquest from '../rootRquest';

// export const updateKey = (key: string): UpdateKeyAction => ({ type: 'UPDATE_KEY', payload: key });

// export const updateNamespace = (namespace: string): UpdateNamespaceAction => ({
//   type: 'UPDATE_NAMESPACE',
//   payload: namespace,
// });

export const onSettingStatusCheck = (
  isTrainerValid: boolean,
  appInsightHasInit: boolean,
): OnSettingStatusCheckAction => ({
  type: 'ON_SETTING_STATUS_CHECK',
  payload: {
    isTrainerValid,
    appInsightHasInit,
  },
});

export const settingRequest = (): GetSettingRequestAction => ({
  type: 'REQUEST_START',
});

export const settingSuccess = (data: Setting): GetSettingSuccessAction => ({
  type: 'REQUEST_SUCCESS',
  payload: data,
});

export const settingFailed = (error: Error): GetSettingFailedAction => ({
  type: 'REQUEST_FAIL',
  error,
});

const getAllCvProjectsRequest = (): GetAllCvProjectsRequestAction => ({
  type: 'settings/listAllProjects/pending',
});

const getAllCvProjectsSuccess = (cvProjects: CVProject[]): GetAllCvProjectsSuccessAction => ({
  type: 'settings/listAllProjects/fulfilled',
  pyload: cvProjects,
});

export const getAllCvProjectError = (error: Error): GetAllCvProjectsErrorAction => ({
  type: 'settings/listAllProjects/rejected',
  error,
});

export const thunkGetSetting =
  () =>
  (dispatch): Promise<any> => {
    dispatch(settingRequest());

    return rootRquest
      .get('/api/settings/')
      .then(({ data }) => {
        if (data.length > 0) {
          dispatch(
            settingSuccess({
              loading: false,
              error: null,
              id: data[0].id,
              endpoint: data[0].endpoint,
              training_key: data[0].training_key,
              isTrainerValid: data[0].is_trainer_valid,
              appInsightHasInit: data[0].app_insight_has_init,
              isCollectData: data[0].is_collect_data,
              cvProjects: [],
              subscription_id: data[0].subscription_id,
              storage_account: data[0].storage_account,
              storage_container: data[0].storage_container,
              tenant_id: data[0].tenant_id,
              client_id: data[0].client_id,
              client_secret: data[0].client_secret,
            }),
          );
        }

        // Set the state to localstorage so next time don't need to get them from server
        window.localStorage.setItem('isTrainerValid', JSON.stringify(data[0].is_trainer_valid));
        window.localStorage.setItem('appInsightHasInit', JSON.stringify(data[0].app_insight_has_init));

        return data[0].is_collect_data;
      })
      .catch((err) => {
        dispatch(settingFailed(err));
      });
  };

export const thunkGetSettingAndAppInsightKey =
  (): SettingThunk =>
  (dispatch): Promise<void> => {
    dispatch(settingRequest());

    const appInsightKey = rootRquest.get('/api/appinsight/key');
    const settings = rootRquest.get('/api/settings/');

    return Axios.all([appInsightKey, settings])
      .then(
        Axios.spread((...responses) => {
          const { data: appInsightKeyData } = responses[0];
          const { data: settingsData } = responses[1];

          if (appInsightKeyData.key) {
            dispatch(
              settingSuccess({
                loading: false,
                error: null,
                id: settingsData[0].id,
                endpoint: settingsData[0].endpoint,
                training_key: settingsData[0].training_key,
                isTrainerValid: settingsData[0].is_trainer_valid,
                appInsightHasInit: settingsData[0].app_insight_has_init,
                isCollectData: settingsData[0].is_collect_data,
                appInsightKey: appInsightKeyData.key,
                cvProjects: [],
                subscription_id: settingsData[0].subscription_id,
                storage_account: settingsData[0].storage_account,
                storage_container: settingsData[0].storage_container,
                tenant_id: settingsData[0].tenant_id,
                client_id: settingsData[0].client_id,
                client_secret: settingsData[0].client_secret,
              }),
            );
          } else {
            throw new Error('No API Key');
          }
        }),
      )
      .catch((e) => console.error(e));
  };

export const thunkGetAllCvProjects = (): SettingThunk => (dispatch, getState) => {
  dispatch(getAllCvProjectsRequest());

  const settingId = getState().setting.id;
  return rootRquest
    .get(`/api/settings/${settingId}/list_projects`)
    .then(({ data }) => {
      dispatch(getAllCvProjectsSuccess(data?.projects || []));
      return void 0;
    })
    .catch((e) => {
      if (e.response) {
        throw new Error(e.response.data.error.message);
      } else if (e.request) {
        throw new Error(e.request);
      } else {
        throw e;
      }
    })
    .catch((e) => {
      dispatch(getAllCvProjectError(e));
    });
};

export const checkSettingStatus =
  (): SettingThunk =>
  async (dispatch): Promise<void> => {
    const isTrainerValidStr = await window.localStorage.getItem('isTrainerValid');
    const isTrainerValid = isTrainerValidStr ? JSON.parse(isTrainerValidStr) : false;
    const appInsightHasInitStr = await window.localStorage.getItem('isTrainerValid');
    const appInsightHasInit = appInsightHasInitStr ? JSON.parse(appInsightHasInitStr) : false;
    dispatch(onSettingStatusCheck(isTrainerValid, appInsightHasInit));
  };

export const patchIsCollectData = createWrappedAsync<
  any,
  { id: number; isCollectData: boolean; hasInit: boolean }
>('settings/updateIsCollectData', async ({ id, isCollectData, hasInit }) => {
  await rootRquest.patch(`/api/settings/${id}`, {
    is_collect_data: isCollectData,
    ...(hasInit && { app_insight_has_init: hasInit }),
  });
  const appInsight = getAppInsights();
  if (!appInsight) throw Error('App Insight hasnot been initialize');
  appInsight.config.disableTelemetry = !isCollectData;
});

export const thunkPostSetting =
  (): SettingThunk =>
  (dispatch, getStore): Promise<any> => {
    const settingData = getStore().setting;

    const isSettingEmpty = settingData.id === -1;
    const url = isSettingEmpty ? `/api/settings/` : `/api/settings/${settingData.id}/`;
    const requestConfig: AxiosRequestConfig = isSettingEmpty
      ? {
          data: {
            training_key: settingData.training_key,
            endpoint: settingData.endpoint,
            name: '',
            iot_hub_connection_string: '',
            device_id: '',
            module_id: '',
          },
          method: 'POST',
        }
      : {
          data: {
            training_key: settingData.training_key,
            endpoint: settingData.endpoint,
          },
          method: 'PUT',
        };

    dispatch(settingRequest());

    return rootRquest(url, requestConfig)
      .then(({ data }) => {
        dispatch(
          settingSuccess({
            loading: false,
            error: null,
            id: data[0].id,
            endpoint: data[0].endpoint,
            training_key: data[0].training_key,
            isTrainerValid: data.is_trainer_valid,
            appInsightHasInit: data.app_insight_has_init,
            isCollectData: data.is_collect_data,
            cvProjects: [],
            subscription_id: data[0].subscription_id,
            storage_account: data[0].storage_account,
            storage_container: data[0].storage_container,
            tenant_id: data[0].tenant_id,
            client_id: data[0].client_id,
            client_secret: data[0].client_secret,
          }),
        );
        dispatch(thunkGetAllCvProjects());
        dispatch(getTrainingProject(false));
        return void 0;
      })
      .catch((err) => {
        dispatch(settingFailed(err));
      });
  };
