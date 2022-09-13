// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { Stack, Label, Text, mergeStyleSets, Icon } from '@fluentui/react';
import { useHistory, generatePath } from 'react-router-dom';
import { uniq } from 'ramda';

import { Url, theme } from '../../../constant';
import { FormattedDeployment } from '../types';
import { cardBorderStyle } from '../../constant';
import { getLimitText } from '../../utils';

import MenuButton from './MenuButton';

interface Props {
  deployment: FormattedDeployment;
  onDeleteModalOpen: () => void;
  onPropertyOpen: () => void;
}

const getClasses = () =>
  mergeStyleSets({
    root: {
      width: '300px',
      height: '220px',
      ...cardBorderStyle,
    },
    cardTopWrapper: { outline: '0.3px solid rgba(0,0,0,0.1)' },
    img: { width: '60px', height: '60px' },
    cardTitle: { fontSize: '14px', lineHeight: '20px' },
    cardDes: { color: theme.palette.neutralSecondaryAlt, fontSize: '12px' },
    cardBottomWrapper: { position: 'relative', height: '100%', padding: '14px 24px 0' },
    bottomTitle: { color: theme.palette.neutralSecondaryAlt, fontSize: '10px', fontWeight: 400 },
    bottomInfo: { fontSize: '13px', color: theme.palette.black },
    connectedStatus: { color: '#57A300', fontSize: '13px' },
    unconnectedStatus: { color: '#A4262C', fontSize: '13px' },
  });

const Card = (props: Props) => {
  const { deployment, onDeleteModalOpen, onPropertyOpen } = props;

  const history = useHistory();
  const classes = getClasses();

  const onRedirectClick = useCallback(() => {
    history.push(generatePath(Url.DEPLOYMENT_DETAIL, { id: deployment.id }));
  }, [history, deployment]);

  if (!deployment) return <></>;

  return (
    <Stack
      styles={{
        root: classes.root,
      }}
      onClick={onRedirectClick}
    >
      <Stack
        horizontal
        horizontalAlign="space-between"
        verticalAlign="center"
        styles={{ root: classes.cardTopWrapper }}
      >
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <Stack styles={{ root: classes.img }}>
            <img src="/icons/deployment/deploymentCard.png" alt="deployment" />
          </Stack>
          <Stack>
            <Label styles={{ root: classes.cardTitle }}>{deployment.name}</Label>
            <Text styles={{ root: classes.cardDes }}>Deployment</Text>
          </Stack>
        </Stack>
        <MenuButton
          deployemnt={deployment}
          iconName="MoreVertical"
          onDeleteModalOpen={onDeleteModalOpen}
          onPropertyOpen={onPropertyOpen}
        />
      </Stack>
      <Stack styles={{ root: classes.cardBottomWrapper }} tokens={{ childrenGap: 5 }}>
        <Stack>
          <Label styles={{ root: classes.bottomTitle }}>Connected Device</Label>
          <Text styles={{ root: classes.bottomInfo }}>{deployment.deviceName}</Text>
        </Stack>
        <Stack>
          <Label styles={{ root: classes.bottomTitle }}>AI Skills Running</Label>
          <Text styles={{ root: classes.bottomInfo }}>
            {getLimitText(uniq(deployment.skillNameList).join(', '), 40)}
          </Text>
        </Stack>
        <Stack>
          <Label styles={{ root: classes.bottomTitle }}>Status</Label>
          <Stack horizontal tokens={{ childrenGap: 5 }} verticalAlign="center">
            <Icon
              iconName={deployment.status.status_code === '0' ? 'SkypeCircleCheck' : 'DRM'}
              styles={{
                root:
                  deployment.status.status_code === '0' ? classes.connectedStatus : classes.unconnectedStatus,
              }}
            />
            <Text>{deployment.status.status_code === '0' ? 'Configured' : 'Unconfigured'}</Text>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Card;
