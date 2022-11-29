import { Acceleration } from '../components/constant';

// Slice Types
export type ConntectedStatus = 'connected' | 'disconnected';

export type ClusterType = '' | 'current' | 'other';

export type ComputeDevice = {
  id: number;
  name: string;
  iothub: string;
  iotedge_device: string;
  architecture: string;
  acceleration: string;
  tag_list: { name: string; value: string }[];
  symphony_id: string;
  solution_id: string;
  status: Record<string, ConntectedStatus>;
  is_k8s: boolean;
  cluster_type: ClusterType;
};

export type AiSkill = {
  id: number;
  name: string;
  flow: any;
  screenshot: string;
  tag_list: { name: string; value: string }[];
  symphony_id: string;
  fps: number;
  acceleration: string;
};

export type DeploymentConfigureSkill = {
  id: string;
  configured: boolean;
};

export type DeploymentConfigureCamera = {
  camera: string;
  skills: DeploymentConfigureSkill[];
};

// { symphony_id : fps}
export type DeploymentFPS = Record<string, string>;

export type VideoRecroding = {
  filename: string;
  url: string;
  creation_time: string;
};

export type Deployment = {
  id: number;
  name: string;
  configure: DeploymentConfigureCamera[];
  tag_list: { name: string; value: string }[];
  symphony_id: string;
  compute_device: string;
  status: { status_code: string; status_description: string; fps: DeploymentFPS | null };
  iothub_insights: {
    frame_id: string;
    image: {
      properties: {
        color_format: string;
        height: number;
        width: number;
      };
    };
    insights_meta: {
      objects_meta: {
        attributes: any[];
        bbox: {
          0: number;
          1: number;
          2: number;
          3: number;
        };
        confidence: number;
        label: string;
      }[];
      timestamp: number;
    };
  }[];
};

export type ModelCategory = 'customvision' | 'modelzoo' | 'byom';
export type ModelProjectType = 'ObjectDetection' | 'Classification';
export type ClassificationType = '' | 'Multiclass' | 'Multilabel';
export type ModelNodeType = 'export' | 'source' | 'transform' | 'model' | 'analyze';
export type ModelHandler = {
  route: string;
  type: string;
};

export type TrainingProject = {
  id: number;
  name: string;
  customVisionId: string;
  isDemo: boolean;
  isPredicationModel: boolean;
  predictionUri: string;
  predictionHeader: string;
  category: ModelCategory;
  projectType: ModelProjectType;
  isCascade: boolean;
  inputs: ModelHandler[];
  outputs: ModelHandler[];
  nodeType: ModelNodeType;
  combined: string;
  openvino_library_name: string;
  openvino_model_name: string;
  download_uri_openvino: string;
  classification_type: ClassificationType;
  is_trained: boolean;
  symphony_id: string;
  tag_list: { name: string; value: string }[];
  accelerationList: Acceleration[];
  displayName: string;
  displayType: string;
  trainStatus: string;
};

// Payload Types
// Device

export type GetSingleComputeDeivcePayload = {
  id: number;
  symphony_id: string;
};

export type CreateComputeDevicePayload = {
  name: string;
  iothub: string;
  iotedge_device: string;
  architecture: string;
  acceleration: string;
  tag_list: string;
  cluster_type: string;
  is_k8s: boolean;
  config_data: string;
};

export type ValidateComputeDeviceConfigPayload = {
  config_data: string;
};

export type UpdateComputeDevicePayload = {
  id: number;
  symphony_id: string;
  body: {
    architecture: string;
    acceleration: string;
    tag_list: string;
    cluster_type: string;
    is_k8s: boolean;
  };
};

export type DeleteComputeDevicePayload = {
  id: number;
  symphony_id: string;
  resolve?: () => void;
};

// Camera
export type GetSingleCameraPayload = {
  id: number;
  symphony_id: string;
};

export type CreateCameraPayload = {
  location: string;
  name: string;
  rtsp?: string;
  media_source?: string;
  media_type: string;
  tag_list: string;
  username?: string;
  password?: string;
  allowed_devices?: string;
};

export type UpdateCameraPayload = {
  id: number;
  symphony_id: string;
  body: {
    location: number | string;
    tag_list: string;
    username?: string;
    password?: string;
  };
};

export type DeleteCameraPayload = {
  id: number;
  symphony_id: string;
  resolve?: () => void;
};

// Location
export type CreateLocationPayload = { name: string };

// Model
export type CreateCustomVisionModelPayload = {
  name: string;
  tags: string[];
  project_type: string;
  classification_type: string;
};

export type AddExistingCustomVisionModelPayload = {
  customVisionId: string;
};

// Ai Skill
export type CreateAiSkillPayload = {
  name: string;
  flow: string;
  screenshot: string;
  tag_list: string;
  fps: string;
  acceleration: string;
};

export type UpdateAiSkillPayload = {
  id: number;
  symphony_id: string;
  body: {
    flow: string;
    screenshot: string;
    tag_list: string;
  };
};

export type DeleteAiSkillPayload = {
  id: number;
  symphony_id: string;
};

// Deployment

// configure: {
//   camera: symphony_id: string;
//   skills: {
//     id: symphony_id: string;;
//     configured: boolean;
//   }[];
// }[];
export type CreateDeploymentPayload = {
  name: string;
  compute_device: string;
  tag_list: string;
  configure: string;
};

export type GetDeploymentVideoRecordingsPayload = {
  deploymentName: string;
  skillName: string;
  cameraName: string;
};

export type GetDeploymentInsightPayload = {
  deploymentSymphonyId: string;
  skillSymphonyId: string;
  cameraSymphonyId: string;
};

export type UpdateDeploymentPayload = {
  id: number;
  symphony_id: string;
  body: {
    tag_list: string;
    configure: string;
  };
};

export type DeleteDeploymentPayload = {
  id: number;
  symphony_id: string;
};

// Formatted
export type FormattedModel = TrainingProject & {
  displayTagList: string[];
};
