import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { PivotTabKey, CreateComputeDeviceFormData } from '../types';
import { createComputeDevice } from '../../../store/computeDeviceSlice';
import { Url } from '../../../constant';
import { getFilteredTagList } from '../../Common/TagPage';

interface Props {
  currentStep: PivotTabKey;
  onLinkClick: (key: PivotTabKey) => void;
  localFormData: CreateComputeDeviceFormData;
  isCreating: boolean;
  onCreatingChange: () => void;
  onValidationRedirect: (key: PivotTabKey) => void;
  stepList: PivotTabKey[];
  onFormDateValidate: () => boolean;
}

const isDisable = (localFormData: CreateComputeDeviceFormData) => {
  if (Object.values(localFormData.error).some((error) => !!error)) return true;
  if (getFilteredTagList(localFormData.tag_list).some((tag) => !!tag.errorMessage)) return true;
  return false;
};

const getStepKey = (currentStep: PivotTabKey, stepList: PivotTabKey[], step: number) => {
  if (stepList[0] === currentStep && step === -1) return currentStep;
  if (stepList[stepList.length - 1] === currentStep && step === 1) return currentStep;

  const currentIdx = stepList.findIndex((step) => step === currentStep);

  return stepList[currentIdx + step];
};

const Footer = (props: Props) => {
  const {
    currentStep,
    onValidationRedirect,
    localFormData,
    isCreating,
    onCreatingChange,
    onLinkClick,
    stepList,
    onFormDateValidate,
  } = props;

  const dispatch = useDispatch();
  const history = useHistory();

  const isCreateDisable = isDisable(localFormData);

  const onCreateClick = useCallback(() => {
    if (onFormDateValidate()) return;

    dispatch(
      createComputeDevice({
        name: localFormData.name,
        iothub: localFormData.iotHub,
        iotedge_device: localFormData.iotedge_device,
        architecture: localFormData.architecture,
        acceleration: localFormData.acceleration,
        tag_list:
          localFormData.tag_list.length === 0
            ? JSON.stringify(
                getFilteredTagList(localFormData.tag_list).map((tag) => ({
                  name: tag.name,
                  value: tag.value,
                })),
              )
            : '',
      }),
    );

    history.push(Url.COMPUTE_DEVICE);
  }, [history, localFormData, dispatch, onFormDateValidate]);

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
        <PrimaryButton text="Create" onClick={onCreateClick} disabled={isCreateDisable || isCreating} />
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
