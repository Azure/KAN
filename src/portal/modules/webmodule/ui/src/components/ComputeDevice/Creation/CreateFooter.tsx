// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { PivotTabKey, CreateComputeDeviceFormData } from '../types';
import { createComputeDevice } from '../../../store/computeDeviceSlice';
import { Url } from '../../../constant';
import { getFilteredTagList } from '../../Common/TagTab';
import { getStepKey } from '../../utils';
import { getFooterClasses } from '../../Common/styles';

interface Props {
  currentStep: PivotTabKey;
  localFormData: CreateComputeDeviceFormData;
  isCreating: boolean;
  onIsCreatingChange: () => void;
  stepList: PivotTabKey[];
  onFormDateValidate: (key: PivotTabKey) => boolean;
  onValidationRedirect: (key: PivotTabKey) => void;
}

const CreationFooter = (props: Props) => {
  const {
    currentStep,
    onValidationRedirect,
    localFormData,
    isCreating,
    onIsCreatingChange,
    stepList,
    onFormDateValidate,
  } = props;

  const classes = getFooterClasses();
  const dispatch = useDispatch();
  const history = useHistory();

  const onCreateClick = useCallback(async () => {
    if (onFormDateValidate(currentStep)) return;

    onIsCreatingChange();

    await dispatch(
      createComputeDevice({
        name: localFormData.name,
        iothub: localFormData.iothub,
        iotedge_device: localFormData.iotedge_device,
        architecture: localFormData.architecture,
        acceleration: localFormData.acceleration,
        cluster_type: localFormData.cluster_type,
        is_k8s: localFormData.is_k8s,
        config_data: localFormData.config_data,
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

    history.push(Url.COMPUTE_DEVICE, {
      isCreated: true,
    });
  }, [history, localFormData, dispatch, onFormDateValidate, currentStep, onIsCreatingChange]);

  return (
    <Stack
      horizontal
      tokens={{ childrenGap: 8 }}
      styles={{
        root: classes.root,
      }}
    >
      {['basics', 'tag'].includes(currentStep) ? (
        <PrimaryButton text="Review + Create" onClick={() => onValidationRedirect('preview')} />
      ) : (
        <PrimaryButton text="Create" onClick={onCreateClick} disabled={isCreating} />
      )}
      {currentStep === 'basics' && (
        <DefaultButton
          text="Next"
          styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
          iconProps={{ iconName: 'ChevronRight' }}
          onClick={() => onValidationRedirect(getStepKey(currentStep, stepList, 1))}
        />
      )}
      {['tag', 'preview'].includes(currentStep) && (
        <DefaultButton
          text="Previous"
          styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
          iconProps={{ iconName: 'ChevronLeft' }}
          onClick={() => onValidationRedirect(getStepKey(currentStep, stepList, -1))}
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
  );
};

export default CreationFooter;
