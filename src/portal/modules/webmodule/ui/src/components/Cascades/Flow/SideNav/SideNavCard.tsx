// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, Text, Label } from '@fluentui/react';
import { Connection } from 'react-flow-renderer';

import { ModelNodeType, TrainingProject } from '../../../../store/types';
import { getClasses } from './style';
import { getNodeImage } from '../../utils';
import { convertProjectType } from '../../../utils';

interface Props {
  model: TrainingProject;
  type: ModelNodeType;
  connectMap: Connection[];
  isDraggable: boolean;
}

const SideNavCard = (props: Props) => {
  const { model, type, connectMap, isDraggable } = props;

  const classes = getClasses();

  const onDragStart = useCallback(
    (event, nodeType) => {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.setData('id', model.id);
      event.dataTransfer.setData('connectMap', JSON.stringify(connectMap));

      event.dataTransfer.effectAllowed = 'move';
    },
    [connectMap, model],
  );

  return (
    <>
      <Stack
        onDragStart={(event) => onDragStart(event, type)}
        draggable={isDraggable}
        styles={{ root: classes.root }}
      >
        {!isDraggable && <Stack className={classes.disableCover} />}
        <Stack horizontal>
          <img
            style={{ height: '60px', width: '60px' }}
            src={getNodeImage('customvision_model')}
            alt="icon"
          />
          <Stack styles={{ root: classes.titleWrapper }} horizontal horizontalAlign="space-between">
            {type === 'model' ? (
              <Stack>
                <Label styles={{ root: classes.title }}>Export</Label>
              </Stack>
            ) : (
              <Stack>
                <Label styles={{ root: classes.title }}>{model.name}</Label>
                {type !== 'export' && (
                  <Text styles={{ root: classes.label }}>{convertProjectType(model.projectType)}</Text>
                )}
              </Stack>
            )}
          </Stack>
        </Stack>
        {['openvino_model', 'customvision_model'].includes(type) && (
          <Stack styles={{ root: classes.bottomWrapper }}>
            <Label styles={{ root: classes.smallLabel }}>
              {type === 'model' ? 'By Intel' : 'By Microsoft Custom Vision'}
            </Label>
          </Stack>
        )}
      </Stack>
    </>
  );
};

export default SideNavCard;
