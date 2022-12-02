// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, Label } from '@fluentui/react';
import { Connection } from 'react-flow-renderer';

import { getNavCardClasses } from '../styles';
import { getNodeImage, getExportType, getTransformType } from '../../utils';
import { SkillModel } from '../../types';
import { ModelNodeType, ModelProjectType } from '../../../../store/types';

type Props = {
  displayName: string;
  name: string;
  projectType?: ModelProjectType;
  nodeType: ModelNodeType;
  connectMap: Connection[];
  model?: SkillModel;
  isDraggable: boolean;
};

const SideNavCard = (props: Props) => {
  const { nodeType, isDraggable, name, projectType, connectMap, model, displayName } = props;

  const classes = getNavCardClasses();

  const onDragStart = useCallback((event, cascadeNode) => {
    event.dataTransfer.setData(
      'application/skillNode',
      JSON.stringify({ ...cascadeNode, isEditDone: false }),
    );

    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <>
      <Stack
        onDragStart={(event) =>
          onDragStart(event, {
            name,
            displayName,
            projectType,
            exportType: getExportType(name),
            transformType: getTransformType(name),
            connectMap,
            model,
            nodeType,
          })
        }
        draggable={isDraggable}
        styles={{ root: classes.root }}
      >
        {!isDraggable && <Stack className={classes.disableCover} />}
        <Stack horizontal>
          <img style={{ height: '60px', width: '60px' }} src={getNodeImage(nodeType)} alt="icon" />
          <Stack styles={{ root: classes.titleWrapper }} horizontal horizontalAlign="space-between">
            <Stack verticalAlign="center">
              <Label styles={{ root: classes.title }}>{displayName}</Label>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export default SideNavCard;
