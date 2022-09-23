// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback } from 'react';
import { Stack, Icon, ActionButton, mergeStyleSets, SearchBox, Text } from '@fluentui/react';
import { useSelector } from 'react-redux';
import { Connection } from 'react-flow-renderer';
import { isEmpty, pick } from 'ramda';

import { nodeTypeModelFactory } from '../../../../store/trainingProjectSlice';
import { ModelNodeType, ModelProjectType, TrainingProject } from '../../../../store/types';

import SideNavCard from './SideNavCard';

const getClasses = () =>
  mergeStyleSets({
    root: {},
    sidebarWrapper: { borderBottom: '1px solid #C8C6C4' },
    searchBox: { width: '245px', margin: '10px 0' },
    searchBoxTip: { width: '245px', margin: '10px 0' },
    manageModels: { marginTop: '25px' },
  });

type ContentModel = {
  name: string;
  describe: string;
  nodetType: string;
  projectType: string;
};

const constantModelList = [
  {
    name: 'Run ML Model',
    describe: 'Object Detection',
    nodetType: 'model',
    projectType: 'ObjectDetection',
  },
  {
    name: 'Run ML Model',
    describe: 'Classification',
    nodetType: 'model',
    projectType: 'Classification',
  },
];

interface Props {
  connectMap: Connection[];
}

const getFilteredConstantModelList = (modelList: ContentModel[], target: string) => {
  const regex = new RegExp(target, 'i');

  return modelList.filter((model) => {
    const isValueMatch = Object.values(
      pick(['name', 'describe', 'nodetType'] as (keyof ContentModel)[], model),
    ).find((value: string) => {
      return value.match(regex);
    });

    return isValueMatch;
  });
};

const getFilterdNodelList = (modelList: TrainingProject[], target: string): TrainingProject[] => {
  const regex = new RegExp(target, 'i');

  return modelList.filter((model) => {
    const isValueMatch = Object.values(
      pick(['displayName', 'nodeType'] as (keyof TrainingProject)[], model),
    ).find((value: string) => {
      return value.match(regex);
    });

    return isValueMatch;
  });
};

const SideNavList = (props: Props) => {
  const { connectMap } = props;

  const transformList = useSelector(nodeTypeModelFactory(['transform']));
  const exportList = useSelector(nodeTypeModelFactory(['export']));

  const [localModelNodeList, setLocalModelNodeList] = useState(constantModelList);
  const [localTransformNodeList, setLocalTransformNodeList] = useState(transformList);
  const [localExportNodeList, setLocalExportNodeList] = useState(exportList);

  const [isModelToggle, setIsModelToggle] = useState(false);
  const [isTransformToggle, setIsTransformToggle] = useState(false);
  const [isExportToggle, setIsExportOpen] = useState(false);

  const classes = getClasses();

  const onSearchEnter = useCallback(
    (newValue: string) => {
      setLocalModelNodeList(getFilteredConstantModelList(constantModelList, newValue));
      setLocalTransformNodeList(getFilterdNodelList(transformList, newValue));
      setLocalExportNodeList(getFilterdNodelList(exportList, newValue));
    },
    [transformList, exportList],
  );

  const onSearchClear = useCallback(() => {
    setLocalModelNodeList(constantModelList);
    setLocalTransformNodeList(transformList);
    setLocalExportNodeList(exportList);
  }, [transformList, exportList]);

  const onSearchChange = useCallback(
    (newValue: string) => {
      if (isEmpty(newValue)) {
        setLocalModelNodeList(constantModelList);
        setLocalTransformNodeList(transformList);
        setLocalExportNodeList(exportList);
      }
    },
    [transformList, exportList],
  );

  return (
    <aside
      style={{
        borderRight: '1px solid #eee',
        background: '#fff',
        overflowY: 'auto',
        width: '280px',
      }}
    >
      <Stack>
        <SearchBox
          styles={{ root: classes.searchBox }}
          placeholder="Search"
          onSearch={onSearchEnter}
          onClear={onSearchClear}
          onChange={(_, newValue) => onSearchChange(newValue)}
        />
        <Text styles={{ root: classes.searchBoxTip }}>
          Drag and drop these nodes to the canvas on the right.
        </Text>

        {/* Model */}
        {localModelNodeList.length > 0 && (
          <>
            <Stack styles={{ root: classes.sidebarWrapper }}>
              <Stack horizontal verticalAlign="center">
                <Icon iconName={isModelToggle ? 'ChevronUp' : 'ChevronDown'} />
                <ActionButton
                  text="Models"
                  iconProps={{ iconName: 'ModelingView' }}
                  onClick={() => setIsModelToggle((prev) => !prev)}
                />
              </Stack>
            </Stack>
            {isModelToggle && (
              <Stack styles={{ root: { padding: '20px' } }} tokens={{ childrenGap: 20 }}>
                {localModelNodeList.map((model, id) => (
                  <SideNavCard
                    key={id}
                    displayName={model.name}
                    name={model.name}
                    describe={model.describe}
                    nodeType={model.nodetType as ModelNodeType}
                    isDraggable={true}
                    projectType={model.projectType as ModelProjectType}
                    connectMap={connectMap}
                  />
                ))}
              </Stack>
            )}
          </>
        )}

        {/* Transform */}
        {localTransformNodeList.length > 0 && (
          <>
            <Stack styles={{ root: classes.sidebarWrapper }}>
              <Stack horizontal verticalAlign="center">
                <Icon iconName={isTransformToggle ? 'ChevronUp' : 'ChevronDown'} />
                <ActionButton
                  text="Transform"
                  iconProps={{ iconName: 'ModelingView' }}
                  onClick={() => setIsTransformToggle((prev) => !prev)}
                />
              </Stack>
            </Stack>
            {isTransformToggle && (
              <Stack styles={{ root: { padding: '20px' } }} tokens={{ childrenGap: 20 }}>
                {localTransformNodeList.map((transform, id) => (
                  <SideNavCard
                    key={id}
                    displayName={transform.displayName}
                    name={transform.name}
                    describe=""
                    nodeType={transform.nodeType}
                    isDraggable={true}
                    connectMap={connectMap}
                    model={{
                      id: transform.id,
                      name: transform.name,
                      inputs: transform.inputs,
                      outputs: transform.outputs,
                      symphony_id: transform.symphony_id,
                    }}
                  />
                ))}
              </Stack>
            )}
          </>
        )}

        {/* Export */}
        {localExportNodeList.length > 0 && (
          <>
            <Stack styles={{ root: classes.sidebarWrapper }}>
              <Stack horizontal verticalAlign="center">
                <Icon iconName={isExportToggle ? 'ChevronUp' : 'ChevronDown'} />
                <ActionButton
                  text="Export"
                  iconProps={{ iconName: 'ModelingView' }}
                  onClick={() => setIsExportOpen((prev) => !prev)}
                />
              </Stack>
            </Stack>
            {isExportToggle && (
              <Stack styles={{ root: { padding: '20px' } }} tokens={{ childrenGap: 20 }}>
                {localExportNodeList.map((ex, id) => (
                  <SideNavCard
                    key={id}
                    name={ex.name}
                    displayName={ex.displayName}
                    describe=""
                    nodeType={ex.nodeType}
                    isDraggable={true}
                    connectMap={connectMap}
                    model={{
                      id: ex.id,
                      name: ex.name,
                      inputs: ex.inputs,
                      outputs: ex.outputs,
                      symphony_id: ex.symphony_id,
                    }}
                  />
                ))}
              </Stack>
            )}
          </>
        )}
      </Stack>
    </aside>
  );
};

export default SideNavList;
