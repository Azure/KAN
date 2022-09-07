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
  isCreating: boolean;
  onCreatingChange: (value: boolean) => void;
  onValidationRedirect: (nextStep: PivotTabKey, currentStep: PivotTabKey) => void;
  hasUseAiSkill?: boolean;
}

const EditFooter = (props: Props) => {
  const {
    currentStep,
    onLinkClick,
    stepList,
    localFormData,
    // onFormDateValidate,
    // onFormDataChange,
    onCreatingChange,
    isCreating,
    aiSkillId,
    // onCascadeValidate,
    onValidationRedirect,
    hasUseAiSkill,
  } = props;

  const classes = getFooterClasses();
  const dispatch = useDispatch();
  const history = useHistory();
  const isWarningDisplay = currentStep === 'preview' && hasUseAiSkill;

  const onUpdateClick = useCallback(async () => {
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
  }, [localFormData, aiSkillId, dispatch, history, onCreatingChange]);

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
            onClick={() => onValidationRedirect('preview', currentStep)}
            disabled={isCreating}
          />
        )}
        {currentStep === 'tag' && (
          <PrimaryButton
            text="Review + Update"
            onClick={() => onValidationRedirect('preview', currentStep)}
          />
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
        {['basics', 'cascade', 'tag'].includes(currentStep) && (
          <DefaultButton
            text="Next"
            styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
            iconProps={{ iconName: 'ChevronRight' }}
            onClick={() => onValidationRedirect(getStepKey(currentStep, stepList, 1), currentStep)}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default EditFooter;
