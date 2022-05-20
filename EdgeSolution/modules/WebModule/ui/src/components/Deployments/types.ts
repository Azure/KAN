import { Tag } from '../Common/TagPage';

export type PivotTabKey = 'basics' | 'preview' | 'tag' | 'configure';

export type CreateDeploymentFormData = {
  name: string;
  device: { key: number; text: string };
  cameraList: { key: number; text: string }[];
  tagList: Tag[];
};
