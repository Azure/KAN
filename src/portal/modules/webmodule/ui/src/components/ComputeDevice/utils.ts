import { pick, groupBy, mapObjIndexed } from 'ramda';

import { ComputeDevice } from '../../store/types';
import {
  DeviceCreateType,
  k8sAccelerationOptions,
  x64AccelerationOptions,
  arm64AccelerationOptions,
} from './types';

export type DeviceFieldKey = keyof Pick<ComputeDevice, 'acceleration' | 'architecture'>;
export type DeviceFieldMap = Record<DeviceFieldKey, number[]>;

export const getFilterdDeviceList = (deviceList: ComputeDevice[], target: string): ComputeDevice[] => {
  const regex = new RegExp(target, 'i');
  const matchDeviceList = [];

  deviceList.forEach((device) => {
    const isValueMatch = Object.values(
      pick(
        ['name', 'iothub', 'iotedge_device', 'acceleration', 'architecture'] as (keyof ComputeDevice)[],
        device,
      ),
    ).find((value: string) => value.match(regex));

    if (isValueMatch) {
      matchDeviceList.push(device);
      return;
    }

    if (device.tag_list.length === 0) return;

    const isTagMatch = device.tag_list.find(({ name, value }) => name.match(regex) || value.match(regex));
    if (isTagMatch) {
      matchDeviceList.push(device);
    }
  });

  return matchDeviceList;
};

export const getDropOptions = (deviceList: ComputeDevice[], target: DeviceFieldKey) => {
  const group = groupBy((device) => device[target], deviceList);
  const displayOptions = mapObjIndexed((value) => value.map((n) => n.id), group);

  return displayOptions;
};

export const getMinContentList = (deviceList: ComputeDevice[], fieldMap: DeviceFieldMap) => {
  const minFilterFieldList = Object.values(fieldMap).reduce((minIdList, idList) => {
    if (minIdList.length === 0) return idList;
    if (minIdList.length > idList.length && idList.length !== 0) return idList;
    return minIdList;
  }, []);

  if (minFilterFieldList.length === 0) return deviceList;
  return deviceList.filter((device) => minFilterFieldList.includes(device.id));
};

export const getAccelerationOptions = (architecture: string, createType: DeviceCreateType) => {
  if (createType === 'k8s') return k8sAccelerationOptions;
  if (architecture === 'X64') return x64AccelerationOptions;
  return arm64AccelerationOptions;
};
