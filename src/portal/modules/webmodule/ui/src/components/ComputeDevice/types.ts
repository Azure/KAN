import { IChoiceGroupOption } from '@fluentui/react';

import { ComputeDevice } from '../../store/types';
import { accelerationOptions } from '../constant';
import { Tag } from '../Common/TagTab';

export type PivotTabKey = 'basics' | 'preview' | 'tag';
export type CPUArchitecture = 'X64' | 'ARM64';
export type ViewMode = 'card' | 'list';
export type DeviceCreateType = 'iot' | 'k8s';

export type CreateComputeDeviceFormData = Pick<
  ComputeDevice,
  'name' | 'iothub' | 'iotedge_device' | 'architecture' | 'acceleration' | 'cluster_type' | 'is_k8s'
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
  'name' | 'iothub' | 'iotedge_device' | 'architecture' | 'acceleration' | 'cluster_type' | 'is_k8s'
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

export const k8sCpuArchitectureOptions: IChoiceGroupOption[] = [
  {
    key: 'X64',
    text: 'X64',
  },
];

export const clusterOptions: IChoiceGroupOption[] = [
  {
    key: 'current',
    text: 'Current cluster',
  },
];

export const x64AccelerationOptions = accelerationOptions.filter((option) =>
  ['-', 'Nvidia dGPU', 'CPU', 'Intel iGPU'].includes(option.key as string),
);

export const k8sAccelerationOptions = accelerationOptions.filter((option) =>
  ['-', 'Nvidia dGPU', 'CPU'].includes(option.key as string),
);

export const arm64AccelerationOptions = accelerationOptions.filter((option) =>
  ['-', 'Nvidia Jetson (Jetpack 5)'].includes(option.key as string),
);
