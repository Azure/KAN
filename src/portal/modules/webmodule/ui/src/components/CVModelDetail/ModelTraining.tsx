// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { TrainingProject } from '../../store/types';

import TagsSection from './ImageTraining/TagsSection';
import ImagesSection from './ImageTraining/ImagesSection';
import TrainingFooter from './ImageTraining/TrainingFooter';

interface Props {
  model: TrainingProject;
}

const ModelTraining = (props: Props) => {
  const { model } = props;

  return (
    <>
      <TagsSection modelId={model.id} />
      <ImagesSection modelId={model.id} />
      <TrainingFooter cvModelId={model.id} projectType={model.projectType} />
    </>
  );
};

export default ModelTraining;
