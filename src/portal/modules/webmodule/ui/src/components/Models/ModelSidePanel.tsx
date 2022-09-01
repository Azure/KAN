// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Panel, Stack, mergeStyleSets, Text, ActionButton } from '@fluentui/react';

import { FormattedModel } from '../../store/types';
import { theme } from '../../constant';

import SidePanelTag from '../Common/SidePanel/SidePanelTag';
import Tag from './Tag';

type Props = {
  onDismiss: () => void;
  model: FormattedModel;
  onModelRedirect: (modelId: number) => void;
};

const getClasses = () =>
  mergeStyleSets({
    itemWrapper: {
      marginTop: '25px',
    },
    itemTitle: { fontSize: '13px', lineHeight: '18px', color: theme.palette.neutralSecondary },
    itemContent: { fontSize: '13px', lineHeight: '18px', color: theme.palette.neutralPrimary },
    tagsWrapper: {
      marginTop: '20px',
    },
  });

const SideModelPanel: React.FC<Props> = (props) => {
  const { model, onDismiss, onModelRedirect } = props;

  const classes = getClasses();

  return (
    <Panel
      isOpen={true}
      onDismiss={onDismiss}
      hasCloseButton
      headerText="Model Properties"
      isFooterAtBottom={true}
    >
      <Stack styles={{ root: classes.itemWrapper }} tokens={{ childrenGap: 16 }}>
        <Stack>
          <Text className={classes.itemTitle}>Name</Text>
          <Text className={classes.itemContent}>{model.name}</Text>
        </Stack>
        <Stack>
          <Text className={classes.itemTitle}>Type</Text>
          <Text className={classes.itemContent}>{model.projectType}</Text>
        </Stack>
        <Stack>
          <Text className={classes.itemTitle}>Source</Text>
          <Text className={classes.itemContent}>
            {model.category === 'customvision' ? 'Azure Custom Vision' : 'Intel'}
          </Text>
        </Stack>
        {model.category === 'customvision' && (
          <Stack>
            <Text className={classes.itemTitle}>Performance</Text>
            {/* <Stack className={classes.itemContent}>
              <Link
                target=""
                href={`https://www.customvision.ai/projects/${model.customVisionId}#/performance`}
              >
                {model.name} performance
              </Link>
            </Stack> */}
            <Stack horizontal verticalAlign="center">
              <ActionButton
                styles={{
                  root: { color: theme.palette.themeSecondary, padding: 0, height: 'unset' },
                  flexContainer: {
                    flexDirection: 'row-reverse',
                  },
                }}
                iconProps={{ iconName: 'OpenInNewWindow', styles: { root: { paddingLeft: '30px' } } }}
                onClick={() => {
                  const win = window.open(
                    `https://www.customvision.ai/projects/${model.customVisionId}#/performance`,
                    '_blank',
                  );
                  win.focus();
                }}
              >
                {model.name} performance
              </ActionButton>
            </Stack>
          </Stack>
        )}
        <Stack>
          <Text className={classes.itemTitle}>Supported Acceleration</Text>
          <Text className={classes.itemContent}>{model.accelerationList.join(', ')}</Text>
        </Stack>
        <Stack>
          <Text className={classes.itemTitle}>Supported CPU Architecture</Text>
          <Text className={classes.itemContent}>X64, ARM64</Text>
        </Stack>
        <Stack>
          <Text className={classes.itemTitle}>Model Objects/Tags</Text>
          {model.displayTagList.length > 0 && (
            <Stack horizontal tokens={{ childrenGap: 8 }}>
              {model.displayTagList.map((tag, idx) => (
                <Tag key={idx} id={idx} text={tag} />
              ))}
            </Stack>
          )}
        </Stack>
        <SidePanelTag tagList={model.tag_list} />
        {model.category === 'customvision' && (
          <ActionButton
            iconProps={{ iconName: 'NavigateForward' }}
            allowDisabledFocus
            styles={{
              root: { color: theme.palette.themeSecondary, padding: 0 },
            }}
            onClick={() => onModelRedirect(model.id)}
          >
            train model
          </ActionButton>
        )}
      </Stack>
    </Panel>
  );
};

export default SideModelPanel;
