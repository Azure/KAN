// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton, MessageBar, MessageBarType } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { State as RootState } from 'RootStateType';
import { selectAllComputeDevices } from '../../../store/computeDeviceSlice';
import { PivotTabKey, CreateDeploymentFormData } from '../types';
import { getStepKey } from '../../utils';
import { createDeployment } from '../../../store/deploymentSlice';
import { CreateDeploymentPayload, DeploymentConfigureSkill } from '../../../store/types';
import { getFilteredTagList } from '../../Common/TagTab';
import { Url } from '../../../constant';
import { getFooterClasses } from '../../Common/styles';

interface Props {
  currentStep: PivotTabKey;
  onLinkClick: (key: PivotTabKey) => void;
  localFormData: CreateDeploymentFormData;
  isCreating: boolean;
  onIsCreatingChange: () => void;
  stepList: PivotTabKey[];
  onFormDateValidate: (key: PivotTabKey) => boolean;
  onValidationRedirect: (nextStep: PivotTabKey, currentStep: PivotTabKey) => void;
}

const CreationFooter = (props: Props) => {
  const {
    currentStep,
    onLinkClick,
    localFormData,
    isCreating,
    onIsCreatingChange,
    stepList,
    onFormDateValidate,
    onValidationRedirect,
  } = props;

  const deviceList = useSelector((state: RootState) => selectAllComputeDevices(state));

  const dispatch = useDispatch();
  const history = useHistory();
  const classes = getFooterClasses();
  const isWarningDisplay =
    (currentStep === 'configure' &&
      deviceList.find((_device) => _device.symphony_id === localFormData.device.key)?.is_k8s) ??
    false;

  const onCreateClick = useCallback(async () => {
    if (onFormDateValidate(currentStep)) return;

    onIsCreatingChange();

    const payload: CreateDeploymentPayload = {
      name: localFormData.name,
      compute_device: localFormData.device.key,
      configure: JSON.stringify(
        localFormData.cameraList.map((configureCamera) => {
          const configuredSkillList = configureCamera.skillList.map((configureSkill) => ({
            id: configureSkill.id,
            configured: configureSkill.configured,
          })) as DeploymentConfigureSkill[];

          return { camera: configureCamera.camera, skills: configuredSkillList };
        }),
      ),
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

    await dispatch(createDeployment(payload));

    history.push(Url.DEPLOYMENT, {
      isCreated: true,
    });
  }, [localFormData, history, onFormDateValidate, currentStep, dispatch, onIsCreatingChange]);

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
          Your AI Skill has some nodes that are not configurable on Kubernetes based Targets (IoThub Export)
          so AI Skill configuration may not succeed.
        </MessageBar>
      )}
      <Stack horizontal tokens={{ childrenGap: 8 }}>
        {['configure', 'tag'].includes(currentStep) && (
          <PrimaryButton
            text="Review + Deploy"
            onClick={() => onValidationRedirect('preview', currentStep)}
            disabled={
              localFormData.cameraList.length === 0 ||
              localFormData.cameraList.some((camera) => camera.skillList.length === 0)
            }
          />
        )}
        {currentStep === 'preview' && (
          <PrimaryButton text="Deploy" onClick={onCreateClick} disabled={isCreating} />
        )}
        {['configure', 'tag', 'preview'].includes(currentStep) && (
          <DefaultButton
            text="Previous"
            styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
            iconProps={{ iconName: 'ChevronLeft' }}
            onClick={() => onLinkClick(getStepKey(currentStep, stepList, -1))}
          />
        )}
        {['basics', 'configure', 'tag'].includes(currentStep) && (
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

export default CreationFooter;
