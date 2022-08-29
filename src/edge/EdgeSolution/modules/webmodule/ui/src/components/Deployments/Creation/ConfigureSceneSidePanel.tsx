// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Panel, Stack, Text, Label, PanelType } from '@fluentui/react';

import { ConfigureSkill } from '../types';

import ConfigureSceneWrapper from '../Scene/ConfigureSceneWrapper';

interface Props {
  configureCascade: ConfigureSkill;
  onPanelClose: () => void;
}

const ConfigureSceneSidePanel = (props: Props) => {
  const { configureCascade: _ } = props;

  return (
    <Panel
      isOpen={true}
      // onDismiss={onPanelClose}
      hasCloseButton
      headerText="Configure Track Objects skill on Cam1"
      // onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
      type={PanelType.large}
    >
      <Stack tokens={{ childrenGap: 40 }}>
        <Stack>
          <Text>
            Use the tool below to draw lines/polygons to configure your skill. The parameters on the right
            will autofill.
          </Text>
        </Stack>
        <ConfigureSceneWrapper camera={1} cascade={1} />
        {/* <Stack horizontal tokens={{ childrenGap: 25 }}>
          <Stack grow={2}>
            <ConfigureScene />
          </Stack>
          <Stack grow={1}>Test</Stack>
        </Stack> */}
        <Stack tokens={{ childrenGap: 20 }}>
          <Text>
            Adjust the parameters below to configure your camera. They have been set to default values.
          </Text>
          <Stack tokens={{ childrenGap: 20 }}>
            <Label />
          </Stack>
        </Stack>
      </Stack>
    </Panel>
  );
};

export default ConfigureSceneSidePanel;
