// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useHistory, generatePath } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Stack,
  ICommandBarItemProps,
  CommandBar,
  Label,
  IChoiceGroupOption,
  ChoiceGroup,
  IconButton,
  SearchBox,
  DefaultButton,
  MessageBar,
  MessageBarType,
} from '@fluentui/react';
import { isEmpty } from 'ramda';

import { State as RootState } from 'RootStateType';
import { Url } from '../../constant';
import { commonCommandBarItems } from '../utils';
import { selectDeploymentById } from '../../store/deploymentSlice';
import { selectAllCameras, Camera } from '../../store/cameraSlice';
import { selectAiSkillByKanIdSelectorFactory } from '../../store/cascadeSlice';
import { wrapperPadding } from './styles';
import { getFooterClasses } from '../Common/styles';
import { getSingleComputeDevice, selectDeviceByKanIdSelectorFactory } from '../../store/computeDeviceSlice';

import SkillCameraDetail from './SkillCameraDetail';
import PageLoading from '../Common/PageLoading';

const DeploymentSkillCamera = () => {
  const { deployment: deploymentId, skill: skillId } = useParams<{ deployment: string; skill: string }>();

  const history = useHistory();
  const footerClasses = getFooterClasses();
  const dispatch = useDispatch();

  const deployment = useSelector((state: RootState) => selectDeploymentById(state, deploymentId));
  const cameraList = useSelector((state: RootState) => selectAllCameras(state));
  const device = useSelector(selectDeviceByKanIdSelectorFactory(deployment.compute_device));
  const skill = useSelector(selectAiSkillByKanIdSelectorFactory(skillId));
  const isWarningDisplay = device.is_k8s;

  const [selectedCamera, setseLectedCamera] = useState<Camera | null>(null);
  const [filterInput, setFilterInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      await dispatch(getSingleComputeDevice({ id: deployment.id, kan_id: deployment.kan_id }));

      setIsLoading(false);
    })();
  }, [dispatch, deployment]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: {
        iconName: 'Refresh',
      },
      onClick: () => history.go(0),
    },
    ...commonCommandBarItems,
  ];

  const cameraOptions: IChoiceGroupOption[] = useMemo(
    () =>
      deployment.configure
        .map((configureCamera) => ({
          key: configureCamera.camera.toString(),
          text: cameraList.find((camera) => camera.kan_id === configureCamera.camera).name,
        }))
        .filter((option) => (isEmpty(filterInput) ? option : option.text.match(filterInput))),
    [deployment, cameraList, filterInput],
  );

  const onSearchChange = useCallback((newValue) => {
    if (isEmpty(newValue)) setFilterInput('');
  }, []);

  const onCameraOptionsChange = useCallback(
    (optoption?: IChoiceGroupOption) => {
      const matchCamera = cameraList.find((camera) => camera.kan_id === optoption.key);

      setseLectedCamera(matchCamera);
    },
    [cameraList],
  );

  if (isLoading) return <PageLoading />;

  return (
    <>
      <Stack styles={{ root: { ...wrapperPadding, height: '100%' } }}>
        <Stack horizontal horizontalAlign="space-between">
          <Label styles={{ root: { fontSize: '24px', lineHeight: '32px' } }}>{skill.name}</Label>
          <IconButton iconProps={{ iconName: 'Cancel' }} onClick={() => history.push(Url.DEPLOYMENT)} />
        </Stack>
        <CommandBar items={commandBarItems} styles={{ root: { paddingLeft: 0 } }} />
        <Stack horizontal styles={{ root: { height: 'calc(100% - 148px)' } }}>
          <Stack styles={{ root: { width: '220px', borderRight: ' 1px solid #EDEBE9' } }}>
            <SearchBox
              styles={{ root: { width: '180px' } }}
              onSearch={(newValue) => setFilterInput(newValue)}
              onClear={() => setFilterInput('')}
              onChange={(_, newValue) => onSearchChange(newValue)}
            />
            <ChoiceGroup
              options={cameraOptions}
              onChange={(_, option) => onCameraOptionsChange(option)}
              label="Cameras"
              required={true}
            />
          </Stack>
          <Stack>
            {!!selectedCamera && (
              <SkillCameraDetail
                camera={selectedCamera}
                deviceId={device.id}
                deviceKanId={device.kan_id}
                deployment={deployment}
                skill={skill}
                tabKey="general"
              />
            )}
          </Stack>
        </Stack>
      </Stack>
      <Stack
        styles={{
          root: isWarningDisplay ? footerClasses.warningFooter : footerClasses.root,
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
        <DefaultButton
          styles={{ root: { width: '205px' } }}
          iconProps={{ iconName: 'ChevronLeft' }}
          onClick={() => history.push(generatePath(Url.DEPLOYMENT_DETAIL, { id: deployment.id }))}
        >
          {`Back to ${deployment.name}`}
        </DefaultButton>
      </Stack>
    </>
  );
};

export default DeploymentSkillCamera;
