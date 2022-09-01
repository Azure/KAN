// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback, useEffect } from 'react';
import {
  ICommandBarItemProps,
  CommandBar,
  Stack,
  Text,
  PrimaryButton,
  Label,
  SearchBox,
  ActionButton,
} from '@fluentui/react';
import { useHistory, useLocation } from 'react-router-dom';
import { isEmpty } from 'ramda';

import { AiSkill } from '../../store/types';
import { commonCommandBarItems } from '../utils';
import { Url, theme } from '../../constant';
import {
  getFilterdSkillList,
  SkillFieldKey,
  SkillFieldMap,
  getDropOptions,
  getMinContentList,
} from './utils';

import CardList from './List/CardList';
import FilteredDropdownLabel from '../Common/FilteredDropdownLabel';
import CraeteMessageBar, { LocationState } from '../Common/CraeteMessageBar';

interface Props {
  skillList: AiSkill[];
}

const AiSkillWrapper = (props: Props) => {
  const { skillList } = props;

  const history = useHistory();
  const location = useLocation<LocationState>();

  const [localSkillList, setLocalLocalSkillList] = useState(skillList);
  const [isFilter, setIsFilter] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [filterFieldMap, setFilterFieldMap] = useState<SkillFieldMap>({
    acceleration: [],
    fps: [],
  });
  const [localCreated, setLocalCreated] = useState(location.state?.isCreated);

  useEffect(() => {
    if (!isEmpty(filterValue)) {
      setLocalLocalSkillList(getFilterdSkillList(skillList, filterValue));
    } else {
      setLocalLocalSkillList(skillList);
    }
  }, [skillList, filterValue]);

  const onInputChange = useCallback(
    (newValue: string) => {
      if (isEmpty(newValue)) {
        setLocalLocalSkillList(skillList);
      }
    },
    [skillList],
  );

  const onFilteredFieldApply = useCallback((ids: number[], target: SkillFieldKey) => {
    setFilterFieldMap((prev) => ({ ...prev, [target]: ids }));
  }, []);

  const onFilterClear = useCallback(() => {
    setFilterValue('');
    setFilterFieldMap({
      acceleration: [],
      fps: [],
    });
  }, []);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: 'Create AI Skill',
      iconProps: {
        iconName: 'CircleAddition',
      },
      onClick: () => history.push(Url.AI_SKILL_CREATION_BASIC),
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
      onClick: () => setIsFilter((prev) => !prev),
    },
    // {
    //   key: 'listView',
    //   text: 'List View',
    //   iconProps: {
    //     iconName: 'View',
    //   },
    //   // onClick: () => setViewMode((prev) => (prev === 'card' ? 'list' : 'card')),
    // },
    // {
    //   key: 'delete',
    //   text: 'Delete',
    //   iconProps: {
    //     iconName: 'Delete',
    //   },
    //   // onClick: () => onDeviceDelete(),
    // },
    ...commonCommandBarItems,
  ];

  return (
    <section>
      <CommandBar styles={{ root: { marginTop: '24px', paddingLeft: 0 } }} items={commandBarItems} />
      {skillList.length > 0 ? (
        <>
          {isFilter && (
            <Stack
              styles={{ root: { padding: '10px 0' } }}
              horizontal
              tokens={{ childrenGap: 10 }}
              verticalAlign="center"
            >
              <SearchBox
                styles={{ root: { width: '180px' } }}
                placeholder="Search"
                onSearch={(newValue) => setFilterValue(newValue)}
                onClear={() => setFilterValue('')}
                onChange={(_, newValue) => onInputChange(newValue)}
              />
              <Stack horizontal tokens={{ childrenGap: 10 }}>
                <FilteredDropdownLabel
                  lablelTitle="Acceleration"
                  currentOptionList={Object.entries(
                    getDropOptions(getMinContentList(localSkillList, filterFieldMap), 'acceleration'),
                  )}
                  onContentChange={(newIds) => onFilteredFieldApply(newIds, 'acceleration')}
                  selectedObjectNameList={Object.keys(
                    getDropOptions(
                      localSkillList.filter((camera) => filterFieldMap.acceleration.includes(camera.id)),
                      'acceleration',
                    ),
                  )}
                  onContentCancel={() => onFilteredFieldApply([], 'acceleration')}
                />
                <FilteredDropdownLabel
                  lablelTitle="FPS"
                  currentOptionList={Object.entries(
                    getDropOptions(getMinContentList(localSkillList, filterFieldMap), 'fps'),
                  )}
                  onContentChange={(newIds) => onFilteredFieldApply(newIds, 'fps')}
                  selectedObjectNameList={Object.keys(
                    getDropOptions(
                      localSkillList.filter((camera) => filterFieldMap.fps.includes(camera.id)),
                      'fps',
                    ),
                  )}
                  onContentCancel={() => onFilteredFieldApply([], 'fps')}
                />
              </Stack>
              <ActionButton
                styles={{ root: { color: theme.palette.themeSecondary } }}
                onClick={onFilterClear}
              >
                Reset
              </ActionButton>
            </Stack>
          )}
          {localCreated && (
            <CraeteMessageBar pageType="skill" onMessageBarClose={() => setLocalCreated(false)} />
          )}
          <Stack style={{ marginTop: '25px', fontSize: '13px' }}>
            Below are the AI Skills you have successfully created.
          </Stack>
          <CardList skillList={getMinContentList(localSkillList, filterFieldMap)} />
        </>
      ) : (
        <Stack>
          <Stack styles={{ root: { paddingTop: '35px' } }}>
            <Label styles={{ root: { fontSize: '14px', lineHeight: '20px' } }}>What are AI Skills?</Label>
            <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
              AI Skills are an overlay of models to provide desired output. You can configure multiple models
              for increased accuracy and efficiency.
            </Text>
            <Stack horizontalAlign="center" styles={{ root: { paddingTop: '40px' } }}>
              <img
                src="/icons/aiSkill/aiSkillTitle.png"
                alt="aiSkill"
                style={{ marginTop: '20px', width: '140px', height: '140px' }}
              />
              <Stack tokens={{ childrenGap: 5 }} horizontalAlign="center">
                <Label styles={{ root: { fontSize: '16px', lineHeight: '22px' } }}>No AI Skills</Label>
                <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
                  Would you like to create one?
                </Text>
              </Stack>
              <PrimaryButton
                style={{ marginTop: '30px' }}
                onClick={() => history.push(Url.AI_SKILL_CREATION_BASIC)}
              >
                Create
              </PrimaryButton>
            </Stack>
          </Stack>
        </Stack>
      )}
    </section>
  );
};

export default AiSkillWrapper;
