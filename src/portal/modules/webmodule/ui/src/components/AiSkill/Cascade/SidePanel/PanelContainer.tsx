// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Node } from 'react-flow-renderer';

import { SkillNodeData } from '../../types';

import ModelPanel from './ModelPanel';
import FilterPanel from './FilterPanel';
import GrpcPanel from './GrpcPanel';
import ExportPanel from './ExportPanel';

interface Props {
  node: Node<SkillNodeData>;
  onDismiss: () => void;
  setElements: any;
  acceleraction: string;
}

const PanelContainer = (props: Props) => {
  const { node, onDismiss, setElements, acceleraction } = props;
  const { data } = node;

  if (node.type === 'model')
    return (
      <ModelPanel node={node} onDismiss={onDismiss} setElements={setElements} acceleraction={acceleraction} />
    );

  if (data.transformType === 'filter')
    return <FilterPanel node={node} onDismiss={onDismiss} setElements={setElements} />;

  if (data.transformType === 'grpc')
    return <GrpcPanel node={node} onDismiss={onDismiss} setElements={setElements} />;

  if (node.type === 'export')
    return <ExportPanel node={node} onDismiss={onDismiss} setElements={setElements} />;

  return <></>;
};

export default PanelContainer;
