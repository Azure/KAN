// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback, useRef } from 'react';
import { Stack, Pivot, PivotItem, IPivotItemProps, Spinner } from '@fluentui/react';
import { useHistory, generatePath, Route, Switch, useParams } from 'react-router-dom';
import { clone } from 'ramda';
import { Node, Edge } from 'react-flow-renderer';
import { useSelector } from 'react-redux';

import { PivotTabKey, CreateAISkillFormData } from './types';
import { Url, ERROR_BLANK_VALUE, ERROR_NAME_BE_USED, ERROR_NAME_BLANK } from '../../constant';
import { nodeTypeModelFactory } from '../../store/trainingProjectSlice';
import { NODE_CONSTANT_X_POSITION, NODE_CONSTANT_Y_POSITION } from './utils';
import { SOURCE_CONFIGURATIONS } from './constant';

import TagTab, { Tag, getErrorMessage } from '../Common/TagTab';
import Basics from './Creation/Basics';
import Preview from './Creation/Preview';
import CascadeFlow from './Cascade/CascadeFlow';
import CreationFooter from './Creation/CreationFooter';
import ErrorIcon from '../Common/ErrorIcon';

interface Props {
  existingNameList: string[];
}

const AISkillCreation = (props: Props) => {
  const { existingNameList } = props;

  const { key } = useParams<{ key: PivotTabKey }>();
  const history = useHistory();

  const sourceModel = useSelector(nodeTypeModelFactory(['source']))[0];

  const reactFlowRef = useRef(null);
  const [elements, setElements] = useState<(Node | Edge)[]>([
    {
      id: `0`,
      type: 'source',
      position: { x: NODE_CONSTANT_X_POSITION, y: NODE_CONSTANT_Y_POSITION },
      data: {
        isEditDone: true,
        nodeType: sourceModel.nodeType,
        connectMap: [],
        model: {
          id: sourceModel.id,
          name: 'rtsp',
          inputs: sourceModel.inputs,
          outputs: sourceModel.outputs,
          symphony_id: sourceModel.symphony_id,
        },
        configurations: SOURCE_CONFIGURATIONS,
      },
    },
  ]);
  const [localFormData, setLocalFormData] = useState<CreateAISkillFormData>({
    name: '',
    acceleration: '-',
    fps: 15,
    cascade: {
      flow: '',
      error: '',
    },
    raw_data: '',
    tag_list: [{ name: '', value: '', errorMessage: '' }],
    symphony_id: '',
    screenshot: '',
    error: {
      name: '',
      acceleration: '',
      fps: '',
    },
  });
  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(key);
  const [isCreating, setIsCreating] = useState(false);

  const onLinkClick = useCallback(
    (key: PivotTabKey) => {
      setLocalPivotKey(key);

      history.push(
        generatePath(Url.AI_SKILL_CREATION, {
          key,
        }),
      );
    },
    [history],
  );

  const onFormDataChange = useCallback((newFormData: CreateAISkillFormData) => {
    setLocalFormData({ ...newFormData });
  }, []);

  const onTagChange = useCallback(
    (idx: number, newTag: Tag) => {
      const newTagList = clone(localFormData.tag_list);

      const dupNameList = newTagList.map((tag) => tag.name);
      dupNameList.splice(idx, 1);

      newTagList.splice(idx, 1, { ...newTag, errorMessage: getErrorMessage(newTag, dupNameList) });

      if (localFormData.tag_list.length - 1 === idx)
        newTagList.push({ name: '', value: '', errorMessage: '' });

      setLocalFormData((prev) => ({ ...prev, tag_list: newTagList }));
    },
    [localFormData.tag_list],
  );

  const onTagDelete = useCallback(
    (idx: number) => {
      setLocalFormData((prev) => {
        const newTagList = clone(localFormData.tag_list);
        newTagList.splice(idx, 1);

        return { ...prev, tag_list: newTagList };
      });
    },
    [localFormData.tag_list],
  );

  const onFormDateValidate = useCallback(
    (_: PivotTabKey) => {
      if (localFormData.name === '') {
        setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, name: ERROR_NAME_BLANK } }));
        return true;
      }

      if (existingNameList.includes(localFormData.name)) {
        setLocalFormData((prev) => ({ ...prev, error: { ...prev.error, name: ERROR_NAME_BE_USED } }));
        return true;
      }

      if (localFormData.acceleration === '-') {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, acceleration: ERROR_BLANK_VALUE },
        }));
        return true;
      }
      if (localFormData.fps === 0) {
        setLocalFormData((prev) => ({
          ...prev,
          error: { ...prev.error, fps: ERROR_BLANK_VALUE },
        }));
        return true;
      }

      if (
        localFormData.tag_list.length > 1 &&
        localFormData.tag_list.some((tag) => tag.errorMessage !== '')
      ) {
        return true;
      }

      return false;
    },
    [localFormData, existingNameList],
  );

  return (
    <>
      <Stack horizontal verticalAlign="center">
        <Pivot
          onLinkClick={(item) => onLinkClick(item?.props.itemKey! as PivotTabKey)}
          selectedKey={localPivotKey}
        >
          <PivotItem
            headerText="Basics"
            itemKey="basics"
            onRenderItemLink={(item: IPivotItemProps) => (
              <Stack horizontal>
                {Object.values(localFormData.error).some((error) => error !== '') && <ErrorIcon />}
                {item.headerText}
              </Stack>
            )}
          />
          <PivotItem
            headerText="Drag-and-Drop Nodes"
            itemKey="cascade"
            onRenderItemLink={(item: IPivotItemProps) => (
              <Stack horizontal>
                {Object.values(localFormData.cascade.error).some((error) => error !== '') && <ErrorIcon />}
                {item.headerText}
              </Stack>
            )}
          />
          <PivotItem
            headerText="Tags (Optional)"
            itemKey="tag"
            onRenderItemLink={(item: IPivotItemProps) => (
              <Stack horizontal>
                {localFormData.tag_list.length > 1 &&
                  localFormData.tag_list.some((tag) => tag.errorMessage !== '') && <ErrorIcon />}
                {item.headerText}
              </Stack>
            )}
          />
          <PivotItem
            headerText="Review + Create"
            itemKey="preview"
            style={{ height: '100%', position: 'relative' }}
          />
        </Pivot>
        {isCreating && <Spinner size={3} />}
      </Stack>
      <Switch>
        <Route
          exact
          path={Url.AI_SKILL_CREATION_PREVIEW}
          render={() => <Preview localFormData={localFormData} onLinkClick={onLinkClick} />}
        />
        <Route
          exact
          path={Url.AI_SKILL_CREATION_TAG}
          render={() => (
            <TagTab tagList={localFormData.tag_list} onTagChange={onTagChange} onTagDelete={onTagDelete} />
          )}
        />
        <Route
          exact
          path={Url.AI_SKILL_CREATION_CASCADE}
          render={() => (
            <CascadeFlow
              elements={elements}
              setElements={setElements}
              cascadeError={localFormData.cascade.error}
              onErrorCancel={() =>
                setLocalFormData((prev) => ({ ...prev, cascade: { ...prev.cascade, error: '' } }))
              }
              reactFlowRef={reactFlowRef}
              selectedAcceleraction={localFormData.acceleration}
            />
          )}
        />
        <Route
          exact
          path={Url.AI_SKILL_CREATION_BASIC}
          render={() => <Basics localFormData={localFormData} onFormDataChange={onFormDataChange} />}
        />
      </Switch>
      <CreationFooter
        currentStep={localPivotKey}
        onLinkClick={onLinkClick}
        localFormData={localFormData}
        isCreating={isCreating}
        onCreatingChange={(value: boolean) => setIsCreating(value)}
        stepList={['basics', 'cascade', 'tag', 'preview']}
        onFormDateValidate={onFormDateValidate}
        elements={elements}
        onFormDataChange={onFormDataChange}
        reactFlowRef={reactFlowRef}
      />
    </>
  );
};

export default AISkillCreation;
