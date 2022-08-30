import { IChoiceGroupOption } from '@fluentui/react';

import { ComputeDevice } from '../../store/types';
import { Tag } from '../Common/TagTab';

export type PivotTabKey = 'basics' | 'preview' | 'tag';
export type CPUArchitecture = 'X64' | 'ARM64';
export type ViewMode = 'card' | 'list';

export type CreateComputeDeviceFormData = Pick<
  ComputeDevice,
  'name' | 'iothub' | 'iotedge_device' | 'architecture' | 'acceleration'
> & {
  tag_list: Tag[];
  error: {
    name: string;
    iotHub: string;
    iotedge_device: string;
    acceleration: string;
  };
};

export type UpdateComputeDeviceFromData = Pick<
  ComputeDevice,
  'name' | 'iothub' | 'iotedge_device' | 'architecture' | 'acceleration'
> & {
  tag_list: Tag[];
};

export const cpuArchitectureOptions: IChoiceGroupOption[] = [
  {
    key: 'X64',
    text: 'X64',
  },
  {
    key: 'ARM64',
    text: 'ARM64',
  },
];