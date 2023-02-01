// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Label, Text } from '@fluentui/react';

import { UpdateAiSkillFormData } from '../types';
import { accelerationOptions } from '../../constant';

import HorizontalTextField from '../../Common/HorizontalTextField';
import HorizontalDropdown from '../../Common/HorizontalDropdown';

interface Props {
  localFormData: UpdateAiSkillFormData;
}

const Basics = (props: Props) => {
  const { localFormData } = props;

  return (
    <Stack styles={{ root: { padding: '40px 0' } }} tokens={{ childrenGap: 30 }}>
      <Stack tokens={{ childrenGap: 10 }}>
        <Stack>
          <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Basic Info</Label>
          <Text>Create a name for your AI Skill.</Text>
        </Stack>
        <HorizontalTextField label="Skill Name" required value={localFormData.name} disabled />
      </Stack>
      <Stack tokens={{ childrenGap: 10 }}>
        <Stack>
          <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Device</Label>
          <Text>Provide some specs on the device you will run this skill on.</Text>
        </Stack>
        <HorizontalDropdown
          label="Acceleration"
          selectedKey={localFormData.acceleration}
          options={accelerationOptions}
          required
          disabled
        />
      </Stack>
      <Stack tokens={{ childrenGap: 10 }}>
        <Stack>
          <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Camera</Label>
          <Text>
            Provide your desired frame rate for this skill running on your camera. Note, this is an upper
            bound. The actual frame rate might be lowered to improve performance. This is set to 15fps by
            default.
          </Text>
        </Stack>
        <HorizontalTextField
          label="Desired Frame Rate (fps)"
          required
          value={localFormData.fps.toString()}
          disabled
        />
      </Stack>
    </Stack>
  );
};

export default Basics;
