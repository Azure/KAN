import React from 'react';
import { Dialog, DialogType, Link, Text, Icon } from '@fluentui/react';

interface Props {
  onDismiss: () => void;
}

const UnCustomVision = (props: Props) => {
  const { onDismiss } = props;

  return (
    <Dialog
      hidden={false}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'No Custom Vision access',
        subText:
          'You need Custom Vision access in order to create a custom model. Please use the installer to allow access.',
        showCloseButton: true,
        styles: { subText: { marginBottom: '8px' } },
      }}
      modalProps={{
        isBlocking: false,
      }}
    >
      <Link
        styles={{
          root: {
            color: '#0078D4',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'underline',
            '& span': { marginRight: '8px' },
          },
        }}
        target="_blank"
        href="https://github.com/Azure/PerceptOSS"
      >
        <Text>Learn more</Text>
        <Icon iconName="OpenInNewWindow" />
      </Link>
    </Dialog>
  );
};

export default UnCustomVision;
