import React from 'react';
import { Stack, IDropdownOption, Label, mergeStyleSets } from '@fluentui/react';

import { CreateModelFormData } from '../types';
import { ProjectType } from '../../../store/trainingProjectSlice';

import HorizontalTextField from '../../Common/HorizontalTextField';
import HorizontalDropdown from '../../Common/HorizontalDropdown';

interface Props {
  localFormData: CreateModelFormData;
  onFormDataChange: (formData: CreateModelFormData) => void;
}

const getClasses = () =>
  mergeStyleSets({
    root: {
      '& .ms-Label': {
        width: '250px',
      },
    },
    errorMessage: { paddingLeft: '250px' },
  });

const typeOptions: IDropdownOption[] = [
  { key: 'ObjectDetection', text: 'Object Detection' },
  { key: 'Classification', text: 'Classification' },
  { key: 'Segmentation', text: 'Segmentation' },
];

const formatOptions: IDropdownOption[] = [
  { key: '', text: '-' },
  { key: 'ONNX', text: 'ONNX' },
  { key: 'Pytorch', text: 'Pytorch' },
  { key: 'Tensorflow', text: 'Tensorflow' },
];

const OwnModelBasics = (props: Props) => {
  const { localFormData, onFormDataChange } = props;

  const classes = getClasses();

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }} tokens={{ childrenGap: 45 }}>
      <Stack tokens={{ childrenGap: 20 }}>
        <Label>Basic Info</Label>
        <HorizontalTextField
          styles={{
            root: classes.root,
            errorMessage: classes.errorMessage,
          }}
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
        <HorizontalDropdown
          styles={{
            root: classes.root,
            errorMessage: classes.errorMessage,
          }}
          label="Type"
          options={typeOptions}
          required
          selectedKey={localFormData.type}
          onChange={(_, option) =>
            onFormDataChange({
              ...localFormData,
              type: option.key as ProjectType,
              error: { ...localFormData.error, type: '' },
            })
          }
          errorMessage={localFormData.error.type}
        />
        <HorizontalDropdown
          styles={{
            root: classes.root,
            errorMessage: classes.errorMessage,
          }}
          label="Model Format"
          options={formatOptions}
          required
          selectedKey={localFormData.modelFormat}
          onChange={(_, option) =>
            onFormDataChange({
              ...localFormData,
              modelFormat: option.key as ProjectType,
              error: { ...localFormData.error, modelFormat: '' },
            })
          }
          errorMessage={localFormData.error.modelFormat}
        />
      </Stack>
      <Stack tokens={{ childrenGap: 20 }}>
        <Label>Model Info</Label>
        <HorizontalTextField
          styles={{
            root: classes.root,
            errorMessage: classes.errorMessage,
          }}
          label="Blobstorage Path to Model File"
          value={localFormData.modelFile}
          required
          onChange={(_, newValue) =>
            onFormDataChange({
              ...localFormData,
              modelFile: newValue,
              error: { ...localFormData.error, modelFile: '' },
            })
          }
          errorMessage={localFormData.error.modelFile}
        />
        <HorizontalTextField
          styles={{
            root: classes.root,
            errorMessage: classes.errorMessage,
          }}
          label="Blobstorage Path to Label File"
          value={localFormData.labelFile}
          onChange={(_, newValue) =>
            onFormDataChange({
              ...localFormData,
              labelFile: newValue,
              error: { ...localFormData.error, labelFile: '' },
            })
          }
          errorMessage={localFormData.error.labelFile}
        />
        <HorizontalTextField
          styles={{
            root: classes.root,
            errorMessage: classes.errorMessage,
          }}
          label="Description"
          value={localFormData.description}
          onChange={(_, newValue) =>
            onFormDataChange({
              ...localFormData,
              description: newValue,
              error: { ...localFormData.error, description: '' },
            })
          }
          errorMessage={localFormData.error.description}
          multiline
        />
      </Stack>
    </Stack>
  );
};

export default OwnModelBasics;
