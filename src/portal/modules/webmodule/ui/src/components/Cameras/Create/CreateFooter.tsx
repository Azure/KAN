// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { PivotTabKey, CreateCameraFormData, MediaType } from '../types';
import { postRTSPCamera, postMediaSourceCamera } from '../../../store/cameraSlice';
import { Url } from '../../../constant';
import { thunkUpdateCameraSetting } from '../../../store/cameraSetting/cameraSettingActions';
import { getStepKey } from '../../utils';
import { getFilteredTagList } from '../../Common/TagTab';
import { getFooterClasses } from '../../Common/styles';

interface Props {
  currentStep: PivotTabKey;
  localFormData: CreateCameraFormData;
  isCreating: boolean;
  onIsCreatingChange: () => void;
  stepList: PivotTabKey[];
  onFormDateValidate: (key: PivotTabKey) => boolean;
  onValidationRedirect: (key: PivotTabKey) => void;
}

type CommonPayload = {
  name: string;
  location: number;
  media_type: MediaType;
  tag_list: string;
};

const Footer = (props: Props) => {
  const {
    currentStep,
    localFormData,
    isCreating,
    onIsCreatingChange,
    stepList,
    onFormDateValidate,
    onValidationRedirect,
  } = props;

  const classes = getFooterClasses();
  const dispatch = useDispatch();
  const history = useHistory();

  const onRtspCameraCreate = useCallback(
    async (payload: CommonPayload) => {
      await dispatch(
        postRTSPCamera({
          ...payload,
          rtsp: localFormData.rtsp,
          username: localFormData.userName,
          password: localFormData.password,
          allowed_devices: JSON.stringify(localFormData.selectedDeviceList.map((device) => device.data)),
        }),
      );
    },
    [dispatch, localFormData],
  );

  const onMediaSourceCreate = useCallback(
    async (payload: CommonPayload) => {
      await dispatch(
        postMediaSourceCamera({
          ...payload,
          media_source: localFormData.media_source,
        }),
      );
      await dispatch(thunkUpdateCameraSetting());
    },
    [dispatch, localFormData],
  );

  const onCreateClick = useCallback(async () => {
    if (onFormDateValidate(currentStep)) return;

    onIsCreatingChange();

    const payload: CommonPayload = {
      name: localFormData.name,
      location: localFormData.location,
      media_type: localFormData.media_type,
      tag_list:
        getFilteredTagList(localFormData.tag_list).length !== 0
          ? JSON.stringify(
              getFilteredTagList(localFormData.tag_list).map((tag) => ({
                name: tag.name,
                value: tag.value,
              })),
            )
          : '',
    };

    if (localFormData.media_type === 'Camera') {
      await onRtspCameraCreate(payload);
    } else {
      await onMediaSourceCreate(payload);
    }

    history.push(Url.CAMERAS, {
      isCreated: true,
    });
  }, [
    onRtspCameraCreate,
    onMediaSourceCreate,
    localFormData,
    history,
    onIsCreatingChange,
    onFormDateValidate,
    currentStep,
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

export default Footer;
