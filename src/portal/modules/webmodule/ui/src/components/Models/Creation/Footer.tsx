// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { PivotTabKey, CreateModelFormData } from '../types';
import { getStepKey } from '../../utils';
import {
  createCustomVisionProject,
  addExistingCustomVisionProject,
} from '../../../store/trainingProjectSlice';
import { CreateCustomVisionModelPayload, AddExistingCustomVisionModelPayload } from '../../../store/types';
import { Url } from '../../../constant';
import { getFooterClasses } from '../../Common/styles';

interface Props {
  currentStep: PivotTabKey;
  onLinkClick: (key: PivotTabKey) => void;
  localFormData: CreateModelFormData;
  isCreating: boolean;
  onModelCreating: () => void;
  stepList: PivotTabKey[];
  onFormDateValidate: (key: PivotTabKey) => boolean;
}

const Footer = (props: Props) => {
  const {
    currentStep,
    onLinkClick,
    localFormData,
    isCreating,
    stepList,
    onFormDateValidate,
    onModelCreating,
  } = props;

  const classes = getFooterClasses();
  const dispatch = useDispatch();
  const history = useHistory();

  const onModelCreate = useCallback(
    async (payload: CreateCustomVisionModelPayload) => {
      await dispatch(createCustomVisionProject(payload));
    },
    [dispatch],
  );

  const onModelAdd = useCallback(
    async (payload: AddExistingCustomVisionModelPayload) => {
      await dispatch(addExistingCustomVisionProject(payload));
    },
    [dispatch],
  );

  const onCreateClick = useCallback(async () => {
    if (onFormDateValidate(currentStep)) return;

    onModelCreating();

    if (localFormData.createType === 'yes') {
      await onModelAdd({ customVisionId: localFormData.customVisionId });
    } else {
      await onModelCreate({
        name: localFormData.name,
        tags: localFormData.objects,
        project_type: localFormData.type,
        classification_type: localFormData.classification,
      });
    }

    history.push(Url.MODELS, {
      isCreated: true,
    });
  }, [localFormData, onModelAdd, onModelCreate, currentStep, history, onFormDateValidate, onModelCreating]);

  const onValidationRedirect = useCallback(
    (key: PivotTabKey) => {
      if (onFormDateValidate(currentStep)) return;

      onLinkClick(key);
    },
    [onLinkClick, onFormDateValidate, currentStep],
  );

  return (
    <Stack
      horizontal
      tokens={{ childrenGap: 8 }}
      styles={{
        root: classes.root,
      }}
    >
      {['basics', 'tag'].includes(currentStep) ? (
        <PrimaryButton text="Review + Create" onClick={() => onLinkClick('preview')} />
      ) : (
        <PrimaryButton text="Create" disabled={isCreating} onClick={onCreateClick} />
      )}
      {['tag', 'preview'].includes(currentStep) && (
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
    </Stack>
  );
};

export default Footer;
