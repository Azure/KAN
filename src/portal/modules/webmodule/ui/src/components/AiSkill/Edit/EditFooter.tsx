// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton, MessageBar, MessageBarType } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { getFooterClasses } from '../../Common/styles';
import { PivotTabKey, UpdateAiSkillFormData } from '../types';
import { getStepKey } from '../../utils';
import { updateAiSkill } from '../../../store/cascadeSlice';
import { UpdateAiSkillPayload } from '../../../store/types';
import { getFilteredTagList } from '../../Common/TagTab';
import { Url } from '../../../constant';

interface Props {
  aiSkillId: string;
  currentStep: PivotTabKey;
  onLinkClick: (key: PivotTabKey) => void;
  localFormData: UpdateAiSkillFormData;
  stepList: PivotTabKey[];
  onFormDateValidate: (key: PivotTabKey) => boolean;
  isCreating: boolean;
  onCreatingChange: (value: boolean) => void;
  onFormDataChange: (formData: UpdateAiSkillFormData) => void;
  onCascadeValidate: (key: PivotTabKey) => void;
  hasUseAiSkill?: boolean;
}

const EditFooter = (props: Props) => {
  const {
    currentStep,
    onLinkClick,
    stepList,
    localFormData,
    onFormDateValidate,
    onFormDataChange,
    onCreatingChange,
    isCreating,
    aiSkillId,
    onCascadeValidate,
    hasUseAiSkill,
  } = props;

  const classes = getFooterClasses();
  const dispatch = useDispatch();
  const history = useHistory();
  const isWarningDisplay = currentStep === 'preview' && hasUseAiSkill

  const onUpdateClick = useCallback(async () => {
    if (onFormDateValidate(currentStep)) return;
    if (localFormData.cascade.flow === '' && localFormData.raw_data === '') {
      onFormDataChange({
        ...localFormData,
        cascade: { ...localFormData.cascade, error: 'Please click Next or Review+Create to save the canvas' },
      });
      return;
    }

    onCreatingChange(true);
    const payload: UpdateAiSkillPayload = {
      id: +aiSkillId,
      body: {
        raw_data: localFormData.raw_data,
        flow: localFormData.cascade.flow,
        screenshot: localFormData.screenshot,
        tag_list:
          getFilteredTagList(localFormData.tag_list).length !== 0
            ? JSON.stringify(
                getFilteredTagList(localFormData.tag_list).map((tag) => ({
                  name: tag.name,
                  value: tag.value,
                })),
              )
            : '',
      },
    };

    await dispatch(updateAiSkill(payload));
    history.push(Url.AI_SKILL);
  }, [
    onFormDateValidate,
    onFormDataChange,
    localFormData,
    currentStep,
    aiSkillId,
    dispatch,
    history,
    onCreatingChange,
  ]);

  const onValidationRedirect = useCallback(
    (key: PivotTabKey) => {
      if (onFormDateValidate(currentStep)) return;

      onLinkClick(key);
    },
    [onLinkClick, onFormDateValidate, currentStep],
  );

  return (
    <Stack
      styles={{
        root: isWarningDisplay ? classes.warningFooter : classes.root,
      }}
    >
      {isWarningDisplay && (
        <MessageBar
          messageBarType={MessageBarType.warning}
          messageBarIconProps={{ iconName: 'IncidentTriangle' }}
          styles={{ icon: { color: '#DB7500' } }}
        >
          Warning! This skill is referenced in at least one deployment. Changing this skill will modify your
          deployments that have a reference to this skill. Do you want to continue?
        </MessageBar>
      )}
      <Stack horizontal tokens={{ childrenGap: 8 }}>
        {currentStep === 'cascade' && (
          <PrimaryButton
            text="Review + Update"
            onClick={() => onCascadeValidate('preview')}
            disabled={isCreating}
          />
        )}
        {currentStep === 'tag' && (
          <PrimaryButton text="Review + Update" onClick={() => onLinkClick('preview')} />
        )}
        {currentStep === 'preview' && (
          <PrimaryButton text="Update" onClick={onUpdateClick} disabled={isCreating} />
        )}
        {['cascade', 'tag', 'preview'].includes(currentStep) && (
          <DefaultButton
            text="Previous"
            styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
            iconProps={{ iconName: 'ChevronLeft' }}
            onClick={() => onLinkClick(getStepKey(currentStep, stepList, -1))}
            disabled={isCreating}
          />
        )}
        {currentStep === 'basics' && (
          <DefaultButton
            text="Next"
            styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
            iconProps={{ iconName: 'ChevronRight' }}
            onClick={() => onLinkClick(getStepKey(currentStep, stepList, 1))}
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
        {currentStep === 'tag' && (
          <DefaultButton
            text="Next"
            styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
            iconProps={{ iconName: 'ChevronRight' }}
            onClick={() => onValidationRedirect(getStepKey(currentStep, stepList, 1))}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default EditFooter;
