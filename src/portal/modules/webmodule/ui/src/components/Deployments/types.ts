import { Deployment } from '../../store/types';

import { Tag } from '../Common/TagTab';

export type PivotTabKey = 'basics' | 'preview' | 'tag' | 'configure';

export type FormattedDeployment = Deployment & {
  deviceName: string;
  skillNameList: string[];
};

export type ConfigureSkill = {
  id: number;
  name: string;
  // threshold: number;
  // storageLocation: number;
  // xyz: number;
  configured: boolean;
};

export type ConfigureCamera = {
  camera: number;
  name: string;
  skillList: ConfigureSkill[];
};

export type CreateDeploymentFormData = {
  name: string;
  device: { key: number; text: string; data: string };
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
  device: { key: number; text: string; data: string };
  cameraList: ConfigureCamera[];
  tag_list: Tag[];
  error: {
    cameraList: string;
    skillList: string;
  };
};
