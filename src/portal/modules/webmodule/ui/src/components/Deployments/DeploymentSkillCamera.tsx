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
} from '@fluentui/react';
import { isEmpty } from 'ramda';

import { State as RootState } from 'RootStateType';
import { Url } from '../../constant';
import { commonCommandBarItems } from '../utils';
import { selectDeploymentById } from '../../store/deploymentSlice';
import { selectAllCameras, Camera } from '../../store/cameraSlice';
import { selectCascadeById } from '../../store/cascadeSlice';
import { wrapperPadding } from './styles';
import { getFooterClasses } from '../Common/styles';
import { getSingleComputeDevice, selectComputeDeviceById } from '../../store/computeDeviceSlice';

import SkillCameraDetail from './SkillCameraDetail';
import PageLoading from '../Common/PageLoading';

const DeploymentSkillCamera = () => {
  const { deployment: deploymentId, skill: skillId } = useParams<{ deployment: string; skill: string }>();

  const history = useHistory();
  const footerClasses = getFooterClasses();
  const dispatch = useDispatch();

  const deployment = useSelector((state: RootState) => selectDeploymentById(state, deploymentId));
  const skill = useSelector((state: RootState) => selectCascadeById(state, skillId));
  const cameraList = useSelector((state: RootState) => selectAllCameras(state));
  const device = useSelector((state: RootState) => selectComputeDeviceById(state, deployment.compute_device));

  const [selectedCamera, setseLectedCamera] = useState<Camera | null>(null);
  const [filterInput, setFilterInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await dispatch(getSingleComputeDevice(deployment.compute_device));
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
    {
      key: 'filter',
      text: 'Filter',
      iconProps: {
        iconName: 'Filter',
      },
    },
    ...commonCommandBarItems,
  ];

  const cameraOptions: IChoiceGroupOption[] = useMemo(
    () =>
      deployment.configure
        .map((configureCamera) => ({
          key: configureCamera.camera.toString(),
          text: cameraList.find((camera) => camera.id === configureCamera.camera).name,
        }))
        .filter((option) => (isEmpty(filterInput) ? option : option.text.match(filterInput))),
    [deployment, cameraList, filterInput],
  );

  const onSearchChange = useCallback((newValue) => {
    if (isEmpty(newValue)) setFilterInput('');
  }, []);

  const onCameraOptionsChange = useCallback(
    (optoption?: IChoiceGroupOption) => {
      const matchCamera = cameraList.find((camera) => camera.id === +optoption.key);

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
                deployment={deployment}
                skill={skill}
                tabKey="general"
                status={device.status}
              />
            )}
          </Stack>
        </Stack>
      </Stack>
      <Stack
        styles={{
          root: footerClasses.root,
        }}
      >
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
