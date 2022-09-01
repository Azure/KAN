// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack } from '@fluentui/react';

import { CreateAISkillFormData, PivotTabKey, UpdateAiSkillFormData } from '../types';

import PreviewTag from '../../Common/PreviewTag';
import PreviewLabel from '../../Common/PreviewLabel';
import PreviewLink from '../../Common/PreviewLink';

interface Props {
  localFormData: CreateAISkillFormData | UpdateAiSkillFormData;
  onLinkClick: (key: PivotTabKey) => void;
}

const Preview = (props: Props) => {
  const { localFormData, onLinkClick } = props;

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }} tokens={{ childrenGap: 15 }}>
      <PreviewLabel title="Skill Name" content={localFormData.name} />
      <PreviewLabel title="Acceleration" content={localFormData.acceleration} />
      <PreviewLabel title="Frame Rate" content={`${localFormData.fps} fps`} />
      <PreviewTag tagList={localFormData.tag_list} />
      <PreviewLink title="Edit AI Skill" onClick={() => onLinkClick('basics')} />
    </Stack>
  );
};

export default Preview;
