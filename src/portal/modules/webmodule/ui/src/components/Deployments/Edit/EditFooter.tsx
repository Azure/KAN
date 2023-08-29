// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton } from '@fluentui/react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { getFooterClasses } from '../../Common/styles';
import { PivotTabKey, UpdateDeploymentFormData } from '../types';
import { getStepKey } from '../../utils';
import { updateDeployment } from '../../../store/deploymentSlice';
import { UpdateDeploymentPayload, DeploymentConfigureSkill } from '../../../store/types';
import { getFilteredTagList } from '../../Common/TagTab';
import { Url } from '../../../constant';

interface Props {
  deploymentId: number;
  symphony_id: string;
  currentStep: PivotTabKey;
  onLinkClick: (key: PivotTabKey) => void;
  localFormData: UpdateDeploymentFormData;
  stepList: PivotTabKey[];
  onValidationRedirect: (nextStep: PivotTabKey, currentStep: PivotTabKey) => void;
}

const EditFooter = (props: Props) => {
  const { currentStep, onLinkClick, stepList, localFormData, deploymentId, onValidationRedirect, symphony_id } =
    props;

  const classes = getFooterClasses();
  const dispatch = useDispatch();
  const history = useHistory();

  const onUpdateClick = useCallback(async () => {
    const payload: UpdateDeploymentPayload = {
      id: deploymentId,
      symphony_id,
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
  }, [localFormData, dispatch, history, deploymentId, symphony_id]);

  return (
    <Stack
      styles={{
        root: classes.root,
      }}
    >
      <Stack horizontal tokens={{ childrenGap: 8 }}>
        {['configure', 'tag'].includes(currentStep) && (
          <PrimaryButton
            text="Review + Update"
            onClick={() => onValidationRedirect('preview', currentStep)}
          />
        )}
        {currentStep === 'preview' && <PrimaryButton text="Update" onClick={onUpdateClick} />}
        {['configure', 'tag', 'preview'].includes(currentStep) && (
          <DefaultButton
            text="Previous"
            styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
            iconProps={{ iconName: 'ChevronLeft' }}
            onClick={() => onValidationRedirect(getStepKey(currentStep, stepList, -1), currentStep)}
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
            onClick={() => onValidationRedirect(getStepKey(currentStep, stepList, 1), currentStep)}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default EditFooter;
