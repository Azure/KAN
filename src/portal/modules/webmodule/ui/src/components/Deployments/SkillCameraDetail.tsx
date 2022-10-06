// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { Pivot, PivotItem } from '@fluentui/react';
import { isEmpty } from 'ramda';

import { Camera } from '../../store/cameraSlice';
import { AiSkill, Deployment, ConntectedStatus } from '../../store/types';

import GeneralCamera from './SkillCamera/GeneralCamera';
import VidoeRecroding from './SkillCamera/VidoeRecroding';
import Insights from './SkillCamera/Insights';

interface Props {
  camera: Camera;
  skill: AiSkill;
  deployment: Deployment;
  tabKey: string;
  status: Record<string, ConntectedStatus>;
}

const SkillCameraDetail = (props: Props) => {
  const { camera, skill, deployment, status } = props;

  const [selectedKey, setSelectedKey] = useState('general');
  const [localCamera, setLocalCamera] = useState(null);

  useEffect(() => {
    setLocalCamera(camera);
    setSelectedKey('general');
  }, [camera]);

  if (!localCamera) return <></>;

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
          status={isEmpty(status[camera.name]) ? 'disconnected' : status[camera.name]}
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
