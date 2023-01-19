// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Panel,
  Stack,
  Dropdown,
  IDropdownOption,
  Text,
  ChoiceGroup,
  IChoiceGroupOption,
  TextField,
  PrimaryButton,
  DefaultButton,
  IDropdownProps,
} from '@fluentui/react';
import { Node, Edge } from 'react-flow-renderer';
import { clone, isEmpty } from 'ramda';

import { accelerationModelSelectorFactory } from '../../../../store/selectors';
import { FormattedModel, ModelProjectType } from '../../../../store/types';
import { ERROR_BLANK_VALUE } from '../../../../constant';
import { Acceleration, modelTypeOptions } from '../../../constant';
import { theme } from '../../../../constant/theme';
import { CaptureData, ModlePanelFormData, SkillNodeData } from '../../types';

import Tag from '../../../Models/Tag';
import SelectModelToolTip from './ToolTip/SelectModelToolTip';

interface Props {
  node: Node<SkillNodeData>;
  onDismiss: () => void;
  setElements: any;
  acceleraction: string;
}

const options: IChoiceGroupOption[] = [
  { key: 'yes', text: 'Yes' },
  { key: 'no', text: 'No' },
];

const ERROR_BETWEEN_0_100 = 'Value 0-100.';
const ERROR_LOWER_UPPER = 'Confidence lower bound needs to be smaller than upper bound';
const ERROR_UPPER_LOWER = 'Confidence upper bound needs to be bigger than lower bound';
const ERROR_BOTH_BLANK_BETWEEN_0_100 = 'Value cannot be blank. Value 1-100.';

const getLocalFormError = (form: ModlePanelFormData) => {
  const error = {
    projectType: '',
    model: '',
    captureData: '',
    confidence_lower: '',
    confidence_upper: '',
    max_images: '',
  };

  if (isEmpty(form.projectType)) error.projectType = ERROR_BLANK_VALUE;
  if (form.model.id === -1) error.model = ERROR_BLANK_VALUE;
  if (form.category === 'customvision') {
    if (form.captureData === '-') error.captureData = ERROR_BLANK_VALUE;
    if (form.captureData === 'yes') {
      if (form.confidence_lower < 0 || form.confidence_lower > 100)
        error.confidence_lower = ERROR_BETWEEN_0_100;
      if (form.confidence_lower > form.confidence_upper) error.confidence_lower = ERROR_LOWER_UPPER;
      if (form.confidence_upper < 0 || form.confidence_upper > 100)
        error.confidence_upper = ERROR_BETWEEN_0_100;
      if (form.confidence_upper < form.confidence_lower) error.confidence_upper = ERROR_UPPER_LOWER;
      if (form.max_images < 1 || form.max_images > 100) error.max_images = ERROR_BOTH_BLANK_BETWEEN_0_100;
    }
  }

  return error;
};

const ModelPanel = (props: Props) => {
  const { node, onDismiss, setElements, acceleraction } = props;
  const { data } = node;

  const [localForm, setLocalForm] = useState<ModlePanelFormData>({
    projectType: '',
    model: { id: -1, name: '' },
    category: '',
    captureData: '-',
    confidence_lower: 0,
    confidence_upper: 0,
    max_images: 0,
    error: {
      projectType: '',
      model: '',
      captureData: '',
      confidence_lower: '',
      confidence_upper: '',
      max_images: '',
    },
  });

  const selectedProjectTypeModelSelector = useMemo(
    () =>
      accelerationModelSelectorFactory(
        !isEmpty(localForm.projectType) ? [localForm.projectType as ModelProjectType] : [],
        acceleraction as Acceleration,
      ),
    [localForm.projectType, acceleraction],
  );
  const accelerationModelList = useSelector(selectedProjectTypeModelSelector) as FormattedModel[];

  const modelOptions: IDropdownOption[] = accelerationModelList.map((model) => ({
    key: model.id,
    text: model.name,
    data: model,
  }));

  useEffect(() => {
    if (data.configurations) {
      setLocalForm({
        ...(data.configurations as ModlePanelFormData),
        projectType: data.projectType,
      });
    }
  }, [data]);

  const onFormValidate = useCallback(() => {
    const error = getLocalFormError(localForm);

    if (Object.values(error).some((value) => !isEmpty(value))) {
      setLocalForm((prev) => ({
        ...prev,
        error,
      }));

      return true;
    }
    return false;
  }, [localForm]);

  const onProjectTypeSelect = useCallback((option: IDropdownOption) => {
    setLocalForm({
      projectType: option.key as ModelProjectType,
      model: { id: -1, name: '' },
      category: '',
      captureData: '-',
      confidence_lower: 0,
      confidence_upper: 0,
      max_images: 0,
      error: {
        model: '',
        captureData: '',
        confidence_lower: '',
        confidence_upper: '',
        max_images: '',
      },
    });
  }, []);

  const onModelSelect = useCallback((option: IDropdownOption) => {
    setLocalForm({
      model: { id: +option.key, name: option.text },
      projectType: option.data.projectType,
      category: option.data.category,
      captureData: '-',
      confidence_lower: 0,
      confidence_upper: 0,
      max_images: 0,
      error: {
        model: '',
        captureData: '',
        confidence_lower: '',
        confidence_upper: '',
        max_images: '',
      },
    });
  }, []);

  const onPanelDone = useCallback(() => {
    if (onFormValidate()) return;

    setElements((oldElements: (Node<SkillNodeData> | Edge<any>)[]) => {
      const idx = oldElements.findIndex((element) => element.id === node.id);

      const newElements = clone(oldElements);
      const selectedModel = accelerationModelList.find((model) => model.id === localForm.model.id);

      newElements.splice(idx, 1, {
        ...oldElements[idx],
        data: {
          ...oldElements[idx].data,
          configurations: localForm,
          projectType: localForm.projectType,
          isEditDone: true,
          model: {
            id: selectedModel.id,
            name: selectedModel.name,
            inputs: selectedModel.inputs,
            outputs: selectedModel.outputs,
            kan_id: selectedModel.kan_id,
          },
        },
      });

      return newElements;
    });

    onDismiss();
  }, [setElements, node, localForm, onDismiss, onFormValidate, accelerationModelList]);

  const onRenderFooterContent = useCallback(
    () => (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton onClick={onPanelDone}>Done</PrimaryButton>
        <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
      </Stack>
    ),
    [onDismiss, onPanelDone],
  );

  return (
    <Panel
      isOpen={true}
      onDismiss={onDismiss}
      hasCloseButton
      headerText={data.projectType === 'ObjectDetection' ? 'Object Detection Model' : 'Classification Model'}
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
    >
      <Stack styles={{ root: { marginTop: '30px' } }} tokens={{ childrenGap: 25 }}>
        <Text>
          {data.projectType === 'ObjectDetection'
            ? 'This node takes an input frame, runs your ML model on the image, and outputs the modified frame with detected objects information.'
            : 'This node takes an input frame from your object detection model, tags/classifies the detected objects, and outputs this information.'}
        </Text>
        <Stack>
          <Stack tokens={{ childrenGap: 5 }}>
            <Dropdown
              label="Model type"
              selectedKey={localForm.projectType}
              onChange={(_, option: IDropdownOption) => onProjectTypeSelect(option)}
              options={modelTypeOptions}
              required
              errorMessage={localForm.error.projectType}
            />
            <Text>
              This node takes an input frame from your object detection model, tags/classifies the detected
              objects, and outputs this information.
            </Text>
          </Stack>
        </Stack>
        <Stack tokens={{ childrenGap: 5 }}>
          {!isEmpty(localForm.projectType) && (
            <Dropdown
              label={
                localForm.projectType === 'ObjectDetection'
                  ? 'Select object detection model'
                  : 'Select classification model'
              }
              onRenderLabel={(props: IDropdownProps) => <SelectModelToolTip {...props} />}
              selectedKey={localForm.model.id}
              onChange={(_, option: IDropdownOption) => onModelSelect(option)}
              options={modelOptions}
              required
              errorMessage={localForm.error.model}
            />
          )}

          {localForm.model.id !== -1 && (
            <Stack horizontal tokens={{ childrenGap: 8 }}>
              {accelerationModelList
                .find((model) => model.id === localForm.model.id)
                .displayTagList.map((part, id) => (
                  <Tag key={id} id={id} text={part} />
                ))}
            </Stack>
          )}
        </Stack>

        {localForm.category === 'customvision' && (
          <>
            <Stack>
              <ChoiceGroup
                styles={{
                  flexContainer: {
                    display: 'flex',
                    '& div:not(:first-child)': {
                      marginLeft: '10px',
                    },
                  },
                }}
                options={options}
                selectedKey={localForm.captureData}
                onChange={(_, option: IChoiceGroupOption) =>
                  setLocalForm((prev) => ({
                    ...prev,
                    captureData: option.key as CaptureData,
                    error: { ...prev.error, captureData: '' },
                  }))
                }
                label="Capture Retraining Data?"
                required
              />
              {!!localForm.error.captureData && (
                <Text styles={{ root: { color: theme.palette.redDark } }}>{localForm.error.captureData}</Text>
              )}
            </Stack>
            {localForm.captureData === 'yes' && (
              <>
                <TextField
                  label="Confidence Lower Bound"
                  required
                  value={localForm.confidence_lower.toString()}
                  onChange={(_, newValue): void => {
                    setLocalForm((prev) => ({
                      ...prev,
                      confidence_lower: Number.isInteger(+newValue) ? +newValue : prev.confidence_lower,
                      error: { ...prev.error, confidence_lower: '', confidence_upper: '' },
                    }));
                  }}
                  errorMessage={localForm.error.confidence_lower}
                  placeholder="0-100"
                />
                <TextField
                  label="Confidence Upper Bound"
                  required
                  value={localForm.confidence_upper.toString()}
                  onChange={(_, newValue): void => {
                    setLocalForm((prev) => ({
                      ...prev,
                      confidence_upper: Number.isInteger(+newValue) ? +newValue : prev.confidence_upper,
                      error: { ...prev.error, confidence_lower: '', confidence_upper: '' },
                    }));
                  }}
                  errorMessage={localForm.error.confidence_upper}
                  placeholder="0-100"
                />
                <TextField
                  label="Number of captured training data"
                  required
                  value={localForm.max_images.toString()}
                  onChange={(_, newValue): void => {
                    setLocalForm((prev) => ({
                      ...prev,
                      max_images: Number.isInteger(+newValue) ? +newValue : prev.max_images,
                      error: { ...prev.error, max_images: '' },
                    }));
                  }}
                  errorMessage={localForm.error.max_images}
                  placeholder="Enter whole number"
                />
              </>
            )}
          </>
        )}
      </Stack>
    </Panel>
  );
};

export default ModelPanel;
