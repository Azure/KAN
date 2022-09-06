// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Label, Text } from '@fluentui/react';

import { CreateAISkillFormData } from '../types';
import { accelerationOptions } from '../../constant';

import HorizontalTextField from '../../Common/HorizontalTextField';
import HorizontalDropdown from '../../Common/HorizontalDropdown';

interface Props {
  localFormData: CreateAISkillFormData;
  onFormDataChange: (formData: CreateAISkillFormData) => void;
}

const Basics = (props: Props) => {
  const { localFormData, onFormDataChange } = props;

  return (
    <Stack styles={{ root: { padding: '40px 0' } }} tokens={{ childrenGap: 30 }}>
      <Stack tokens={{ childrenGap: 10 }}>
        <Stack>
          <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Basic Info</Label>
          <Text>Create a name for your AI Skill.</Text>
        </Stack>
        <HorizontalTextField
          label="Skill Name"
          required
          value={localFormData.name}
          onChange={(_, newValue) =>
            onFormDataChange({
              ...localFormData,
              name: newValue,
              error: { ...localFormData.error, name: '' },
            })
          }
          errorMessage={localFormData.error.name}
        />
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
          onChange={(_, option) =>
            onFormDataChange({
              ...localFormData,
              acceleration: option.key as string,
              error: { ...localFormData.error, acceleration: '' },
            })
          }
          required
          errorMessage={localFormData.error.acceleration}
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
          value={localFormData.fps.toString()}
          required
          onChange={(_, newValue) =>
            onFormDataChange({
              ...localFormData,
              fps: Number.isInteger(+newValue) ? +newValue : localFormData.fps,
              error: { ...localFormData.error, fps: '' },
            })
          }
          errorMessage={localFormData.error.fps}
        />
      </Stack>
    </Stack>
  );
};

export default Basics;
