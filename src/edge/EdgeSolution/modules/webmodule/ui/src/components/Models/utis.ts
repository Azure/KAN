import { pick, groupBy, mapObjIndexed } from 'ramda';

import { FormattedModel } from '../../store/types';

export type ModelFieldKey = keyof Pick<FormattedModel, 'displayType' | 'accelerationList' | 'trainStatus'>;
export type ModelFieldMap = Record<ModelFieldKey, number[]>;

export const getFilterdModelList = (modelList: FormattedModel[], target: string): FormattedModel[] => {
  const regex = new RegExp(target, 'i');
  const matchModelList = [];

  modelList.forEach((model) => {
    const isValueMatch = Object.values(pick(['name', 'displayType'] as (keyof FormattedModel)[], model)).find(
      (value: string) => value.match(regex),
    );

    if (isValueMatch) {
      matchModelList.push(model);
      return;
    }

    const isAccerlationMatch = model.accelerationList.find((value) => value.match(regex));
    if (isAccerlationMatch) {
      matchModelList.push(model);
      return;
    }

    const isModelTagMatch = model.displayTagList.find((tag) => tag.match(regex));
    if (isModelTagMatch) {
      matchModelList.push(model);
      return;
    }

    if (model.tag_list.length === 0) return;
    const isTagMatch = model.tag_list.find(({ name, value }) => name.match(regex) || value.match(regex));
    if (isTagMatch) {
      matchModelList.push(model);
    }
  });

  return matchModelList;
};

export const getDropOptions = (modelList: FormattedModel[], target: ModelFieldKey) => {
  const group =
    target !== 'accelerationList'
      ? groupBy((camera) => camera[target], modelList)
      : modelList.reduce((acc, model) => {
          model.accelerationList.forEach((acceleration) => {
            if (!acc[acceleration]) {
              acc[acceleration] = [model];
            } else {
              acc[acceleration] = [...acc[acceleration], model];
            }
          });

          return acc;
        }, {});

  const displayOptions = mapObjIndexed((value) => value.map((n) => n.id), group);

  return displayOptions;
};

export const getMinContentList = (cameraList: FormattedModel[], fieldMap: ModelFieldMap) => {
  const minFilterFieldList = Object.values(fieldMap).reduce((minIdList, idList) => {
    if (minIdList.length === 0) return idList;
    if (minIdList.length > idList.length && idList.length !== 0) return idList;
    return minIdList;
  }, []);

  if (minFilterFieldList.length === 0) return cameraList;
  return cameraList.filter((camera) => minFilterFieldList.includes(camera.id));
};
