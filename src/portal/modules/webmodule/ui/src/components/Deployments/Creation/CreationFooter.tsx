// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

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
}

const Footer = (props: Props) => {
  const { currentStep, onLinkClick, localFormData, isCreating, stepList, onFormDateValidate } = props;

  const dispatch = useDispatch();
  const history = useHistory();
  const classes = getFooterClasses();

  // console.log(
  //   'onFormDateValidate(getStepKey(currentStep, stepList, 0))',
  //   onFormDateValidate(getStepKey(currentStep, stepList, 0)),
  // );

  const onCreateClick = useCallback(async () => {
    if (onFormDateValidate(currentStep)) return;

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

    dispatch(createDeployment(payload));

    history.push(Url.DEPLOYMENT, {
      isCreated: true,
    });
  }, [localFormData, history, onFormDateValidate, currentStep, dispatch]);

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
      {['configure', 'tag'].includes(currentStep) && (
        <PrimaryButton
          text="Review + Deploy"
          onClick={() => onLinkClick('preview')}
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
          onClick={() => onValidationRedirect(getStepKey(currentStep, stepList, 1))}
        />
      )}
    </Stack>
  );
};

export default Footer;
