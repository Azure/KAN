// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { PivotTabKey, UpdateCameraFormData } from '../types';
import { updateCamera } from '../../../store/cameraSlice';
import { Url } from '../../../constant';
import { getStepKey } from '../../utils';
import { getFilteredTagList } from '../../Common/TagTab';
import { getFooterClasses } from '../../Common/styles';

interface Props {
  cameraId: number;
  currentStep: PivotTabKey;
  onLinkClick: (key: PivotTabKey) => void;
  localFormData: UpdateCameraFormData;
  isUpdating: boolean;
  onUpdating: () => void;
  stepList: PivotTabKey[];
  onFormDateValidate: (key: PivotTabKey) => boolean;
}

const Footer = (props: Props) => {
  const {
    cameraId,
    currentStep,
    onLinkClick,
    localFormData,
    isUpdating,
    onUpdating,
    stepList,
    onFormDateValidate,
  } = props;

  const classes = getFooterClasses();
  const dispatch = useDispatch();
  const history = useHistory();

  const onValidationRedirect = useCallback(
    (key: PivotTabKey) => {
      if (onFormDateValidate(currentStep)) return;

      onLinkClick(key);
    },
    [onLinkClick, onFormDateValidate, currentStep],
  );

  const onRtspCameraUpdate = useCallback(async () => {
    await dispatch(
      updateCamera({
        id: cameraId,
        body: {
          location: localFormData.location,
          username: localFormData.userName,
          password: localFormData.password,
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
  }, [dispatch, localFormData, cameraId]);

  const onMediaSourceUpdate = useCallback(async () => {
    console.log('onMediaSourceUpdate');
  }, []);

  const onUpdateClick = useCallback(async () => {
    if (onFormDateValidate(currentStep)) return;

    onUpdating();

    await onRtspCameraUpdate();

    history.push(Url.CAMERAS);
  }, [history, onUpdating, onFormDateValidate, currentStep, onRtspCameraUpdate]);

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
        <PrimaryButton text="Update" onClick={onUpdateClick} disabled={isUpdating} />
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

export default Footer;
