// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { PivotTabKey, UpdateComputeDeviceFromData } from '../types';
import { updateComputeDevice } from '../../../store/computeDeviceSlice';
import { Url } from '../../../constant';
import { getFilteredTagList } from '../../Common/TagTab';
import { getStepKey } from '../../utils';
import { getFooterClasses } from '../../Common/styles';

interface Props {
  id: number;
  symphony_id: string;
  currentStep: PivotTabKey;
  onLinkClick: (key: PivotTabKey) => void;
  localFormData: UpdateComputeDeviceFromData;
  isCreating: boolean;
  onIsCreatingChange: () => void;
  onValidationRedirect: (key: PivotTabKey) => void;
  stepList: PivotTabKey[];
  onFormDateValidate: (key: PivotTabKey) => boolean;
}

const EditFooter = (props: Props) => {
  const {
    id,
    symphony_id,
    currentStep,
    onValidationRedirect,
    localFormData,
    isCreating,
    onIsCreatingChange,
    onLinkClick,
    stepList,
    onFormDateValidate,
  } = props;

  const classes = getFooterClasses();
  const dispatch = useDispatch();
  const history = useHistory();

  const onUpdateClick = useCallback(async () => {
    if (onFormDateValidate(currentStep)) return;

    onIsCreatingChange();

    await dispatch(
      updateComputeDevice({
        id,
        symphony_id,
        body: {
          architecture: localFormData.architecture,
          acceleration: localFormData.acceleration,
          cluster_type: localFormData.cluster_type,
          is_k8s: localFormData.is_k8s,
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
      }),
    );

    history.push(Url.COMPUTE_DEVICE);
  }, [
    history,
    localFormData,
    dispatch,
    onFormDateValidate,
    currentStep,
    onIsCreatingChange,
    id,
    symphony_id,
  ]);

  return (
    <Stack
      horizontal
      tokens={{ childrenGap: 8 }}
      styles={{
        root: classes.root,
      }}
    >
      {['basics', 'tag'].includes(currentStep) ? (
        <PrimaryButton text="Review + Update" onClick={() => onLinkClick('preview')} />
      ) : (
        <PrimaryButton text="Update" onClick={onUpdateClick} disabled={isCreating} />
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
          onClick={() => onLinkClick(getStepKey(currentStep, stepList, -1))}
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

export default EditFooter;
