import { Deployment } from '../../store/types';

import { Tag } from '../Common/TagTab';

export type PivotTabKey = 'basics' | 'preview' | 'tag' | 'configure';
export const STEP_ORDER = ['basics', 'configure', 'tag', 'preview'] as PivotTabKey[];

export type FormattedDeployment = Deployment & {
  deviceName: string;
  skillNameList: string[];
};

export type ConfigureSkill = {
  id: number;
  name: string;
  configured: boolean;
};

export type ConfigureCamera = {
  camera: string;
  name: string;
  skillList: ConfigureSkill[];
};

export type CreateDeploymentFormData = {
  name: string;
  device: { key: string; text: string };
  cameraList: ConfigureCamera[];
  tag_list: Tag[];
  error: {
    name: string;
    device: string;
    cameraList: string;
    skillList: string;
  };
};

export type UpdateDeploymentFormData = {
  name: string;
  device: { key: string; text: string };
  cameraList: ConfigureCamera[];
  tag_list: Tag[];
  error: {
    cameraList: string;
    skillList: string;
  };
};
