import { SettingActionType, Setting } from './settingType';
import { patchIsCollectData } from './settingAction';

export const initialState: Setting = {
  loading: false,
  error: null,
  // current: {
  //   id: -1,
  //   key: '',
  //   namespace: '',
  // },
  // origin: {
  //   id: -1,
  //   key: '',
  //   namespace: '',
  // },
  id: -1,
  training_key: '',
  endpoint: '',
  isTrainerValid: true,
  appInsightHasInit: true,
  isCollectData: false,
  appInsightKey: '',
  cvProjects: [],
  subscription_id: '',
  storage_account: '',
  storage_container: '',
  tenant_id: '',
  client_id: '',
  client_secret: '',
  storage_resource_group: '',
  openai_api_key: ''
};

const settingReducer = (state = initialState, action: SettingActionType): Setting => {
  switch (action.type) {
    // case 'UPDATE_KEY':
    //   return { ...state, current: { ...state.current, key: action.payload } };
    // case 'UPDATE_NAMESPACE':
    //   return { ...state, current: { ...state.current, namespace: action.payload } };
    case 'REQUEST_START':
      return { ...state, loading: true };
    case 'REQUEST_SUCCESS':
      return action.payload;
    case 'REQUEST_FAIL':
      return { ...state, error: action.error };
    case 'settings/listAllProjects/pending':
      return { ...state, loading: true };
    case 'settings/listAllProjects/fulfilled':
      return { ...state, loading: false, cvProjects: action.pyload };
    case 'settings/listAllProjects/rejected':
      return { ...state, loading: false, error: action.error };
    case patchIsCollectData.pending.toString():
      return { ...state, isCollectData: (action as any).meta.arg.isCollectData, appInsightHasInit: true };
    case patchIsCollectData.rejected.toString():
      return { ...state, isCollectData: !(action as any).meta.arg.isCollectData };
    case 'setting/update_pending':
      return { ...state, loading: true };
    case 'setting/update_fulfilled':
      return {
        ...state,
        training_key: action.payload.training_key,
        endpoint: action.payload.endpoint,
        subscription_id: action.payload.subscription_id,
        storage_account: action.payload.storage_account,
        storage_container: action.payload.storage_container,
        tenant_id: action.payload.tenant_id,
        client_id: action.payload.client_id,
        client_secret: action.payload.client_secret,
        storage_resource_group: action.payload.storage_resource_group,
        openai_api_key: action.payload.openai_api_key,
        loading: false,
      };
    case 'setting/update_rejected':
      return { ...state, loading: false, error: action.error };

    default:
      return state;
  }
};

export default settingReducer;
