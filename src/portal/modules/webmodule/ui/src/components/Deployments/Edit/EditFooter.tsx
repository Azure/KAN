// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton, MessageBar, MessageBarType } from '@fluentui/react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { selectAllComputeDevices } from '../../../store/computeDeviceSlice';
import { getFooterClasses } from '../../Common/styles';
import { PivotTabKey, UpdateDeploymentFormData } from '../types';
import { getStepKey } from '../../utils';
import { updateDeployment } from '../../../store/deploymentSlice';
import { UpdateDeploymentPayload, DeploymentConfigureSkill } from '../../../store/types';
import { getFilteredTagList } from '../../Common/TagTab';
import { Url } from '../../../constant';

interface Props {
  deploymentId: number;
  kan_id: string;
  currentStep: PivotTabKey;
  onLinkClick: (key: PivotTabKey) => void;
  localFormData: UpdateDeploymentFormData;
  stepList: PivotTabKey[];
  onValidationRedirect: (nextStep: PivotTabKey, currentStep: PivotTabKey) => void;
}

const EditFooter = (props: Props) => {
  const { currentStep, onLinkClick, stepList, localFormData, deploymentId, onValidationRedirect, kan_id } =
    props;

  const classes = getFooterClasses();
  const dispatch = useDispatch();
  const history = useHistory();

  const deviceList = useSelector((state: RootState) => selectAllComputeDevices(state));

  const isWarningDisplay =
    (currentStep === 'configure' &&
      deviceList.find((_device) => _device.kan_id === localFormData.device.key)?.is_k8s) ??
    false;

  const onUpdateClick = useCallback(async () => {
    const payload: UpdateDeploymentPayload = {
      id: deploymentId,
      kan_id,
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
  }, [localFormData, dispatch, history, deploymentId, kan_id]);

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
