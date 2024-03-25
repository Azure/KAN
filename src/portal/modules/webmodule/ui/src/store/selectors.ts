import { createSelector } from '@reduxjs/toolkit';

import { selectAllImages } from './imageSlice';
import { selectPartEntities, selectAllParts } from './partSlice';
import { Item as ImageListItem } from '../components/ImageList';
import { selectAllCameras, Camera } from './cameraSlice';
import { selectAllAnno } from './annotationSlice';
import { selectAllCascades } from './cascadeSlice';
import { selectAllComputeDevices } from './computeDeviceSlice';
import { selectAllDeployments } from './deploymentSlice';
import { selectAllTrainingProjects } from './trainingProjectSlice';

import { Image, Annotation } from './type';
import { ModelCategory, ModelProjectType } from './types';
import { Acceleration } from '../components/constant';

const getImgListItem = (
  img: Image,
  partEntities,
  cameraList: Camera[],
  annotations: Annotation[],
): ImageListItem => {
  const part = partEntities[img.part];
  const camera = cameraList.find((c) => c.symphony_id === img.camera);

  const parts = img.labels
    .map((id) => annotations.find((anno) => anno.id === id).part)
    .filter((_part) => _part)
    .map((partId) => partEntities[partId])
    .map((_part) => ({ id: _part.id, name: _part.name }));

  return {
    id: img.id,
    image: img.image,
    timestamp: img.timestamp,
    manualChecked: img.manualChecked,
    part: {
      id: part?.id || null,
      name: part?.name || '',
    },
    camera: {
      id: camera?.id || null,
      name: camera?.name || '',
    },
    parts,
  };
};

export const partsImagesSelectorFactory = createSelector(
  [selectAllImages, selectAllAnno],
  (images, annotations) =>
    images.map((img) => ({
      ...img,
      parts: img.labels
        .map((label) => annotations.find((anno) => anno.id === label).part)
        .filter((part) => part),
    })),
);

/**
 * Get the part-image selector by passing the part ID
 * @param partId
 */
export const partImageItemSelectorFactory = (partId) =>
  createSelector(
    [partsImagesSelectorFactory, selectPartEntities, selectAllCameras, selectAllAnno],
    (partAllImages, partEntities, cameraList, annotations) => {
      return partAllImages
        .filter((img) => !img.isRelabel && img.parts.includes(partId))
        .map((img) => getImgListItem(img, partEntities, cameraList, annotations));
    },
  );

/**
 * Create a memoize image item selector by passing untagged
 * @param unTagged If the selector need to select untagged image
 */
export const imageItemSelectorFactory = (unTagged: boolean) =>
  createSelector(
    [selectAllImages, selectPartEntities, selectAllCameras, selectAllAnno],
    (images, partEntities, cameraList, annotations) => {
      return images
        .filter((img) => {
          if (unTagged) return !img.manualChecked && !img.isRelabel;
          return img.manualChecked;
        })
        .map((img) => getImgListItem(img, partEntities, cameraList, annotations));
    },
  );

export const relabelImageSelector = createSelector(
  [selectAllImages, selectPartEntities, selectAllCameras, selectAllAnno],
  (images, partEntities, cameraList, annotations) => {
    return images
      .filter((img) => img.isRelabel && !img.manualChecked)
      .map((img) => getImgListItem(img, partEntities, cameraList, annotations));
  },
);

export const selectNonDemoPart = createSelector([selectAllParts], (parts) => parts);

export const selectProjectPartsFactory = (projectId: number) =>
  createSelector([selectAllParts], (parts) => parts.filter((part) => part.trainingProject === projectId));

export const isLabeledImagesSelector = (projectId: number) =>
  createSelector([selectAllImages, selectAllAnno], (images, annotations) => {
    return images
      .filter((image) => image.project === projectId)
      .filter((image) => !image.uploaded)
      .map((image) => ({
        ...image,
        labels: image.labels
          .map((label) =>
            annotations.filter((anno) => anno.part).find((annotation) => annotation.id === label),
          )
          .filter((label) => label),
      }));
  });

export const matchDeviceAccelerationSelectorFactory = (deivceId: string) =>
  createSelector([selectAllCascades, selectAllComputeDevices], (aiSkillList, deiceList) => {
    const matchDevice = deiceList.find((device) => device.symphony_id === deivceId);

    return aiSkillList.filter((skill) => skill.acceleration === matchDevice.acceleration);
  });

export const formattedDeploymentSelectorFactory = createSelector(
  [selectAllDeployments, selectAllComputeDevices, selectAllCascades],
  (deploymentList, deviceList, aiSkillList) => {
    if (deploymentList.length === 0 || deviceList.length === 0 || aiSkillList.length === 0) return [];

    return deploymentList.map((deployment) => ({
      ...deployment,
      deviceName: deviceList.find((device) => device.symphony_id === deployment.compute_device).name,
      skillNameList: deployment.configure
        .map((con) => con.skills.map((skill) => skill.id))
        .flat()
        .map((id) => aiSkillList.find((skill) => skill.symphony_id === id).name),
    }));
  },
);

const getModelZooTag = (modelName: string) => {
  switch (modelName) {
    case 'age-gender-recognition':
      return ['female', 'male'];
    case 'emotion-recognition':
      return ['neutral', 'happy', 'sad', 'surprise', 'anger'];
    case 'face-detection':
      return ['face'];
    case 'pedestrian-and-vehicle-detector':
      return ['vehicle', 'pedestrian'];
    case 'person-detection':
      return ['person'];
    case 'vehicle-attributes-recognition':
      return ['white', 'gray', 'yellow', 'red', 'green', 'blue', 'black'];
    case 'aggressive-behavior':
      return ['aggressive'];
    default:
      return [];
  }
};

export const projectTypeModelSelectorFactory = (categroy: ModelCategory) =>
  createSelector([selectAllTrainingProjects, selectAllParts], (modelList, partList) => {
    return modelList.reduce((accModel, model) => {
      if (model.category !== categroy) return accModel;

      const displayTagList =
        model.category === 'customvision'
          ? partList.filter((part) => part.trainingProject === model.id).map((tag) => tag.name)
          : getModelZooTag(model.name);

      return [...accModel, { ...model, displayTagList }];
    }, []);
  });

export const accelerationModelSelectorFactory = (typeList: ModelProjectType[], acceleration: Acceleration) =>
  createSelector([selectAllTrainingProjects, selectAllParts], (modelList, partList) => {
    return modelList.reduce((accModel, model) => {
      if (!typeList.includes(model.projectType) || !model.accelerationList.includes(acceleration))
        return accModel;

      const displayTagList =
        model.category === 'customvision'
          ? partList.filter((part) => part.trainingProject === model.id).map((tag) => tag.name)
          : getModelZooTag(model.name);

      return [...accModel, { ...model, displayTagList }];
    }, []);
  });
