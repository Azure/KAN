// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Label, mergeStyleSets, Text } from '@fluentui/react';
import { useHistory, generatePath } from 'react-router-dom';
import { cardBorderStyle } from '../../constant';

import { theme, Url } from '../../../constant';
import { AiSkill } from '../../../store/types';

import MenuButton from './MenuButton';

interface Props {
  skill: AiSkill;
  onDeleteModalOpen: () => void;
  onDefinitionOpen: () => void;
}

const getClasses = () =>
  mergeStyleSets({
    cardWrapper: {
      width: '300px',
      height: '220px',
      ...cardBorderStyle,
    },
    topContnetWrapper: { outline: '0.3px solid rgba(0,0,0,0.1)' },
    cardTitleWrapper: { padding: '6px 0 10px 10px' },
    subtitle: { color: theme.palette.neutralSecondaryAlt, fontSize: '12px' },
    icon: { width: '60px', height: '60px' },
    bottomContentWrapper: { position: 'relative', height: '100%', padding: '10px 15px' },
    bottomLeftContentWrapper: { width: '50%' },
    contentTitle: { color: theme.palette.neutralSecondaryAlt, fontSize: '13px', fontWeight: 400 },
    content: { fontSize: '13px', fontWeight: 400 },
    img: { width: '50%' },
  });

const Card = (props: Props) => {
  const { skill, onDeleteModalOpen, onDefinitionOpen } = props;

  const classes = getClasses();
  const history = useHistory();

  return (
    <Stack
      styles={{
        root: classes.cardWrapper,
      }}
      onClick={() => history.push(generatePath(Url.AI_SKILL_EDIT, { id: skill.id, step: 'cascade' }))}
    >
      <Stack
        horizontal
        horizontalAlign="space-between"
        verticalAlign="center"
        styles={{ root: classes.topContnetWrapper }}
      >
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <Stack styles={{ root: classes.icon }}>
            <img src="/icons/aiSkill/skillCard.png" alt="aiSkill" />
          </Stack>
          <Stack styles={{ root: classes.cardTitleWrapper }}>
            <Label>{skill.name}</Label>
            <Text styles={{ root: classes.subtitle }}>skill</Text>
          </Stack>
        </Stack>
        <MenuButton
          skill={skill}
          iconName="MoreVertical"
          onDeleteModalOpen={onDeleteModalOpen}
          onDefinitionOpen={onDefinitionOpen}
        />
      </Stack>
      <Stack styles={{ root: classes.bottomContentWrapper }} horizontal tokens={{ childrenGap: 10 }}>
        <Stack styles={{ root: classes.bottomLeftContentWrapper }} tokens={{ childrenGap: 7 }}>
          <Stack>
            <Label
              styles={{
                root: classes.contentTitle,
              }}
            >
              Acceleration
            </Label>
            <Text styles={{ root: classes.content }}>{skill.acceleration}</Text>
          </Stack>
          <Stack>
            <Label
              styles={{
                root: classes.contentTitle,
              }}
            >
              Upper Frame Rate
            </Label>
            <Text styles={{ root: classes.content }}>{skill.fps} fps</Text>
          </Stack>
        </Stack>
        {/* <img className={classes.img} src={skill.screenshot} alt="screenshot" /> */}
      </Stack>
    </Stack>
  );
};

export default Card;
