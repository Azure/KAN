// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
import React, { useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import {
  CommandBar,
  ICommandBarItemProps,
  IButtonStyles,
  getTheme,
  ICommandBarStyles,
  mergeStyleSets,
  Callout,
  DirectionalHint,
  Label,
  Stack,
  Text,
  Link,
  Icon,
} from '@fluentui/react';
import { WaffleIcon, SettingsIcon, FeedbackIcon, RingerIcon } from '@fluentui/react-icons';
import { useBoolean, useId } from '@uifabric/react-hooks';
import { useSelector } from 'react-redux';
import { isNil } from 'ramda';

import { State } from 'RootStateType';
import { selectUnreadNotification } from '../store/notificationSlice';
import { Url } from '../constant';
import { FEEDBACK_URL } from './constant';

import { NotificationPanel } from './NotificationPanel';

const theme = getTheme();

const RANDOM_SECOND = Math.floor(Math.random() * (1200 - 600 + 1)) + 600;

const commandBarBtnStyles: IButtonStyles = {
  root: {
    backgroundColor: theme.palette.themePrimary,
    color: theme.palette.white,
  },
  rootHovered: {
    backgroundColor: theme.palette.themeDark,
    color: theme.palette.white,
  },
  rootPressed: {
    backgroundColor: theme.palette.themeDarker,
    color: theme.palette.white,
  },
};

const commandBarStyles: ICommandBarStyles = {
  root: {
    backgroundColor: theme.palette.themePrimary,
    color: theme.palette.white,
  },
};

const classes = mergeStyleSets({
  badage: {
    position: 'absolute',
    right: 5,
    top: 10,
    background: '#005A9E',
    color: 'white',
    borderRadius: '16px',
    width: '16px',
    height: '16px',
    fontSize: '10px',
  },
  icon: {
    fontSize: '16px',
  },
});

type TopNavProps = {
  onSettingClick: () => void;
};

export const TopNav: React.FC<TopNavProps> = ({ onSettingClick }) => {
  const history = useHistory();

  const [isCalloutVisible, { toggle: toggleIsCalloutVisible }] = useBoolean(false);
  const [notificationOpen, { setFalse: closeNotification, setTrue: openNotification }] = useBoolean(false);
  const notificationCount = useSelector((state: State) => selectUnreadNotification(state).length);

  const iconId = useId('callout-feedback');

  useEffect(() => {
    const isFeedback = localStorage.getItem('poss_feedback');
    if (isNil(isFeedback)) {
      localStorage.setItem('poss_feedback', 'off');
    }

    if (isNil(isFeedback) || isFeedback === 'off') {
      const timer = setTimeout(() => {
        toggleIsCalloutVisible();
      }, RANDOM_SECOND * 1000);
      return () => clearTimeout(timer);
    }
  }, [toggleIsCalloutVisible]);

  const commandBarFarItems: ICommandBarItemProps[] = [
    {
      key: 'feedback',
      iconOnly: true,
      onRenderIcon: () => <FeedbackIcon id={iconId} className={classes.icon} />,
      buttonStyles: commandBarBtnStyles,
      onClick: () => {
        const win = window.open(FEEDBACK_URL, '_blank');
        win.focus();
      },
    },
    {
      key: 'notification',
      iconOnly: true,
      onRenderIcon: () => {
        return (
          <div>
            {!!notificationCount && <div className={classes.badage}>{notificationCount}</div>}
            <RingerIcon className={classes.icon} />
          </div>
        );
      },
      buttonStyles: commandBarBtnStyles,
      onClick: openNotification,
    },
    {
      key: 'setting',
      iconOnly: true,
      onRenderIcon: () => <SettingsIcon className={classes.icon} />,
      buttonStyles: commandBarBtnStyles,
      onClick: onSettingClick,
    },
  ];

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'btn',
      iconOnly: true,
      onRenderIcon: () => <WaffleIcon style={{ fontSize: '20px' }} />,
      buttonStyles: commandBarBtnStyles,
      onClick: () => history.push(Url.HOME),
    },
    {
      key: 'title',
      text: 'Percept Open-Source Project',
      buttonStyles: commandBarBtnStyles,
      onClick: () => history.push(Url.HOME),
    },
  ];

  const onLinkClick = useCallback(() => {
    localStorage.setItem('poss_feedback', 'on');
  }, []);

  return (
    <>
      <CommandBar styles={commandBarStyles} items={commandBarItems} farItems={commandBarFarItems} />
      {/* <FeedbackDialog hidden={feedbackHidden} onDismiss={closeFeedback} /> */}
      <NotificationPanel isOpen={notificationOpen} onDismiss={closeNotification} />
      {isCalloutVisible && (
        <Callout
          target={`#${iconId}`}
          setInitialFocus
          onDismiss={toggleIsCalloutVisible}
          role="alertdialog"
          directionalHint={DirectionalHint.bottomRightEdge}
        >
          <Stack
            tokens={{
              childrenGap: 8,
              maxWidth: 310,
              padding: '17px 24px 20px',
            }}
          >
            <Label styles={{ root: { fontSize: '18px' } }}>Have feedback?</Label>
            <Text>Click the link below, and you will be redirected to a feedback submission form.</Text>
            <Link target="_blank" href={FEEDBACK_URL} onClick={onLinkClick}>
              <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 5 }}>
                <Text>Send feedback</Text>
                <Icon styles={{ root: { color: '#0078D4' } }} iconName="OpenInNewWindow" />
              </Stack>
            </Link>
          </Stack>
        </Callout>
      )}
    </>
  );
};
