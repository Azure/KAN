// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { Pivot, PivotItem } from '@fluentui/react';
import { isEmpty } from 'ramda';
import { useDispatch, useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { Camera } from '../../store/cameraSlice';
import { getSingleComputeDevice, selectComputeDeviceById } from '../../store/computeDeviceSlice';
import { AiSkill, Deployment } from '../../store/types';

import GeneralCamera from './SkillCamera/GeneralCamera';
import VidoeRecroding from './SkillCamera/VidoeRecroding';
import Insights from './SkillCamera/Insights';

interface Props {
  camera: Camera;
  deviceId: number;
  deviceKanId: string;
  skill: AiSkill;
  deployment: Deployment;
  tabKey: string;
  onTabKeySelect: (key: string) => void;
}

const SkillCameraDetail = (props: Props) => {
  const { camera, skill, deployment, deviceId, deviceKanId, tabKey, onTabKeySelect } = props;

  const dispatch = useDispatch();

  const device = useSelector((state: RootState) => selectComputeDeviceById(state, deviceId));

  const [localCamera, setLocalCamera] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      await dispatch(getSingleComputeDevice({ id: deviceId, kan_id: deviceKanId }));

      setLoading(false);
    })();
  }, [dispatch, deviceId, deviceKanId]);

  useEffect(() => {
    setLocalCamera(camera);
  }, [camera]);

  if (loading) return <></>;

  return (
    <>
      <Pivot selectedKey={tabKey} onLinkClick={(item: PivotItem) => onTabKeySelect(item.props.itemKey)}>
        <PivotItem headerText="General" itemKey="general" />
        <PivotItem headerText="Insights" itemKey="insight" />
        <PivotItem headerText="Video Recordings" itemKey="video" />
      </Pivot>
      {tabKey === 'general' && (
        <GeneralCamera
          camera={localCamera}
          status={isEmpty(device.status[camera.name]) ? 'disconnected' : device.status[camera.name]}
          fps={deployment.status.fps[skill.kan_id]}
          acceleration={skill.acceleration}
        />
      )}
      {tabKey === 'insight' && (
        <Insights
          deploymentKanId={deployment.kan_id}
          skillKanId={skill.kan_id}
          cameraKanId={localCamera.kan_id}
          status={deployment.iothub_insights}
        />
      )}
      {tabKey === 'video' && (
        <VidoeRecroding
          deploymentName={deployment.name}
          skillName={skill.name}
          cameraName={localCamera.name}
        />
      )}
    </>
  );
};

export default SkillCameraDetail;
