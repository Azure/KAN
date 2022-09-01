import { Connection } from 'react-flow-renderer';

import { Tag } from '../Common/TagTab';
import { ModelNodeType, ModelCategory, ModelProjectType, TrainingProject } from '../../store/types';

export type PivotTabKey = 'basics' | 'preview' | 'tag' | 'cascade';
export type ExportType = 'snippet' | 'iotHub' | 'iotEdge' | 'http';

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
  symphony_id: string;
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
  symphony_id: string;
};

export type CaptureData = '-' | 'yes' | 'no';

export type ModlePanelFormData = {
  model: { id: number; name: string };
  category: ModelCategory | '';
  captureData: CaptureData;
  confidence_lower: number;
  confidence_upper: number;
  max_images: number;
  error: Partial<{
    model: string;
    captureData: string;
    confidence_lower: string;
    confidence_upper: string;
    max_images: string;
  }>;
};

export type TransformPanelFormData = {
  labels: string[];
  confidence_threshold: number;
  error: Partial<{
    confidence_threshold: string;
    labels: string;
  }>;
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

export type SkillSideNode = {
  name?: string;
  displayName?: string;
  projectType?: ModelProjectType;
  nodeType: ModelNodeType;
  exportType?: ExportType;
  connectMap: Connection[];
  isEditDone: boolean;
  model?: SkillModel;
};

export type SkillModel = Pick<TrainingProject, 'id' | 'name' | 'inputs' | 'outputs' | 'symphony_id'>;

export type SkillNodeData = SkillSideNode & {
  configurations?: Partial<
    ModlePanelFormData &
      TransformPanelFormData &
      ExportPanelFromData & { ip: string; fps: string; device_name: string }
  >;
};
