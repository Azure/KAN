// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect, useCallback } from 'react';
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

import { commonCommandBarItems } from '../utils';
import { Url, theme } from '../../constant';
import { getDeploymentWrapperClasses } from './styles';
import { FormattedDeployment } from './types';
import {
  getFilteredDeploymentList,
  DeploymentFieldKey,
  DeploymentFieldMap,
  getDropOptions,
  getMinContentList,
} from './utils';

import CardList from './List/CardList';
import FilteredDropdownLabel from '../Common/FilteredDropdownLabel';
import CraeteMessageBar, { LocationState } from '../Common/CraeteMessageBar';

interface Props {
  formattedDeploymentList: FormattedDeployment[];
}

const DeploymentDetail = (props: Props) => {
  const { formattedDeploymentList } = props;

  const history = useHistory();
  const classes = getDeploymentWrapperClasses();
  const location = useLocation<LocationState>();

  const [isFilter, setIsFilter] = useState<boolean>(false);
  const [localDeploymentList, setLocalDeploymentList] = useState<FormattedDeployment[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [filterFieldMap, setFilterFieldMap] = useState<DeploymentFieldMap>({
    deviceName: [],
  });
  const [localCreated, setLocalCreated] = useState(location.state?.isCreated);

  useEffect(() => {
    if (!isEmpty(filterValue)) {
      setLocalDeploymentList(getFilteredDeploymentList(formattedDeploymentList, filterValue));
    } else {
      setLocalDeploymentList(formattedDeploymentList);
    }
  }, [formattedDeploymentList, filterValue]);

  const onFilteredFieldApply = useCallback((ids: number[], target: DeploymentFieldKey) => {
    setFilterFieldMap((prev) => ({ ...prev, [target]: ids }));
  }, []);

  const onFilterClear = useCallback(() => {
    setFilterValue('');
    setFilterFieldMap({
      deviceName: [],
    });
  }, []);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'add',
      text: 'Create Deployment',
      iconProps: {
        iconName: 'CircleAddition',
      },
      onClick: () => history.push(Url.DEPLOYMENT_CREATION_BASIC),
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
    //   onClick: () => setViewMode((prev) => (prev === 'card' ? 'list' : 'card')),
    // },
    // {
    //   key: 'delete',
    //   text: 'Delete',
    //   iconProps: {
    //     iconName: 'Delete',
    //   },
    //   onClick: () => onDeviceDelete(),
    // },
    ...commonCommandBarItems,
  ];

  return (
    <Stack styles={{ root: classes.root }}>
      <CommandBar styles={{ root: { paddingLeft: 0 } }} items={commandBarItems} />
      {formattedDeploymentList.length > 0 ? (
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
                onChange={(_, newValue) => setFilterValue(newValue)}
              />
              <Stack horizontal tokens={{ childrenGap: 10 }}>
                <FilteredDropdownLabel
                  lablelTitle="ComputeDevice Name"
                  currentOptionList={Object.entries(
                    getDropOptions(getMinContentList(localDeploymentList, filterFieldMap), 'deviceName'),
                  )}
                  onContentChange={(newIds) => onFilteredFieldApply(newIds, 'deviceName')}
                  selectedObjectNameList={Object.keys(
                    getDropOptions(
                      localDeploymentList.filter((device) => filterFieldMap.deviceName.includes(device.id)),
                      'deviceName',
                    ),
                  )}
                  onContentCancel={() => onFilteredFieldApply([], 'deviceName')}
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
            <CraeteMessageBar pageType="deployment" onMessageBarClose={() => setLocalCreated(false)} />
          )}
          <Stack style={{ marginTop: '25px', fontSize: '13px' }}>
            Below are your deployments. Click on one to view the skills running on it.
          </Stack>
          <CardList deploymentList={getMinContentList(localDeploymentList, filterFieldMap)} />
        </>
      ) : (
        <Stack>
          <Stack styles={{ root: { paddingTop: '35px' } }}>
            <Label styles={{ root: { fontSize: '14px', lineHeight: '20px' } }}>What is a Deployment?</Label>
            <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
              Deployments connect your AI skills to your compute devices and cameras, so that you can see key
              insights from your solution.
            </Text>
            <Stack horizontalAlign="center" styles={{ root: { paddingTop: '40px' } }}>
              <img
                src="/icons/deployment/deploymentTitle.png"
                alt="deployment"
                style={{ marginTop: '20px', width: '140px', height: '140px' }}
              />
              <Stack tokens={{ childrenGap: 5 }}>
                <Label styles={{ root: { fontSize: '16px', lineHeight: '22px' } }}>No Deployments</Label>
                <Text styles={{ root: { fontSize: '13px', lineHeight: '18px' } }}>
                  Would you like to add one?
                </Text>
              </Stack>
              <PrimaryButton
                style={{ marginTop: '30px' }}
                onClick={() => history.push(Url.DEPLOYMENT_CREATION_BASIC)}
              >
                Create
              </PrimaryButton>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default DeploymentDetail;
