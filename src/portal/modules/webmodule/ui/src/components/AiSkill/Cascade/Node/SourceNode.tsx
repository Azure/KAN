// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, Label, IconButton } from '@fluentui/react';
import { Handle, addEdge, Connection, Node, Edge, isNode } from 'react-flow-renderer';

import { SkillNodeData } from '../../types';
import { getSourceNodeClasses } from './styles';
import { getNodeImage } from '../../utils';

interface Props {
  id: string;
  setElements: any;
  onNodeConnect: (node: Node) => void;
  cascadeData: SkillNodeData;
}

const SourceNode = (props: Props) => {
  const { setElements, onNodeConnect, cascadeData } = props;

  const classes = getSourceNodeClasses();

  const onConnectEdge = useCallback(
    (params: Connection) => {
      setElements((elements: (Node<SkillNodeData> | Edge<any>)[]) => {
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
      <Stack
        styles={{
          root: classes.root,
        }}
        horizontal
        verticalAlign="center"
        tokens={{ childrenGap: 10 }}
      >
        <img
          style={{ height: '60px', width: '60px' }}
          src={getNodeImage(cascadeData.nodeType)}
          alt="icon"
          onDragStart={(e) => e.preventDefault()}
        />
        <Stack styles={{ root: { padding: '5px 0 5px 12px', width: '180px' } }} verticalAlign="center">
          <Label>Camera Input</Label>
        </Stack>
        <Stack verticalAlign="center">
          <IconButton className={classes.controlBtn} menuIconProps={{ iconName: 'MoreVertical' }} />
        </Stack>
      </Stack>
      <Handle
        id="source"
        type="source"
        // @ts-ignore
        position="bottom"
        // @ts-ignore
        onConnect={onConnectEdge}
        // isValidConnection={(connection: Connection) => {
        //   // @ts-ignore
        //   const connectedTarget = cascadeData.connectMap.find(
        //     (connect: Connection) =>
        //       connect.target === connection.target && connect.targetHandle === connection.targetHandle,
        //   );
        //   if (connectedTarget) return false;

        //   return true;
        // }}
      />
    </>
  );
};

export default SourceNode;
