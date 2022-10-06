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
  deviceSymphonyId: string;
  skill: AiSkill;
  deployment: Deployment;
  tabKey: string;
}

const SkillCameraDetail = (props: Props) => {
  const { camera, skill, deployment, deviceId, deviceSymphonyId } = props;

  const dispatch = useDispatch();

  const device = useSelector((state: RootState) => selectComputeDeviceById(state, deviceId));

  const [selectedKey, setSelectedKey] = useState('general');
  const [localCamera, setLocalCamera] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      await dispatch(getSingleComputeDevice({ id: deviceId, symphony_id: deviceSymphonyId }));

      setLoading(false);
    })();
  }, [dispatch, deviceId, deviceSymphonyId]);

  useEffect(() => {
    setLocalCamera(camera);
    setSelectedKey('general');
  }, [camera]);

  if (loading) return <></>;

  return (
    <>
      <Pivot selectedKey={selectedKey} onLinkClick={(item: PivotItem) => setSelectedKey(item.props.itemKey)}>
        <PivotItem headerText="General" itemKey="general" />
        <PivotItem headerText="Insights" itemKey="insight" />
        <PivotItem headerText="Video Recordings" itemKey="video" />
      </Pivot>
      {selectedKey === 'general' && (
        <GeneralCamera
          camera={localCamera}
          status={isEmpty(device.status[camera.name]) ? 'disconnected' : device.status[camera.name]}
          fps={deployment.status.fps[skill.symphony_id]}
          acceleration={skill.acceleration}
        />
      )}
      {selectedKey === 'insight' && (
        <Insights
          deploymentSymphonyId={deployment.symphony_id}
          skillSymphonyId={skill.symphony_id}
          cameraSymphonyId={localCamera.symphony_id}
          status={deployment.iothub_insights}
        />
      )}
      {selectedKey === 'video' && (
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
