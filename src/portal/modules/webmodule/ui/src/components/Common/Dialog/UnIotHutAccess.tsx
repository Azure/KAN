import React from 'react';
import { Dialog, DialogType, Stack, Text, Icon } from '@fluentui/react';

interface Props {
  onDismiss: () => void;
}

const UnIotHutAccess = (props: Props) => {
  const { onDismiss } = props;

  return (
    <Dialog
      hidden={false}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'No IoT Hub access',
        subText:
          'You need Service Principal with IoT Hub access in order to add an IoT Edge Device. Please use the installer to allow access.',
        showCloseButton: false,
        styles: { subText: { marginBottom: '8px' } },
      }}
      modalProps={{
        isBlocking: false,
      }}
    >
      <Stack
        horizontal
        verticalAlign="center"
        tokens={{ childrenGap: 5 }}
        styles={{ root: { color: '#0078D4' } }}
      >
        <Text>Learn more</Text>
        <Icon iconName="OpenInNewWindow" />
      </Stack>
    </Dialog>
  );
};

export default UnIotHutAccess;
