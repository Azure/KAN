import React from 'react';
import { ICommandBarItemProps, CommandBar, Stack, Text, PrimaryButton, Label } from '@fluentui/react';
import { useHistory } from 'react-router-dom';

import { commonCommandBarItems } from '../utils';
import { Url } from '../../constant';

const DeploymentDetail = () => {
  const history = useHistory();

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: 'Add Deployment',
      iconProps: {
        iconName: 'Add',
      },
      onClick: () => history.push(Url.DEPLOYMENT2_CREATION_BASIC),
    },
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: {
        iconName: 'Refresh',
      },
      buttonStyles: {
        root: { borderLeft: '1px solid #C8C6C4' },
      },
      onClick: () => history.go(0),
    },
    {
      key: 'filter',
      text: 'Filter',
      iconProps: {
        iconName: 'Filter',
      },
    },
    {
      key: 'listView',
      text: 'List View',
      iconProps: {
        iconName: 'View',
      },
      // onClick: () => setViewMode((prev) => (prev === 'card' ? 'list' : 'card')),
    },
    {
      key: 'delete',
      text: 'Delete',
      iconProps: {
        iconName: 'Delete',
      },
      // onClick: () => onDeviceDelete(),
    },
    ...commonCommandBarItems,
  ];

  return (
    <Stack>
      <CommandBar styles={{ root: { marginTop: '24px', paddingLeft: 0 } }} items={commandBarItems} />
      <Stack styles={{ root: { paddingTop: '35px' } }}>
        <Label styles={{ root: { fontSize: '14px', lineHeight: '20px' } }}>
          How can I create a Deployment?
        </Label>
        <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
          et dolore magna aliqua.
        </Text>
        <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
          Tristique senectus et netus et malesuada fames ac turpis egestas.
        </Text>
        <Stack horizontalAlign="center">
          <img
            src="/icons/computeDevice/computeDeviceTitle.png"
            alt="computeDevice"
            style={{ marginTop: '20px', width: '240px', height: '170px' }}
          />
          <Stack tokens={{ childrenGap: 5 }}>
            <Label styles={{ root: { fontSize: '16px', lineHeight: '22px' } }}>No Deployments</Label>
            <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
              Would you like to add one?
            </Text>
          </Stack>
          <PrimaryButton
            style={{ marginTop: '30px' }}
            onClick={() => history.push(Url.DEPLOYMENT2_CREATION_BASIC)}
          >
            Add
          </PrimaryButton>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default DeploymentDetail;
