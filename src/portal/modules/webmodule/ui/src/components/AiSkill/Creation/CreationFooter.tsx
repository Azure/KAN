// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Node, Edge } from 'react-flow-renderer';
import html2canvas from 'html2canvas';

import { PivotTabKey, CreateAISkillFormData } from '../types';
import { createAiSkill } from '../../../store/cascadeSlice';
import { theme, Url } from '../../../constant';
import { getFilteredTagList } from '../../Common/TagTab';
import { getStepKey } from '../../utils';
import { isCascadeError, convertElementsPayload } from '../utils';
import { getFooterClasses } from '../../Common/styles';

interface Props {
  currentStep: PivotTabKey;
  onLinkClick: (key: PivotTabKey) => void;
  localFormData: CreateAISkillFormData;
  isCreating: boolean;
  onCreatingChange: (value: boolean) => void;
  stepList: PivotTabKey[];
  onFormDateValidate: (key: PivotTabKey) => boolean;
  elements: (Node | Edge)[];
  onFormDataChange: (formData: CreateAISkillFormData) => void;
  reactFlowRef: React.MutableRefObject<any>;
}

const CreationFooter = (props: Props) => {
  const {
    currentStep,
    localFormData,
    isCreating,
    onCreatingChange,
    onLinkClick,
    stepList,
    onFormDateValidate,
    elements,
    onFormDataChange,
    reactFlowRef,
  } = props;

  const classes = getFooterClasses();
  const dispatch = useDispatch();
  const history = useHistory();

  const onCreateClick = useCallback(async () => {
    if (onFormDateValidate(currentStep)) return;
    if (localFormData.cascade.flow === '' && localFormData.raw_data === '') {
      onFormDataChange({
        ...localFormData,
        cascade: { ...localFormData.cascade, error: 'Please click Next or Review+Create to save the canvas' },
      });
      return;
    }

    onCreatingChange(true);
    await dispatch(
      createAiSkill({
        name: localFormData.name,
        raw_data: localFormData.raw_data,
        flow: localFormData.cascade.flow,
        screenshot: localFormData.screenshot,
        fps: localFormData.fps.toString(),
        acceleration: localFormData.acceleration,
        tag_list:
          getFilteredTagList(localFormData.tag_list).length !== 0
            ? JSON.stringify(
                getFilteredTagList(localFormData.tag_list).map((tag) => ({
                  name: tag.name,
                  value: tag.value,
                })),
              )
            : '',
      }),
    );

    history.push(Url.AI_SKILL, {
      isCreated: true,
    });
  }, [localFormData, dispatch, currentStep, history, onFormDateValidate, onCreatingChange, onFormDataChange]);

  const onValidationRedirect = useCallback(
    (key: PivotTabKey) => {
      if (onFormDateValidate(currentStep)) return;

      onLinkClick(key);
    },
    [onLinkClick, onFormDateValidate, currentStep],
  );

  const onCascadeValidate = useCallback(
    async (key: PivotTabKey) => {
      const error = isCascadeError(elements);
      if (isCascadeError(elements)) {
        onFormDataChange({ ...localFormData, cascade: { ...localFormData.cascade, error } });
        return;
      }

      onCreatingChange(true);

      const elementsPayload = convertElementsPayload(elements);
      const blob = await html2canvas(reactFlowRef.current, {
        backgroundColor: theme.palette.neutralLight,
      });
      const dataURL = blob.toDataURL();

      onFormDataChange({
        ...localFormData,
        raw_data: JSON.stringify(elements),
        cascade: {
          flow: JSON.stringify({
            ...elementsPayload,
          }),
          error: '',
        },
        screenshot: dataURL,
      });

      onCreatingChange(false);
      onLinkClick(key);
    },
    [onLinkClick, elements, localFormData, onFormDataChange, reactFlowRef, onCreatingChange],
  );

  return (
    <Stack
      horizontal
      tokens={{ childrenGap: 8 }}
      styles={{
        root: classes.root,
      }}
    >
      {currentStep === 'cascade' && (
        <PrimaryButton
          text="Review + Create"
          onClick={() => onCascadeValidate('preview')}
          disabled={
            localFormData.tag_list.length === 0 ||
            localFormData.tag_list.some((tag) => tag.errorMessage !== '')
          }
        />
      )}
      {currentStep === 'tag' && (
        <PrimaryButton text="Review + Create" onClick={() => onLinkClick('preview')} />
      )}
      {currentStep === 'preview' && (
        <PrimaryButton text="Create" onClick={onCreateClick} disabled={isCreating} />
      )}
      {['cascade', 'tag', 'preview'].includes(currentStep) && (
        <DefaultButton
          text="Previous"
          styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
          iconProps={{ iconName: 'ChevronLeft' }}
          onClick={() => onLinkClick(getStepKey(currentStep, stepList, -1))}
        />
      )}
      {['basics', 'tag'].includes(currentStep) && (
        <DefaultButton
          text="Next"
          styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
          iconProps={{ iconName: 'ChevronRight' }}
          onClick={() => onValidationRedirect(getStepKey(currentStep, stepList, 1))}
        />
      )}
      {currentStep === 'cascade' && (
        <DefaultButton
          text="Next"
          styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
          iconProps={{ iconName: 'ChevronRight' }}
          onClick={() => onCascadeValidate('tag')}
          disabled={isCreating}
        />
      )}
    </Stack>
  );
};

export default CreationFooter;
