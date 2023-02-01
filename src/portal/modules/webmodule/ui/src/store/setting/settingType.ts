import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';

import type { State } from 'RootStateType';

export type CVProject = { id: string; name: string; exportable: boolean };

export type Setting = {
  loading: boolean;
  error: Error;
  id: number;
  training_key: string;
  endpoint: string;
  // If the given endpoint and key is valid
  isTrainerValid: boolean;
  cvProjects: CVProject[];
  appInsightHasInit: boolean;
  isCollectData: boolean;
  appInsightKey?: string;
  subscription_id: string;
  storage_account: string;
  storage_container: string;
  tenant_id: string;
  client_id: string;
  client_secret: string;
  storage_resource_group: string;
};

// export type UpdateKeyAction = {
//   type: 'UPDATE_KEY';
//   payload: string;
// };

// export type UpdateNamespaceAction = {
//   type: 'UPDATE_NAMESPACE';
//   payload: string;
// };

export type OnSettingStatusCheckAction = {
  type: 'ON_SETTING_STATUS_CHECK';
  payload: {
    appInsightHasInit: boolean;
    isTrainerValid: boolean;
  };
};

export type GetSettingRequestAction = {
  type: 'REQUEST_START';
};

export type GetSettingSuccessAction = {
  type: 'REQUEST_SUCCESS';
  payload: Setting;
};

export type GetSettingFailedAction = {
  type: 'REQUEST_FAIL';
  error: Error;
};

export type GetAllCvProjectsRequestAction = {
  type: 'settings/listAllProjects/pending';
};

export type GetAllCvProjectsSuccessAction = {
  type: 'settings/listAllProjects/fulfilled';
  pyload: CVProject[];
};

export type GetAllCvProjectsErrorAction = {
  type: 'settings/listAllProjects/rejected';
  error: Error;
};

export type UpdateSettingRequestAction = {
  type: 'setting/update_pending';
};

export type UpdateSettingSuccessAction = {
  type: 'setting/update_fulfilled';
  payload: Setting;
};

export type UpdateSettingErrorAction = {
  type: 'setting/update_rejected';
  error: Error;
};

export type SettingActionType =
  // | UpdateKeyAction
  // | UpdateNamespaceAction
  | GetSettingRequestAction
  | GetSettingSuccessAction
  | GetSettingFailedAction
  | GetAllCvProjectsRequestAction
  | GetAllCvProjectsSuccessAction
  | GetAllCvProjectsErrorAction
  | OnSettingStatusCheckAction
  | UpdateSettingRequestAction
  | UpdateSettingSuccessAction
  | UpdateSettingErrorAction;

export type SettingThunk<ReturnType = void> = ThunkAction<ReturnType, State, unknown, Action<string>>;
