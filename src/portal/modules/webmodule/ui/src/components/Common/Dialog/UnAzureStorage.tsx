import React from 'react';
import { Dialog, DialogType, Stack, Text, Icon } from '@fluentui/react';

interface Props {
  onDismiss: () => void;
  showCloseButton?: boolean;
}

const UnAzureStorage = (props: Props) => {
  const { onDismiss, showCloseButton } = props;

  return (
    <Dialog
      hidden={false}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'No Azure Storage',
        subText:
          'You need Azure Storage credentials in order to view camera feed. Please use the installer to add your Azure Storage account. ',
        showCloseButton: showCloseButton ?? false,
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

export default UnAzureStorage;
