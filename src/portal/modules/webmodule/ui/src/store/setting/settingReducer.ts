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
    default:
      return state;
  }
};

export default settingReducer;
