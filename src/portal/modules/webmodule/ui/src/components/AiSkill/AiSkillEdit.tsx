// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Stack, Pivot, PivotItem, IPivotItemProps, Spinner } from '@fluentui/react';
import { useHistory, generatePath, Route, Switch, useParams } from 'react-router-dom';
import { clone } from 'ramda';
import { Node, Edge, isNode } from 'react-flow-renderer';
import { useSelector } from 'react-redux';
import dagre from 'dagre';
import html2canvas from 'html2canvas';

import { State as RootState } from 'RootStateType';
import { PivotTabKey, UpdateAiSkillFormData, STEP_ORDER } from './types';
import { Url, theme } from '../../constant';
import { selectCascadeById } from '../../store/cascadeSlice';
import { selectAllTrainingProjects } from '../../store/trainingProjectSlice';
import { selectHasUseAiSkillSelectoryFactory } from '../../store/deploymentSlice';
import {
  getCascadeErrorMessage,
  convertElementsPayload,
  backToSkillRawElements,
  NODE_CONSTANT_X_POSITION,
  NODE_CONSTANT_Y_POSITION,
} from './utils';
import { getScrllStackClasses } from '../Common/styles';

import TagTab, { Tag, getErrorMessage } from '../Common/TagTab';
import Basics from './Edit/Basics';
import Preview from './Creation/Preview';
import CascadeFlow from './Cascade/CascadeFlow';
import EditFooter from './Edit/EditFooter';
import ErrorIcon from '../Common/ErrorIcon';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 300;
const nodeHeight = 60;

const getLayoutedElements = (elements, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  elements.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });

  dagre.layout(dagreGraph);

  return elements.map((el) => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id);
      // @ts-ignore
      el.targetPosition = 'top';
      // @ts-ignore
      el.sourcePosition = 'bottom';

      // unfortunately we need this little hack to pass a slightly different position
      // to notify react flow about the change. Moreover we are shifting the dagre node position
      // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
      el.position = {
        x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000 + NODE_CONSTANT_X_POSITION,
        y: nodeWithPosition.y - nodeHeight / 2 + NODE_CONSTANT_Y_POSITION,
      };
    }

    return el;
  });
};

const AiSkillEdit = () => {
  const { id, step: editStep } = useParams<{ id: string; step: PivotTabKey }>();

  const history = useHistory();
  const scrllStackClasses = getScrllStackClasses();

  const skill = useSelector((state: RootState) => selectCascadeById(state, id));
  const modelList = useSelector((state: RootState) => selectAllTrainingProjects(state));
  const hasAiSkillDeployment = useSelector(selectHasUseAiSkillSelectoryFactory(+id));

  const reactFlowRef = useRef(null);
  const [elements, setElements] = useState<(Node | Edge)[]>([]);
  const [localFormData, setLocalFormData] = useState<UpdateAiSkillFormData>({
    name: '',
    acceleration: '-',
    fps: 0,
    cascade: {
      flow: '',
      error: '',
    },
    raw_data: '',
    tag_list: [{ name: '', value: '', errorMessage: '' }],
    symphony_id: '',
    screenshot: '',
  });
  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(editStep);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!skill) return;

    setLocalFormData({
      name: skill.name,
      acceleration: skill.acceleration,
      fps: skill.fps,
      symphony_id: skill.symphony_id,
      cascade: {
        flow: '',
        error: '',
      },
      raw_data: '',
      tag_list: [
        ...skill.tag_list.map((tag) => ({ ...tag, errorMessage: '' })),
        { name: '', value: '', errorMessage: '' },
      ],
      screenshot: '',
    });

    if (skill.raw_data === '') {
      const result = backToSkillRawElements(JSON.parse(skill.flow), modelList);

      setElements(getLayoutedElements(result));
    } else {
      setElements(JSON.parse(skill.raw_data));
    }
  }, [skill, modelList]);

  const onLinkClick = useCallback(
    (step: PivotTabKey) => {
      setLocalPivotKey(step);

      history.push(
        generatePath(Url.AI_SKILL_EDIT, {
          id: skill.id,
          step,
        }),
      );
    },
    [history, skill],
  );

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
    (nextStep: PivotTabKey, currentStep: PivotTabKey) => {
      if (
        localFormData.tag_list.length > 1 &&
        localFormData.tag_list.some((tag) => tag.errorMessage !== '') &&
        currentStep === 'tag'
      ) {
        return true;
      }

      return false;
    },
    [localFormData],
  );

  const onCascadeCreate = useCallback(async () => {
    setIsCreating(true);

    const elementsPayload = convertElementsPayload(elements);
    const blob = await html2canvas(reactFlowRef.current, {
      backgroundColor: theme.palette.neutralLight,
    });
    const dataURL = blob.toDataURL();

    setLocalFormData((prev) => ({
      ...prev,
      raw_data: JSON.stringify(elements),
      cascade: {
        flow: JSON.stringify({
          ...elementsPayload,
        }),
        error: '',
      },
      screenshot: dataURL,
    }));

    setIsCreating(false);
  }, [elements, reactFlowRef]);

  const onValidationRedirect = useCallback(
    async (nextStep: PivotTabKey, currentStep: PivotTabKey) => {
      const nextStepIdx = STEP_ORDER.findIndex((step) => step === nextStep);
      const currentStepIdx = STEP_ORDER.findIndex((step) => step === currentStep);

      if (nextStepIdx > currentStepIdx) {
        const isInvalid = onFormDateValidate(nextStep, currentStep);

        if (isInvalid) return;
      }

      if (currentStep === 'cascade') await onCascadeCreate();

      onLinkClick(nextStep);
    },
    [onLinkClick, onFormDateValidate, onCascadeCreate],
  );

  return (
    <>
      <Stack horizontal verticalAlign="center">
        <Pivot
          onLinkClick={(item) => onValidationRedirect(item?.props.itemKey as PivotTabKey, localPivotKey)}
          selectedKey={localPivotKey}
        >
          <PivotItem headerText="Basics" itemKey="basics" />
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
            headerText="Review + Update"
            itemKey="preview"
            style={{ height: '100%', position: 'relative' }}
          />
        </Pivot>
        {isCreating && <Spinner size={3} />}
      </Stack>
      <Stack styles={{ root: scrllStackClasses.root }}>
        <Switch>
          <Route
            exact
            path={Url.AI_SKILL_EDIT_PREVIEW}
            render={() => <Preview localFormData={localFormData} onLinkClick={onLinkClick} />}
          />
          <Route
            exact
            path={Url.AI_SKILL_EDIT_TAG}
            render={() => (
              <TagTab tagList={localFormData.tag_list} onTagChange={onTagChange} onTagDelete={onTagDelete} />
            )}
          />
          <Route
            exact
            path={Url.AI_SKILL_EDIT_CASCADE}
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
                hasUseAiSkill={!!hasAiSkillDeployment}
              />
            )}
          />
          <Route
            exact
            path={Url.AI_SKILL_EDIT_BASIC}
            render={() => <Basics localFormData={localFormData} />}
          />
        </Switch>
      </Stack>
      <EditFooter
        aiSkillId={id}
        currentStep={localPivotKey}
        onLinkClick={onLinkClick}
        localFormData={localFormData}
        isCreating={isCreating}
        onCreatingChange={(value: boolean) => setIsCreating(value)}
        stepList={['basics', 'cascade', 'tag', 'preview']}
        onValidationRedirect={onValidationRedirect}
        hasUseAiSkill={!!hasAiSkillDeployment}
      />
    </>
  );
};

export default AiSkillEdit;
