import { Tag } from '../Common/TagTab';
import { ClassificationType, ProjectType } from '../../store/trainingProjectSlice';
import { TrainStatus } from '../../constant';

export type ModelType = 'custom' | 'own' | 'ovms';
export type PivotTabKey = 'basics' | 'preview' | 'tag' | 'configure';
export type CreateType = '' | 'yes' | 'no' | 'own';

export type CreateModelFormData = {
  createType: CreateType;
  name: string;
  customVisionId: string;
  type: '' | ProjectType;
  classification: ClassificationType;
  objects: string[];
  modelFormat: string;
  modelFile: string;
  labelFile: string;
  description: string;
  tag_list: Tag[];
  error: {
    name: string;
    createType: string;
    customVisionId: string;
    type: string;
    classification: string;
    objects: string;
    modelFormat: string;
    modelFile: string;
    labelFile: string;
    description: string;
  };
};

export type CreateCustomVisionForm = {
  name: string;
  type: ProjectType;
  tags: string[];
  selectedCustomVisionId: string;
  classification: ClassificationType;
};

export type CreateOwnModelForm = {
  name: string;
  endPoint: string;
  labels: string;
};

export const NO_LIMIT_TRAIN_STATUS: TrainStatus[] = ['ok', 'Failed', 'Success', 'No change'];
