// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import {
  Stack,
  Label,
  Text,
  mergeStyleSets,
  IconButton,
  IContextualMenuProps,
  ActionButton,
} from '@fluentui/react';
import { slice } from 'ramda';

import { convertProjectType, getLimitText } from '../../utils';
import { theme } from '../../../constant';
import { cardBorderStyle } from '../../constant';
import { FormattedModel } from '../../../store/types';

import Tag from '../Tag';

interface Props {
  model: FormattedModel;
  onModelSelect: (model: FormattedModel) => void;
  onModelRedirect: (modeId: number) => void;
  onModelDelete: (model: FormattedModel) => void;
  isCustomVisionModel: boolean;
  onDefinitionOpen: () => void;
}

const getClasses = () =>
  mergeStyleSets({
    root: {
      width: '305px',
      height: '210px',
      ...cardBorderStyle,
    },
    titleContainer: { borderBottom: '1px solid rgba(0, 0, 0, 0.13)', width: '100%' },
    titleWrapper: { padding: '7px 12px' },
    titleType: { fontSize: '12px', lineHeight: '16px', color: '#605E5C' },
    deleteIcon: {
      padding: '10px',
      marginRight: '12px',
      '& i': {
        fontSize: '24px',
      },
      ':hover': {
        cursor: 'pointer',
      },
    },
    contentWrapper: { padding: '15px 20px', position: 'relative', height: '100%' },
    contentTitle: { fontSize: '10px', color: theme.palette.neutralSecondary },
    content: { fontSize: '13px', color: theme.palette.black },
    redirectIcon: { position: 'absolute', right: 10, bottom: 10, color: theme.palette.themeSecondary },
    tag: { color: theme.palette.themeSecondary, fontSize: '12px', lineHeight: '18px' },
  });

const ModelCard = (props: Props) => {
  const { model, onModelSelect, onModelRedirect, onModelDelete, isCustomVisionModel, onDefinitionOpen } =
    props;

  const classes = getClasses();

  const menuProps: IContextualMenuProps = {
    items: [
      {
        key: 'properties',
        text: 'Properties',
        iconProps: { iconName: 'Equalizer' },
        onClick: () => onModelSelect(model),
      },
      {
        key: 'view',
        text: 'View Definition',
        iconProps: { iconName: 'View' },
        onClick: onDefinitionOpen,
        disabled: !isCustomVisionModel,
      },
      {
        key: 'delete',
        text: 'Delete',
        iconProps: { iconName: 'Delete' },
        onClick: () => onModelDelete(model),
        disabled: !isCustomVisionModel,
      },
    ],
  };

  return (
    <Stack className={classes.root} onClick={() => onModelSelect(model)}>
      <Stack horizontal>
        <img style={{ height: '60px', width: '60px' }} src="/icons/models/modelCard.png" alt="model" />
        <Stack horizontal horizontalAlign="space-between" styles={{ root: classes.titleContainer }}>
          <Stack styles={{ root: classes.titleWrapper }}>
            <Label>{getLimitText(model.name, 20)}</Label>
            <Text styles={{ root: classes.titleType }}>{convertProjectType(model.projectType)}</Text>
          </Stack>
          <Stack horizontalAlign="center" verticalAlign="center">
            <IconButton
              styles={{ root: classes.deleteIcon }}
              menuProps={menuProps}
              menuIconProps={{ iconName: 'MoreVertical' }}
            />
          </Stack>
        </Stack>
      </Stack>
      <Stack className={classes.contentWrapper} tokens={{ childrenGap: 10 }}>
        {!isCustomVisionModel && <Text className={classes.contentTitle}>By Intel</Text>}

        {model.displayTagList.length > 0 && (
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            {model.displayTagList.length > 3 ? (
              <>
                {slice(0, 3, model.displayTagList).map((tag, idx) => (
                  <Tag key={idx} id={idx} text={tag} />
                ))}
                <span className={classes.tag}>+{model.displayTagList.length - 3} more </span>
              </>
            ) : (
              model.displayTagList.map((tag, idx) => <Tag key={idx} id={idx} text={tag} />)
            )}
          </Stack>
        )}

        <Stack>
          <Text className={classes.contentTitle}>Supported Acceleration</Text>
          <Text className={classes.content}>{getLimitText(model.accelerationList.join(', '), 44)}</Text>
        </Stack>
        {isCustomVisionModel && (
          <Stack>
            <Text className={classes.contentTitle}>Status</Text>
            <Text className={classes.content}>{model.is_trained ? 'Trained' : 'Untrained'}</Text>
          </Stack>
        )}
        {isCustomVisionModel && (
          <ActionButton
            iconProps={{ iconName: 'NavigateForward' }}
            allowDisabledFocus
            className={classes.redirectIcon}
            onClick={() => onModelRedirect(model.id)}
          >
            train model
          </ActionButton>
        )}
      </Stack>
    </Stack>
  );
};

export default ModelCard;
