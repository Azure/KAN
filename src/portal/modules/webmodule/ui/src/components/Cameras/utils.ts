import { pick, groupBy, mapObjIndexed } from 'ramda';

import { FormmatedCamera } from './types';

export type CameraFieldKey = keyof Pick<FormmatedCamera, 'locationName'>;
export type CameraFieldMap = Record<CameraFieldKey, number[]>;

export const getFilterdCameraList = (cameraList: FormmatedCamera[], target: string): FormmatedCamera[] => {
  const regex = new RegExp(target, 'i');
  const matchcameraList = [];

  cameraList.forEach((camera) => {
    const isValueMatch = Object.values(
      pick(['name', 'locationName'] as (keyof FormmatedCamera)[], camera),
    ).find((value: string) => value.match(regex));

    if (isValueMatch) {
      matchcameraList.push(camera);
      return;
    }

    if (camera.tag_list.length === 0) return;

    const isTagMatch = camera.tag_list.find(({ name, value }) => name.match(regex) || value.match(regex));
    if (isTagMatch) {
      matchcameraList.push(camera);
    }
  });

  return matchcameraList;
};

export const getDropOptions = (cameraList: FormmatedCamera[], target: CameraFieldKey) => {
  const group = groupBy((camera) => camera[target], cameraList);
  const displayOptions = mapObjIndexed((value) => value.map((n) => n.id), group);

  return displayOptions;
};

export const getMinContentList = (cameraList: FormmatedCamera[], fieldMap: CameraFieldMap) => {
  const minFilterFieldList = Object.values(fieldMap).reduce((minIdList, idList) => {
    if (minIdList.length === 0) return idList;
    if (minIdList.length > idList.length && idList.length !== 0) return idList;
    return minIdList;
  }, []);

  if (minFilterFieldList.length === 0) return cameraList;
  return cameraList.filter((camera) => minFilterFieldList.includes(camera.id));
};
