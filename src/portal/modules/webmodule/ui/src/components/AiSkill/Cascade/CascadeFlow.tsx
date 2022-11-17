// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  removeElements,
  Controls,
  isNode,
  Node,
  Edge,
  isEdge,
  Connection,
} from 'react-flow-renderer';
import { MessageBar, MessageBarType } from '@fluentui/react';

import { getCascadeFlowClasses } from './styles';
import { SkillSideNode } from '../types';
import './dnd.css';

import LeftNavigationList from './LeftNavigation/NavList';
import ModelNode from './Node/ModelNode';
import TransformNode from './Node/TransformNode';
import ExportNode from './Node/ExportNode';
import PanelContainer from './SidePanel/PanelContainer';
import SourceNode from './Node/SourceNode';
import CustomEdge from './CustomEdge';

interface Props {
  elements: (Node | Edge)[];
  setElements: React.Dispatch<React.SetStateAction<(Node<any> | Edge<any>)[]>>;
  cascadeError: string;
  onErrorCancel: () => void;
  reactFlowRef: React.MutableRefObject<any>;
  selectedAcceleraction: string;
  hasUseAiSkill?: boolean;
}

const getNodeId = (length: number) => length++;

const CascadeFlow = (props: Props) => {
  const {
    elements,
    setElements,
    cascadeError,
    onErrorCancel,
    reactFlowRef,
    selectedAcceleraction,
    hasUseAiSkill,
  } = props;

  const classes = getCascadeFlowClasses();

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const onElementsRemove = (elementsToRemove) => setElements((els) => removeElements(elementsToRemove, els));
  const onLoad = (_reactFlowInstance) => setReactFlowInstance(_reactFlowInstance);

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event) => {
    event.preventDefault();

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const skillNode = JSON.parse(event.dataTransfer.getData('application/skillNode')) as SkillSideNode;
    // const id = event.dataTransfer.getData('id');
    // const connectMap = event.dataTransfer.getData('connectMap');

    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    });

    setElements((es) => {
      return es.concat({
        id: getNodeId(es.length).toString(),
        type: skillNode.nodeType,
        position,
        data: skillNode,
      });
    });
  };

  const onNodeConnect = useCallback((node: Node) => {
    setSelectedNode(node);
  }, []);

  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setElements((prev) => {
        const deletedNode = prev.find((element) => isNode(element) && element.id === nodeId) as Node;
        const connectMap = prev[0].data.connectMap as Connection[];

        const newConnectMap = connectMap.filter(
          (connect) => connect.source !== deletedNode.id && connect.target !== deletedNode.id,
        );

        const newPrev: (Node<any> | Edge<any>)[] = [];

        prev.forEach((element) => {
          if (element.id === deletedNode.id) return;
          if (isEdge(element) && [element.source, element.target].includes(nodeId)) return;

          newPrev.push({ ...element, data: { ...element.data, connectMap: newConnectMap } });
        });

        return newPrev;
      });
    },
    [setElements],
  );

  const onDeleteEdge = useCallback(
    (edgeId: string) => {
      setElements((prev) => {
        const deletedEdgeIndex = prev.findIndex((element) => isEdge(element) && element.id === edgeId);
        const deletedEdge = prev[deletedEdgeIndex] as Edge;

        prev.splice(deletedEdgeIndex, 1);
        const adjustedConnectMapElements = prev.map((element) => {
          if (isNode(element)) {
            const newConnectMap = (element.data.connectMap as Connection[]).filter(
              (connect) =>
                connect.source !== deletedEdge.source &&
                connect.sourceHandle !== deletedEdge.sourceHandle &&
                connect.target !== deletedEdge.target &&
                connect.targetHandle !== deletedEdge.targetHandle,
            );

            return {
              ...element,
              data: { ...element.data, connectMap: newConnectMap },
            };
          }

          return element;
        });

        return adjustedConnectMapElements;
      });
    },
    [setElements],
  );

  return (
    <div className="dndflow">
      {cascadeError && (
        <div className={classes.errorWrapper} style={{ top: hasUseAiSkill ? 40 : 0 }}>
          <MessageBar messageBarType={MessageBarType.error} onDismiss={onErrorCancel}>
            {cascadeError}
          </MessageBar>
        </div>
      )}
      {hasUseAiSkill && (
        <div className={classes.errorWrapper}>
          <MessageBar
            messageBarType={MessageBarType.warning}
            messageBarIconProps={{ iconName: 'IncidentTriangle' }}
            styles={{ icon: { color: '#DB7500' } }}
          >
            Warning! This skill is referenced in at least one deployment. Changing this skill will modify your
            deployments that have a reference to this skill.
          </MessageBar>
        </div>
      )}
      <ReactFlowProvider>
        <LeftNavigationList connectMap={elements.length > 0 ? elements[0].data?.connectMap : []} />
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          {!!selectedNode && (
            <PanelContainer
              node={selectedNode}
              onDismiss={() => setSelectedNode(null)}
              setElements={setElements}
              acceleraction={selectedAcceleraction}
            />
          )}
          <ReactFlow
            className={classes.flow}
            ref={reactFlowRef}
            elements={elements}
            nodeTypes={{
              source: (node: Node) => {
                const { id, data } = node;

                return (
                  <SourceNode
                    id={id}
                    setElements={setElements}
                    onNodeConnect={onNodeConnect}
                    cascadeData={data}
                  />
                );
              },
              model: (node: Node) => {
                const { id, data } = node;

                return (
                  <ModelNode
                    id={id}
                    cascadeData={data}
                    onSelected={() => setSelectedNode(node)}
                    setElements={setElements}
                    onDelete={() => onDeleteNode(id)}
                    onNodeConnect={onNodeConnect}
                    elementList={elements}
                    connectMap={data.connectMap}
                  />
                );
              },
              transform: (node: Node) => {
                const { id, data } = node;

                return (
                  <TransformNode
                    id={id}
                    cascadeData={data}
                    onSelected={() => setSelectedNode(node)}
                    setElements={setElements}
                    onDelete={() => onDeleteNode(id)}
                    onNodeConnect={onNodeConnect}
                    connectMap={data.connectMap}
                  />
                );
              },
              export: (node: Node) => {
                const { id, data } = node;

                return (
                  <ExportNode
                    id={id}
                    cascadeData={data}
                    onSelected={() => setSelectedNode(node)}
                    // modelList={modelList}
                    // type="openvino_model"
                    setElements={setElements}
                    onDelete={() => onDeleteNode(id)}
                    connectMap={data.connectMap}
                  />
                );
              },
            }}
            edgeTypes={{
              default: (edge) => {
                return <CustomEdge {...edge} onDeleteEdge={(edgeId: string) => onDeleteEdge(edgeId)} />;
              },
            }}
            onElementsRemove={onElementsRemove}
            onLoad={onLoad}
            onDrop={onDrop}
            onDragOver={onDragOver}
            snapToGrid={true}
          >
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default CascadeFlow;
