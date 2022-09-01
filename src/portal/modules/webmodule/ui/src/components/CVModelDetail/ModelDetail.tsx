// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Label, IconButton } from '@fluentui/react';
import { useHistory } from 'react-router-dom';

import { TrainingProject } from '../../store/types';
import { getModelDetailClasses } from './styles';
import { Url } from '../../constant';

import ImageTraining from './ModelTraining';

type Props = {
  model: TrainingProject;
};

const ModelDetail: React.FC<Props> = (props: Props) => {
  const { model } = props;

  const classes = getModelDetailClasses();
  const history = useHistory();

  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <Stack grow>
        <Stack
          className={classes.modelTitleWrapper}
          horizontal
          horizontalAlign="space-between"
          verticalAlign="center"
        >
          <Label styles={{ root: classes.modelTitle }}>{model.name}</Label>
          <IconButton iconProps={{ iconName: 'Cancel' }} onClick={() => history.push(Url.MODELS)} />
        </Stack>
        <ImageTraining model={model} />
      </Stack>
    </Stack>
  );
};

export default ModelDetail;
