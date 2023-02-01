// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect, useCallback } from 'react';
import { Stack, Text, PrimaryButton, Label, SearchBox, ActionButton } from '@fluentui/react';
import { useHistory, useLocation } from 'react-router-dom';
import { isEmpty } from 'ramda';

import { FormattedModel } from '../../../store/types';
import { theme, Url } from '../../../constant';
import {
  getFilterdModelList,
  getDropOptions,
  getMinContentList,
  ModelFieldKey,
  ModelFieldMap,
} from '../utis';

import CustomVisionModelDashboard from './CustomVisionModelDashboard';
import FilteredDropdownLabel from '../../Common/FilteredDropdownLabel';
import CraeteMessageBar, { LocationState } from '../../Common/CraeteMessageBar';

interface Props {
  modelList: FormattedModel[];
  isFilter: boolean;
  isEmptyCustomVision: boolean;
  toggleHideDialog: () => void;
}

const modelSource = [
  {
    id: 'cv',
    img: '/icons/models/customModel.png',
    title: 'Create custom model',
    describe: 'Make a model from an existing project, or from scratch.',
    buttonText: 'Create',
    history: Url.MODELS_CREATION_BASIC,
  },
  // {
  //   img: '/icons/models/externalModel.png',
  //   title: 'Add external model',
  //   describe: 'Bring your own model to your workspace. Simply provide a link to your model in blobstorage.',
  //   buttonText: 'Add',
  //   history: '',
  //   isHistory: false,
  // },
  {
    id: 'intel',
    img: '/icons/models/modelZoo.png',
    title: 'Browse Model Zoo',
    describe: 'View our archive of pre-built models to use in your AI Skills and Deployments.',
    buttonText: 'Browse',
    history: Url.MODELS_BROWSE_ZOO,
  },
];

const ModelDashboardWrapper = (props: Props) => {
  const { isFilter, modelList, isEmptyCustomVision, toggleHideDialog } = props;

  const history = useHistory();
  const location = useLocation<LocationState>();

  const [localModelList, setLocalModelList] = useState<FormattedModel[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [filterFieldMap, setFilterFieldMap] = useState<ModelFieldMap>({
    displayType: [],
    accelerationList: [],
    trainStatus: [],
  });
  const [localCreated, setLocalCreated] = useState(location.state?.isCreated);

  useEffect(() => {
    if (isEmpty(filterValue)) {
      setLocalModelList(modelList);
    } else {
      setLocalModelList(getFilterdModelList(modelList, filterValue));
    }
  }, [modelList, filterValue]);

  const onInputChange = useCallback((newValue: string) => {
    if (isEmpty(newValue)) {
      setFilterValue('');
    }
  }, []);

  const onFilteredFieldApply = useCallback((ids: number[], target: ModelFieldKey) => {
    setFilterFieldMap((prev) => ({ ...prev, [target]: ids }));
  }, []);

  const onFilterClear = useCallback(() => {
    setFilterValue('');
    setFilterFieldMap({
      displayType: [],
      accelerationList: [],
      trainStatus: [],
    });
  }, []);

  return (
    <>
      {modelList.length > 0 ? (
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
                  lablelTitle="Type"
                  currentOptionList={Object.entries(
                    getDropOptions(getMinContentList(localModelList, filterFieldMap), 'displayType'),
                  )}
                  onContentChange={(newIds) => onFilteredFieldApply(newIds, 'displayType')}
                  selectedObjectNameList={Object.keys(
                    getDropOptions(
                      localModelList.filter((camera) => filterFieldMap.displayType.includes(camera.id)),
                      'displayType',
                    ),
                  )}
                  onContentCancel={() => onFilteredFieldApply([], 'displayType')}
                />
                <FilteredDropdownLabel
                  lablelTitle="Train Status"
                  currentOptionList={Object.entries(
                    getDropOptions(getMinContentList(localModelList, filterFieldMap), 'trainStatus'),
                  )}
                  onContentChange={(newIds) => onFilteredFieldApply(newIds, 'trainStatus')}
                  selectedObjectNameList={Object.keys(
                    getDropOptions(
                      localModelList.filter((model) => filterFieldMap.trainStatus.includes(model.id)),
                      'trainStatus',
                    ),
                  )}
                  onContentCancel={() => onFilteredFieldApply([], 'trainStatus')}
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
            <CraeteMessageBar pageType="model" onMessageBarClose={() => setLocalCreated(false)} />
          )}
          <CustomVisionModelDashboard modelList={getMinContentList(localModelList, filterFieldMap)} />
        </>
      ) : (
        <Stack>
          <Stack horizontalAlign="center" styles={{ root: { paddingTop: '50px' } }}>
            <img
              src="/icons/models/modelTitle.png"
              alt="modelTitle"
              style={{ marginTop: '20px', width: '175px', height: '140px' }}
            />
            <Stack tokens={{ childrenGap: 5 }} styles={{ root: { textAlign: 'center', paddingTop: '20px' } }}>
              <Label styles={{ root: { fontSize: '16px', lineHeight: '22px' } }}>No Models</Label>
              <Text styles={{ root: { fontSize: '13px', lineHeight: '18px', width: '580px' } }}>
                These models will be available to you later in your solution process, when you build AI skills
                and Deployments.
              </Text>
            </Stack>
          </Stack>
          <Stack
            horizontal
            styles={{ root: { padding: '30px 0 30px' } }}
            horizontalAlign="center"
            wrap
            tokens={{ childrenGap: 85 }}
          >
            {modelSource.map((source, i) => (
              <Stack
                key={i}
                styles={{
                  root: {
                    width: '280px',
                    border: `1px solid ${theme.palette.neutralLight}`,
                    marginTop: '50px',
                  },
                }}
              >
                <img src={source.img} alt="model" style={{ width: '280px', height: '170px' }} />
                <Stack styles={{ root: { padding: '15px 20px' } }}>
                  <Label>{source.title}</Label>
                  <Text>{source.describe}</Text>
                  <div style={{ marginTop: '20px' }}>
                    <PrimaryButton
                      text={source.buttonText}
                      onClick={() => {
                        if (source.id === 'cv' && isEmptyCustomVision) {
                          toggleHideDialog();
                        } else {
                          history.push(source.history);
                        }
                      }}
                    />
                  </div>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
    </>
  );
};

export default ModelDashboardWrapper;
