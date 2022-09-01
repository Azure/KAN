import { combineReducers } from '@reduxjs/toolkit';

import partsReducer from './partSlice';
import locationsReducer from './locationSlice';
import projectReducer from './project/projectReducer';
import settingReducer from './setting/settingReducer';
import notificationReducer from './notificationSlice';
import imagesReducer from './imageSlice';
import annotationReducer from './annotationSlice';
import labelingPageReducer from './labelingPageSlice';
import cameraReducer from './cameraSlice';
import videoAnnosReducer from './videoAnnoSlice';
import rejectMsgReducer from './rejectedReducer';
import trainingProjectReducer from './trainingProjectSlice';
import scenarioReducer from './scenarioSlice';
import cameraSettingReducer from './cameraSetting/cameraSettingReducer';
import cascadeReducer from './cascadeSlice';

import trainingProjectStatusReducer from './trainingProjectStatusSlice';
import computeDeviceReducer from './computeDeviceSlice';
import configureAnnoReducer from './configureAnnoSlice';
import deploymentReducer from './deploymentSlice';

export const rootReducer = combineReducers({
  project: projectReducer,
  setting: settingReducer,
  camera: cameraReducer,
  locations: locationsReducer,
  notifications: notificationReducer,
  parts: partsReducer,
  labelImages: imagesReducer,
  annotations: annotationReducer,
  labelingPage: labelingPageReducer,
  videoAnnos: videoAnnosReducer,
  rejectMsg: rejectMsgReducer,
  trainingProject: trainingProjectReducer,
  scenario: scenarioReducer,
  cameraSetting: cameraSettingReducer,
  cascade: cascadeReducer,
  trainingProjectStatus: trainingProjectStatusReducer,
  computeDevice: computeDeviceReducer,
  configureAnno: configureAnnoReducer,
  deployment: deploymentReducer,
});
