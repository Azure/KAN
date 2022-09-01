// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { memo, useCallback } from 'react';
import { Stack, IContextualMenuProps, IconButton, Label } from '@fluentui/react';
import { Handle, addEdge, Connection, Edge, Node, isNode } from 'react-flow-renderer';

import { getNodeImage } from '../../utils';
import { getNodeClasses } from './styles';
import { SkillNodeData } from '../../types';

interface Props {
  id: string;
  cascadeData: SkillNodeData;
  onSelected: () => void;
  onDelete: () => void;
  setElements: any;
  connectMap: Connection[];
}

const ExportNode = (props: Props) => {
  const { cascadeData, onSelected, onDelete, setElements } = props;

  const classes = getNodeClasses();

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'properties',
        text: 'Properties',
        iconProps: { iconName: 'Equalizer' },
        onClick: onSelected,
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
        onClick: onDelete,
      },
    ],
  };

  const onConnectEdge = useCallback(
    (params: Connection) =>
      setElements((elements: (Node<any> | Edge<any>)[]) => {
        const newElements = elements.map((element) => {
          if (isNode(element)) {
            return {
              ...element,
              data: {
                ...element.data,
                connectMap: [...(element.data.connectMap ?? []), params],
              },
            };
          }

          return element;
        });

        return addEdge(params, newElements);
      }),
    [setElements],
  );

  return (
    <>
      <Handle
        id="target"
        // @ts-ignore
        position="top"
        type="target"
        onConnect={onConnectEdge}
        isConnectable={true}
        isValidConnection={(connection: Connection) => {
          // @ts-ignore
          const connectedTarget = cascadeData.connectMap.find(
            (connect: Connection) =>
              connect.target === connection.target && connect.targetHandle === connection.targetHandle,
          );
          if (connectedTarget) return false;

          return true;
        }}
      />
      <Stack horizontal styles={{ root: classes.node }}>
        <img
          style={{ height: '60px', width: '60px' }}
          src={getNodeImage(cascadeData.nodeType)}
          alt="icon"
          onDragStart={(e) => e.preventDefault()}
        />
        <Stack className={classes.nodeWrapper} styles={{ root: { justifyContent: 'center' } }}>
          <Label styles={{ root: { padding: 0 } }}>{cascadeData.displayName}</Label>
        </Stack>
        <Stack verticalAlign="center">
          <IconButton
            className={classes.controlBtn}
            menuProps={menuProps}
            menuIconProps={{ iconName: 'MoreVertical' }}
          />
        </Stack>
      </Stack>
    </>
  );
};

export default memo(ExportNode);
