import { TrainingProject } from '../../store/types';

export const SOURCE_CONFIGURATIONS = {
  ip: '$param(rtsp)',
  fps: '$param(fps)',
  device_name: '$param(device_id)',
};

export const MODOEL_NODE_LIST = [
  {
    id: 9999,
    name: 'Run ML model',
    customVisionId: '',
    isDemo: false,
    isPredicationModel: false,
    predictionUri: '',
    predictionHeader: '',
    category: 'customvision',
    projectType: 'ObjectDetection',
    isCascade: false,
    inputs: [],
    outputs: [],
    nodeType: 'model',
    combined: '',
    openvino_library_name: '',
    openvino_model_name: '',
    download_uri_openvino: '',
    classification_type: '',
    is_trained: false,
    kan_id: '',
    tag_list: [],
    accelerationList: [],
    displayName: 'Run ML model',
    displayType: '',
    trainStatus: '',
  },
] as TrainingProject[];
