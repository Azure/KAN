// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Node } from 'react-flow-renderer';

import ModelPanel from './ModelPanel';
import TransformPanel from './TransformPanel';
import ExportPanel from './ExportPanel';

interface Props {
  node: Node;
  onDismiss: () => void;
  setElements: any;
  acceleraction: string;
}

const PanelContainer = (props: Props) => {
  const { node, onDismiss, setElements, acceleraction } = props;

  if (node.type === 'model')
    return (
      <ModelPanel node={node} onDismiss={onDismiss} setElements={setElements} acceleraction={acceleraction} />
    );

  if (node.type === 'transform')
    return <TransformPanel node={node} onDismiss={onDismiss} setElements={setElements} />;

  if (node.type === 'export')
    return <ExportPanel node={node} onDismiss={onDismiss} setElements={setElements} />;

  return <></>;
};

export default PanelContainer;
