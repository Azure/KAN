import { pick, groupBy, mapObjIndexed } from 'ramda';

// import { FormmatedCamera } from './types';
import { Camera } from '../../store/cameraSlice';

export type CameraFieldKey = keyof Pick<Camera, 'location'>;
export type CameraFieldMap = Record<CameraFieldKey, number[]>;

export const getFilterdCameraList = (cameraList: Camera[], target: string): Camera[] => {
  const regex = new RegExp(target, 'i');
  const matchcameraList = [];

  cameraList.forEach((camera) => {
    const isValueMatch = Object.values(pick(['name', 'location'] as (keyof Camera)[], camera)).find(
      (value: string) => value.match(regex),
    );

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

export const getDropOptions = (cameraList: Camera[], target: CameraFieldKey) => {
  const group = groupBy((camera) => camera[target], cameraList);
  const displayOptions = mapObjIndexed((value) => value.map((n) => n.id), group);

  return displayOptions;
};

export const getMinContentList = (cameraList: Camera[], fieldMap: CameraFieldMap) => {
  const minFilterFieldList = Object.values(fieldMap).reduce((minIdList, idList) => {
    if (minIdList.length === 0) return idList;
    if (minIdList.length > idList.length && idList.length !== 0) return idList;
    return minIdList;
  }, []);

  if (minFilterFieldList.length === 0) return cameraList;
  return cameraList.filter((camera) => minFilterFieldList.includes(camera.id));
};
