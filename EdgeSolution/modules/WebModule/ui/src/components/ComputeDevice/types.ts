import { IChoiceGroupOption, IDropdownOption } from '@fluentui/react';

import { ComputeDevice } from '../../store/types';
import { Tag } from '../Common/TagPage';

export type PivotTabKey = 'basics' | 'preview' | 'tag';
export type CPUArchitecture = 'X64' | 'ARM64';
export type ViewMode = 'card' | 'list';

export type CreateComputeDeviceFormData = Pick<
  ComputeDevice,
  'name' | 'iotHub' | 'iotedge_device' | 'architecture' | 'acceleration'
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
  'name' | 'architecture' | 'acceleration' | 'tag_list'
> & {
  error: {
    name: string | null;
  };
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

export const accelerationOptions: IDropdownOption[] = [
  { key: '-', text: '-' },
  { key: 'GPU', text: 'GPU' },
  { key: 'CPU', text: 'CPU' },
  { key: 'VPU', text: 'VPU' },
  { key: 'iGPU', text: 'iGPU' },
];
