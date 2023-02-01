// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback, useEffect } from 'react';
import { Stack, Text, DefaultButton, SearchBox } from '@fluentui/react';
import { useHistory } from 'react-router-dom';
import { isEmpty } from 'ramda';

import { getFooterClasses } from '../../Common/styles';
import { Url } from '../../../constant';
import { FormattedModel } from '../../../store/types';
import { getFilterdModelList } from '../utis';

import ModelCard from '../List/ModelCard';
import ModelSidePanel from '../ModelSidePanel';

interface Props {
  modelList: FormattedModel[];
  isFilter: boolean;
}

const IntelModelZooDashboard = (props: Props) => {
  const { modelList, isFilter } = props;

  const footerClasses = getFooterClasses();
  const history = useHistory();

  const [localModelList, setLocalModelList] = useState<FormattedModel[]>([]);
  const [filterValue, setFilterValue] = useState('');
  const [localSelectedModel, setLocalSelectedModel] = useState<FormattedModel | null>(null);

  useEffect(() => {
    if (isEmpty(filterValue)) {
      setLocalModelList(modelList);
    } else {
      setLocalModelList(getFilterdModelList(modelList, filterValue));
    }
  }, [modelList, filterValue]);

  const onModelSelect = useCallback((model) => {
    setLocalSelectedModel(model);
  }, []);

  const onInputChange = useCallback((newValue: string) => {
    if (isEmpty(newValue)) {
      setFilterValue('');
    }
  }, []);

  return (
    <>
      <Stack tokens={{ childrenGap: 30 }}>
        <Text styles={{ root: { marginTop: '30px' } }}>
          These models will be available to you later in your solution process, when you build AI skills and
          Deployments.
        </Text>
        {isFilter && (
          <SearchBox
            styles={{ root: { width: '300px' } }}
            placeholder="Search"
            onSearch={(newValue) => setFilterValue(newValue)}
            onClear={() => setFilterValue('')}
            onChange={(_, newValue) => onInputChange(newValue)}
          />
        )}

        <Stack horizontal tokens={{ childrenGap: '30px' }} wrap>
          {localModelList.map((model, id) => (
            <ModelCard
              key={id}
              model={model}
              onModelSelect={onModelSelect}
              onModelRedirect={() => null}
              onModelDelete={() => null}
              isCustomVisionModel={false}
              onDefinitionOpen={() => null}
            />
          ))}
        </Stack>
      </Stack>
      {!!localSelectedModel && (
        <ModelSidePanel
          model={localSelectedModel}
          onDismiss={() => setLocalSelectedModel(null)}
          onModelRedirect={() => null}
        />
      )}
      <Stack
        styles={{
          root: footerClasses.root,
        }}
      >
        <DefaultButton
          styles={{ root: { width: '250px' } }}
          iconProps={{ iconName: 'ChevronLeft' }}
          onClick={() => history.push(Url.MODELS)}
        >
          Back to Model Workspace
        </DefaultButton>
      </Stack>
    </>
  );
};

export default IntelModelZooDashboard;
