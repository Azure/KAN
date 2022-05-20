import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { PivotTabKey, CreateCameraFormData } from '../types';
import { postRTSPCamera, postMediaSourceCamera } from '../../../store/cameraSlice';
import { Url } from '../../../constant';
import { thunkUpdateCameraSetting } from '../../../store/cameraSetting/cameraSettingActions';
import { getStepKey } from '../../utils';

interface Props {
  currentStep: PivotTabKey;
  onLinkClick: (key: PivotTabKey) => void;
  localFormData: CreateCameraFormData;
  isCreating: boolean;
  onIsCreatingChange: () => void;
  stepList: PivotTabKey[];
  onFormDateValidate: (key: PivotTabKey) => boolean;
}

const Footer = (props: Props) => {
  const {
    currentStep,
    onLinkClick,
    localFormData,
    isCreating,
    onIsCreatingChange,
    stepList,
    onFormDateValidate,
  } = props;

  const dispatch = useDispatch();
  const history = useHistory();

  const onValidationRedirect = useCallback(
    (key: PivotTabKey) => {
      if (onFormDateValidate(currentStep)) return;

      onLinkClick(key);
    },
    [onLinkClick, onFormDateValidate, currentStep],
  );

  const onRtspCameraCreate = useCallback(async () => {
    await dispatch(
      postRTSPCamera({
        name: localFormData.name,
        rtsp: localFormData.rtsp,
        location: localFormData.location,
        media_type: localFormData.media_type,
      }),
    );
  }, [dispatch, localFormData]);

  const onMediaSourceCreate = useCallback(async () => {
    await dispatch(
      postMediaSourceCamera({
        name: localFormData.name,
        media_source: localFormData.media_source,
        location: localFormData.location,
        media_type: localFormData.media_type,
      }),
    );
    await dispatch(thunkUpdateCameraSetting());
  }, [dispatch, localFormData]);

  const onCreateClick = useCallback(async () => {
    if (onFormDateValidate(currentStep)) return;

    onIsCreatingChange();

    if (localFormData.media_type === 'Camera') {
      await onRtspCameraCreate();
    } else {
      await onMediaSourceCreate();
    }

    history.push(Url.CAMERAS2);
  }, [
    onRtspCameraCreate,
    onMediaSourceCreate,
    localFormData.media_type,
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
        root: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          padding: '15px',
          borderTop: '1px solid rgba(204,204,204,0.8)',
          width: '100%',
        },
      }}
    >
      {['basics', 'tag'].includes(currentStep) ? (
        <PrimaryButton text="Review + Create" onClick={() => onLinkClick('preview')} />
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
          onClick={() => onLinkClick(getStepKey(currentStep, stepList, -1))}
        />
      )}
    </Stack>
  );
};

export default Footer;
