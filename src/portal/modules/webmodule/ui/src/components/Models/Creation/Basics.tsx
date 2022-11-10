// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback } from 'react';
import { Stack, Text, IChoiceGroupOption, IDropdownOption, Icon } from '@fluentui/react';
import { useDispatch } from 'react-redux';

import { CreateModelFormData, CreateType } from '../types';
import { getSelectedProjectInfo, ProjectType, ClassificationType } from '../../../store/trainingProjectSlice';
import { theme } from '../../../constant';
import { modelTypeOptions, classificationOptions } from '../../constant';

import HorizontalChoiceGroup from '../../Common/HorizonChoiceGroup';
import HorizontalTextField from '../../Common/HorizontalTextField';
import HorizontalDropdown from '../../Common/HorizontalDropdown';
import Tag from '../Tag';

interface Props {
  localFormData: CreateModelFormData;
  onFormDataChange: (formData: CreateModelFormData) => void;
  customVisionProjectOptions: IDropdownOption[];
}

const azureTypeOptions: IChoiceGroupOption[] = [
  { key: 'yes', text: 'Yes' },
  { key: 'no', text: 'No' },
];

const Basics = (props: Props) => {
  const { localFormData, onFormDataChange, customVisionProjectOptions } = props;

  const [localObject, setLocalObject] = useState('');

  const dispatch = useDispatch();

  const onObjectChange = useCallback(
    (newValue) => {
      setLocalObject(newValue);

      onFormDataChange({ ...localFormData, error: { ...localFormData.error, objects: '' } });
    },
    [localFormData, onFormDataChange],
  );

  const onObjectAdd = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter') {
        if (localFormData.objects.find((object) => object === localObject)) {
          setLocalObject('');
          return;
        }

        onFormDataChange({ ...localFormData, objects: [...localFormData.objects, localObject] });
        setLocalObject('');
      }
    },
    [localObject, onFormDataChange, localFormData],
  );

  const onObjectRemove = useCallback(
    (idx) => {
      const newObjects = [...localFormData.objects];
      newObjects.splice(idx, 1);

      onFormDataChange({ ...localFormData, objects: newObjects });
    },
    [localFormData, onFormDataChange],
  );

  const onProjectDropdownChange = useCallback(
    async (_, option: IDropdownOption) => {
      const response = (await dispatch(getSelectedProjectInfo(option.key as string))) as any;
      onFormDataChange({
        ...localFormData,
        customVisionId: option.key as string,
        type: response.payload.type as ProjectType,
        classification: response.payload.classification_type as ClassificationType,
        objects: response.payload.tags as string[],
        error: { ...localFormData.error, customVisionId: '' },
      });
    },
    [localFormData, onFormDataChange, dispatch],
  );

  return (
    <Stack styles={{ root: { padding: '40px 0' } }} tokens={{ childrenGap: 35 }}>
      <Stack tokens={{ childrenGap: 20 }}>
        <Stack>
          <HorizontalChoiceGroup
            selectedKey={localFormData.createType}
            options={azureTypeOptions}
            label="Create model from your existing Azure Custom Vision project?"
            required
            styles={{ label: { width: '190px', marginRight: '10px' } }}
            onChange={(_, option: IChoiceGroupOption) =>
              onFormDataChange({
                ...localFormData,
                createType: option.key as CreateType,
                customVisionId: '',
                name: '',
                type: '',
                objects: [],
                error: { ...localFormData.error, createType: '' },
              })
            }
          />
          {!!localFormData.error.createType && (
            <Text styles={{ root: { fontSize: '12px', color: theme.palette.redDark, paddingLeft: '200px' } }}>
              {localFormData.error.createType}
            </Text>
          )}
        </Stack>
        {localFormData.createType === 'yes' && (
          <HorizontalDropdown
            label="Project"
            required
            options={customVisionProjectOptions}
            onChange={onProjectDropdownChange}
            selectedKey={localFormData.customVisionId}
            errorMessage={localFormData.error.customVisionId}
          />
        )}
        {localFormData.createType === 'no' && (
          <HorizontalTextField
            label="Model Name"
            value={localFormData.name}
            required
            onChange={(_, newValue) =>
              onFormDataChange({
                ...localFormData,
                name: newValue,
                error: { ...localFormData.error, name: '' },
              })
            }
            errorMessage={localFormData.error.name}
          />
        )}
        {localFormData.createType !== '' && (
          <>
            <Stack horizontal>
              <Text styles={{ root: { width: '200px' } }}>Source</Text>
              <Text>Azure Custom Vision</Text>
            </Stack>
            <Stack horizontal>
              <Text styles={{ root: { width: '200px' } }}>Trainable</Text>
              <Text>True</Text>
            </Stack>
            <Stack>
              <HorizontalDropdown
                label="Type"
                options={modelTypeOptions}
                required
                selectedKey={localFormData.type}
                disabled={localFormData.createType === 'yes'}
                onChange={(_, option) =>
                  onFormDataChange({
                    ...localFormData,
                    type: option.key as ProjectType,
                    error: { ...localFormData.error, type: '' },
                  })
                }
                errorMessage={localFormData.error.type}
              />
              {localFormData.type === 'Classification' && (
                <Stack
                  styles={{ root: { color: '#DB7500', marginLeft: '200px' } }}
                  horizontal
                  tokens={{ childrenGap: 8 }}
                >
                  <Icon iconName="IncidentTriangle" />
                  <Text>
                    Note: Classification models are in preview and cannot be used in AI Skills or Deployments
                  </Text>
                </Stack>
              )}
            </Stack>
          </>
        )}
        {localFormData.createType === 'no' && (
          <>
            {localFormData.type === 'Classification' && (
              <HorizontalDropdown
                label="Classification Types"
                selectedKey={localFormData.classification}
                options={classificationOptions}
                required
                onChange={(_, option) =>
                  onFormDataChange({
                    ...localFormData,
                    classification: option.key as ClassificationType,
                    error: { ...localFormData.error, classification: '' },
                  })
                }
              />
            )}
          </>
        )}
        {localFormData.createType !== '' && (
          <Stack>
            <HorizontalTextField
              label="Objects"
              value={localObject}
              required
              placeholder="type object and press enter"
              onKeyUp={(event) => onObjectAdd(event)}
              disabled={localFormData.createType === 'yes'}
              errorMessage={localFormData.error.objects}
              onChange={(_, newValue) => onObjectChange(newValue)}
            />
            {
              <Stack
                horizontal
                wrap
                styles={{ root: { marginLeft: '200px', paddingTop: '10px' } }}
                tokens={{ childrenGap: 8 }}
              >
                {localFormData.objects.map((object, id) => (
                  <Tag
                    key={id}
                    id={id}
                    text={object}
                    isDelete
                    onDelete={localFormData.createType === 'no' ? onObjectRemove : () => {}}
                  />
                ))}
              </Stack>
            }
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default Basics;
