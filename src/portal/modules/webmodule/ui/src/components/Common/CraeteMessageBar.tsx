// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Text, IconButton, MessageBar, MessageBarType, mergeStyleSets } from '@fluentui/react';

import { PageType } from '../constant';

export type LocationState = {
  isCreated?: boolean;
};

const getClasses = () =>
  mergeStyleSets({
    root: {
      backgroundColor: '#F8FFF0',
      padding: '30px 45px',
      outline: '#57A300 1px solid',
      marginTop: '15px',
      position: 'relative',
    },
    barRoot: {
      backgroundColor: '#F8FFF0',
      padding: '15px',
      width: 'calc(100%-30px)',
    },
    barText: { fontSize: '12px' },
    icon: { width: '45px', height: '65px' },
    barIcon: { color: '#57A300' },
    cancelButton: { position: 'absolute', fontSize: '8px', right: '8px', top: '8px' },
  });

interface Props {
  pageType: PageType;
  onMessageBarClose: () => void;
}

const messageList: {
  type: PageType;
  iconSrc: string;
  tipOne: string;
  tipTwo: string;
}[] = [
  {
    type: 'deivce',
    iconSrc: '/icons/computeDevice/deviceCreate.png',
    tipOne: 'Successfully added a compute device !',
    tipTwo:
      'Successfully added a compute device ! Now that you have added a device, you can use add a camera to capture images and tag objects for your model. Simply select your devices below to continue.',
  },
  {
    type: 'camera',
    iconSrc: '/icons/camera/cameraCreate.png',
    tipOne: 'Successfully added a camera! Click on the options for a single camera to view Live Feed.',
    tipTwo:
      'The next step in set-up is adding models to run on your device. Select your desired cameras to continue.',
  },
];

const getMessageConTent = (type: PageType) => {
  switch (type) {
    case 'model':
      return 'Successfully created Model!';
    case 'skill':
      return 'Successfully created AI Skill!';
    case 'deployment':
      return 'Successfully created deployment!';
    default:
      return '';
  }
};

const CraeteMessage = (props: Props) => {
  const { pageType, onMessageBarClose } = props;

  const classes = getClasses();

  if (['model', 'skill', 'deployment'].includes(pageType))
    return (
      <MessageBar
        messageBarIconProps={{ iconName: 'SkypeCircleCheck' }}
        styles={{ icon: classes.barIcon, root: classes.barRoot, text: classes.barText }}
        messageBarType={MessageBarType.success}
        onDismiss={onMessageBarClose}
      >
        {getMessageConTent(pageType)}
      </MessageBar>
    );

  const matchedMessage = messageList.find((message) => message.type === pageType);

  return (
    <Stack
      styles={{
        root: classes.root,
      }}
      horizontal
      tokens={{ childrenGap: 50 }}
      verticalAlign="center"
    >
      <img src={matchedMessage.iconSrc} className={classes.icon} alt="" />
      <Stack>
        <Text>{matchedMessage.tipOne}</Text>
        <Text>{matchedMessage.tipTwo}</Text>
      </Stack>
      <IconButton
        iconProps={{ iconName: 'Cancel' }}
        styles={{ root: classes.cancelButton }}
        onClick={onMessageBarClose}
      />
    </Stack>
  );
};

export default CraeteMessage;
