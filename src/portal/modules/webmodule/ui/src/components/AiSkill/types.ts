import { Connection } from 'react-flow-renderer';

import { Tag } from '../Common/TagTab';
import { ModelNodeType, ModelCategory, ModelProjectType, TrainingProject } from '../../store/types';

export type PivotTabKey = 'basics' | 'preview' | 'tag' | 'cascade';
export type TransformType = 'filter' | 'grpc';
export type ExportType = 'snippet' | 'iotHub' | 'iotEdge' | 'http' | 'mqtt';

export const STEP_ORDER = ['basics', 'cascade', 'tag', 'preview'] as PivotTabKey[];

export type CreateAISkillFormData = {
  name: string;
  acceleration: string;
  fps: number;
  cascade: {
    flow: string;
    error: string;
  };
  raw_data: string;
  screenshot: string;
  tag_list: Tag[];
  kan_id: string;
  error: {
    name: string;
    acceleration: string;
    fps: string;
  };
};

export type UpdateAiSkillFormData = {
  name: string;
  acceleration: string;
  fps: number;
  cascade: {
    flow: string;
    error: string;
  };
  raw_data: string;
  screenshot: string;
  tag_list: Tag[];
  kan_id: string;
};

export type CaptureData = '-' | 'yes' | 'no';

export type ModlePanelFormData = {
  model: { id: number; name: string };
  projectType: ModelProjectType | '';
  category: ModelCategory | '';
  captureData: CaptureData;
  confidence_lower: number;
  confidence_upper: number;
  max_images: number;
  error: Partial<{
    projectType: string;
    model: string;
    captureData: string;
    confidence_lower: string;
    confidence_upper: string;
    max_images: string;
  }>;
};

export type FilterTransformPanelForm = {
  labels: string;
  confidence_threshold: string;
};

export type GrpcTransformPanelForm = {
  type: string;
  // Enpoint Url
  endpoint_url: string;
  // Container
  container_name: string;
  container_image: string;
  create_options: string;
  restart_policy: string;
  port: string;
  route: string;
  env: { key: string; value: string }[];
  architecture?: string;
  acceleration?: string;
};

export type InsightsOverLayType = 'true' | 'false' | '';

export type ExportPanelFromData = {
  filename_prefix: string;
  recording_duration: string;
  insights_overlay: InsightsOverLayType;
  delay_buffer: string;
  module_name: string;
  module_input: string;
  url: string;
  error: Partial<{
    filename_prefix: string;
    recording_duration: string;
    insights_overlay: string;
    delay_buffer: string;
    module_name: string;
    module_input: string;
    url: string;
  }>;
};

export type SkillModel = Pick<TrainingProject, 'id' | 'name' | 'inputs' | 'outputs' | 'kan_id'>;

export type SkillSideNode = {
  name?: string;
  displayName?: string;
  projectType?: ModelProjectType;
  nodeType: ModelNodeType;
  exportType?: ExportType;
  transformType?: TransformType;
  connectMap: Connection[];
  isEditDone: boolean;
  model?: SkillModel;
};

export type SkillNodeData = SkillSideNode & {
  configurations?: Partial<
    ModlePanelFormData &
      FilterTransformPanelForm &
      GrpcTransformPanelForm &
      ExportPanelFromData & { ip: string; fps: string; device_name: string }
  >;
};
