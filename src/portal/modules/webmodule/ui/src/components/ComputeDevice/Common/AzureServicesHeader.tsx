// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Text, Label, ActionButton } from '@fluentui/react';

import { theme } from '../../../constant';

const AZURE_PORTAL = 'https://portal.azure.com/#home';

const AzureServicesHeader = () => {
  return (
    <Stack>
      <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Azure Services</Label>
      <Stack>
        <Text>
          You must have an Azure IoT Hub account and IoT Edge Device in order to add a compute device.
        </Text>
        <Stack horizontal verticalAlign="center">
          <Text>Don’t have an account?</Text>

          <ActionButton
            styles={{
              root: { color: theme.palette.themeSecondary },
              flexContainer: {
                flexDirection: 'row-reverse',
              },
            }}
            iconProps={{ iconName: 'OpenInNewWindow' }}
            onClick={() => {
              const win = window.open(AZURE_PORTAL, '_blank');
              win.focus();
            }}
          >
            Create one
          </ActionButton>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AzureServicesHeader;
