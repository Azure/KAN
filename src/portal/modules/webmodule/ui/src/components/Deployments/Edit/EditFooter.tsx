// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { getFooterClasses } from '../../Common/styles';
import { PivotTabKey, UpdateDeploymentFormData } from '../types';
import { getStepKey } from '../../utils';
import { updateDeployment } from '../../../store/deploymentSlice';
import { UpdateDeploymentPayload, DeploymentConfigureSkill } from '../../../store/types';
import { getFilteredTagList } from '../../Common/TagTab';
import { Url } from '../../../constant';

interface Props {
  deploymentId: string;
  currentStep: PivotTabKey;
  onLinkClick: (key: PivotTabKey) => void;
  localFormData: UpdateDeploymentFormData;
  stepList: PivotTabKey[];
  onFormDateValidate: (key: PivotTabKey) => boolean;
  // isUpdating: boolean;
  // onUpdatingChange: () => void;
}

const EditFooter = (props: Props) => {
  const { currentStep, onLinkClick, stepList, localFormData, onFormDateValidate, deploymentId } = props;

  const classes = getFooterClasses();
  const dispatch = useDispatch();
  const history = useHistory();

  const onUpdateClick = useCallback(async () => {
    const payload: UpdateDeploymentPayload = {
      id: +deploymentId,
      body: {
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
      },
    };

    await dispatch(updateDeployment(payload));
    history.push(Url.DEPLOYMENT);
  }, [localFormData, dispatch, history, deploymentId]);

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
        <PrimaryButton text="Review + Update" onClick={() => onLinkClick('preview')} />
      )}
      {currentStep === 'preview' && (
        <PrimaryButton
          text="Update"
          onClick={onUpdateClick}
          // disabled={isCreating}
        />
      )}
      {['configure', 'tag', 'preview'].includes(currentStep) && (
        <DefaultButton
          text="Previous"
          styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
          iconProps={{ iconName: 'ChevronLeft' }}
          onClick={() => onLinkClick(getStepKey(currentStep, stepList, -1))}
        />
      )}
      {currentStep === 'basics' && (
        <DefaultButton
          text="Next"
          styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
          iconProps={{ iconName: 'ChevronRight' }}
          onClick={() => onLinkClick(getStepKey(currentStep, stepList, 1))}
        />
      )}
      {['configure', 'tag'].includes(currentStep) && (
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
