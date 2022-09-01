// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, Text, Icon } from '@fluentui/react';
import { Handle, addEdge, Connection, Node, Edge, isNode } from 'react-flow-renderer';

import { SkillNodeData } from '../../types';
import { getSourceNodeClasses } from './styles';

interface Props {
  id: string;
  setElements: any;
  onNodeConnect: (node: Node) => void;
}

const SourceNode = (props: Props) => {
  const { setElements, onNodeConnect } = props;

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
        <Icon styles={{ root: classes.title }} iconName="Camera" />
        <Text styles={{ root: classes.describe }}>Camera Input</Text>
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
