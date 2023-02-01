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
import { getCascadeErrorMessage, convertElementsPayload } from '../utils';
import { getFooterClasses } from '../../Common/styles';

interface Props {
  currentStep: PivotTabKey;
  onLinkClick: (key: PivotTabKey) => void;
  localFormData: CreateAISkillFormData;
  isCreating: boolean;
  onCreatingChange: (value: boolean) => void;
  stepList: PivotTabKey[];
  onValidationRedirect: (nextStep: PivotTabKey, currentStep: PivotTabKey) => void;
}

const CreationFooter = (props: Props) => {
  const {
    currentStep,
    localFormData,
    isCreating,
    onCreatingChange,
    onLinkClick,
    stepList,
    onValidationRedirect,
  } = props;

  const classes = getFooterClasses();
  const dispatch = useDispatch();
  const history = useHistory();

  const onCreateClick = useCallback(async () => {
    onCreatingChange(true);

    await dispatch(
      createAiSkill({
        name: localFormData.name,
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
  }, [localFormData, dispatch, history, onCreatingChange]);

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
          onClick={() => onValidationRedirect('preview', currentStep)}
          disabled={
            localFormData.tag_list.length === 0 ||
            localFormData.tag_list.some((tag) => tag.errorMessage !== '')
          }
        />
      )}
      {currentStep === 'tag' && (
        <PrimaryButton text="Review + Create" onClick={() => onValidationRedirect('preview', currentStep)} />
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
      {['basics', 'cascade', 'tag'].includes(currentStep) && (
        <DefaultButton
          text="Next"
          styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
          iconProps={{ iconName: 'ChevronRight' }}
          onClick={() => onValidationRedirect(getStepKey(currentStep, stepList, 1), currentStep)}
        />
      )}
    </Stack>
  );
};

export default CreationFooter;
