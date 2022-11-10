// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { memo, useCallback } from 'react';
import { Stack, IContextualMenuProps, IconButton, Label } from '@fluentui/react';
import { Handle, addEdge, Connection, Edge, Node, isNode, Position } from 'react-flow-renderer';

import { SkillNodeData } from '../../types';
import { getNodeImage } from '../../utils';
import { getNodeClasses } from './styles';
import { getLimitText } from '../../../utils';

const TEXT_LIMIT = 19;
interface Props {
  id: string;
  cascadeData: SkillNodeData;
  setElements: any;
  onSelected: () => void;
  onDelete: () => void;
  onNodeConnect: (node: Node) => void;
  elementList: any;
  connectMap: Connection[];
}

const ModelNode = (props: Props) => {
  const { cascadeData, onSelected, onDelete, setElements, onNodeConnect } = props;

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
    (params: Connection) => {
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

        onNodeConnect(elements.find((element) => element.id === params.target) as Node);

        return addEdge(params, newElements);
      });
    },
    [setElements, onNodeConnect],
  );

  return (
    <>
      <Handle
        id="target"
        position={Position.Top}
        type="target"
        onConnect={onConnectEdge}
        isConnectable={true}
      />
      <Stack horizontal styles={{ root: classes.node }}>
        <img
          style={{ height: '60px', width: '60px' }}
          src={getNodeImage(cascadeData.nodeType)}
          alt="icon"
          onDragStart={(e) => e.preventDefault()}
        />
        <Stack styles={{ root: { padding: '5px 0 5px 12px', width: '220px' } }} verticalAlign="center">
          <Label>
            {!cascadeData.configurations ? 'Run ML Model' : getLimitText(cascadeData.model.name, TEXT_LIMIT)}
          </Label>
          {/* <Text styles={{ root: classes.label }}>
            {cascadeData.projectType === 'ObjectDetection' ? 'Object Detection' : 'Classification'}
          </Text> */}
        </Stack>
        <Stack verticalAlign="center">
          <IconButton
            className={classes.controlBtn}
            menuProps={menuProps}
            menuIconProps={{ iconName: 'MoreVertical' }}
          />
        </Stack>
      </Stack>
      <Handle
        id="source"
        position={Position.Bottom}
        type="source"
        isConnectable={true}
        onConnect={onConnectEdge}
        // onMouseEnter={() => setSelectedOutput(id)}
        // onMouseLeave={() => setSelectedOutput(-1)}
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
    </>
  );
};

export default memo(ModelNode);
