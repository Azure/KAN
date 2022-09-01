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
        <PivotItem headerText="General" itemKey="general">
          {/* <GeneralCamera
            camera={localCamera}
            status={isEmpty(status[camera.name]) ? 'disconnected' : status[camera.name]}
            fps={deployment.status.fps[skill.symphony_id]}
            acceleration={skill.acceleration}
          /> */}
        </PivotItem>
        <PivotItem headerText="Insights" itemKey="insight">
          {/* <Insights
            deployment={deployment.id}
            skill_symphony_id={skill.symphony_id}
            camera_symphony_id={localCamera.symphony_id}
            status={deployment.iothub_insights}
          /> */}
        </PivotItem>
        <PivotItem headerText="Video Recordings" itemKey="video">
          {/* <VidoeRecroding deployment={deployment.id} skillName={skill.name} cameraName={localCamera.name} /> */}
        </PivotItem>
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
          deployment={deployment.id}
          skill_symphony_id={skill.symphony_id}
          camera_symphony_id={localCamera.symphony_id}
          status={deployment.iothub_insights}
        />
      )}
      {selectedKey === 'video' && (
        <VidoeRecroding deployment={deployment.id} skillName={skill.name} cameraName={localCamera.name} />
      )}
    </>
  );
};

export default SkillCameraDetail;
