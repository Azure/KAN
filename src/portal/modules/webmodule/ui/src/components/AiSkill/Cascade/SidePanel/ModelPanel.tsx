// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
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
} from '@fluentui/react';
import { Node, Edge } from 'react-flow-renderer';
import { clone } from 'ramda';

import { accelerationModelSelectorFactory } from '../../../../store/selectors';
import { FormattedModel } from '../../../../store/types';
import { Acceleration } from '../../../constant';
import { theme } from '../../../../constant/theme';
import { CaptureData, ModlePanelFormData, SkillNodeData } from '../../types';

import Tag from '../../../Models/Tag';

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

const ERROR_BLANK_VALUE = 'Value cannot be blank.';
const ERROR_BETWEEN_0_100 = 'Value 0-100.';
const ERROR_LOWER_UPPER = 'Confidence lower bound needs to be smaller than upper bound';
const ERROR_BIGGER_LOWER = 'Confidence upper bound needs to be bigger than lower bound';
const ERROR_BOTH_BLANK_BETWEEN_0_100 = 'Value cannot be blank. Value 1-100.';

const ModelPanel = (props: Props) => {
  const { node, onDismiss, setElements, acceleraction } = props;
  const { data } = node;

  const [localForm, setLocalForm] = useState<ModlePanelFormData>({
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

  const accelerationModelList = useSelector(
    accelerationModelSelectorFactory([data.projectType], acceleraction as Acceleration),
  ) as FormattedModel[];

  const modelOptions: IDropdownOption[] = accelerationModelList.map((model) => ({
    key: model.id,
    text: model.name,
    data: model.category,
  }));

  useEffect(() => {
    if (data.configurations) {
      setLocalForm({
        ...(data.configurations as ModlePanelFormData),
      });
    }
  }, [data]);

  const onFormValidate = useCallback(() => {
    if (localForm.model.id === -1) {
      setLocalForm((prev) => ({
        ...prev,
        error: { ...prev.error, model: ERROR_BLANK_VALUE },
      }));
      return true;
    }

    if (localForm.category === 'customvision') {
      if (localForm.captureData === '-') {
        setLocalForm((prev) => ({
          ...prev,
          error: { ...prev.error, captureData: ERROR_BLANK_VALUE },
        }));
        return true;
      }

      if (
        (localForm.confidence_lower < 0 || localForm.confidence_lower > 100) &&
        localForm.captureData === 'yes'
      ) {
        setLocalForm((prev) => ({
          ...prev,
          error: { ...prev.error, confidence_lower: ERROR_BETWEEN_0_100 },
        }));
        return true;
      }

      if (localForm.confidence_lower > localForm.confidence_upper && localForm.captureData === 'yes') {
        setLocalForm((prev) => ({
          ...prev,
          error: {
            ...prev.error,
            confidence_lower: ERROR_LOWER_UPPER,
          },
        }));
        return true;
      }

      if (
        (localForm.confidence_upper < 0 || localForm.confidence_upper > 100) &&
        localForm.captureData === 'yes'
      ) {
        setLocalForm((prev) => ({
          ...prev,
          error: { ...prev.error, confidence_upper: ERROR_BETWEEN_0_100 },
        }));
        return true;
      }

      if (localForm.confidence_upper < localForm.confidence_lower && localForm.captureData === 'yes') {
        setLocalForm((prev) => ({
          ...prev,
          error: {
            ...prev.error,
            confidence_lower: ERROR_BIGGER_LOWER,
          },
        }));
        return true;
      }

      if ((localForm.max_images < 1 || localForm.max_images > 100) && localForm.captureData === 'yes') {
        setLocalForm((prev) => ({
          ...prev,
          error: { ...prev.error, max_images: ERROR_BOTH_BLANK_BETWEEN_0_100 },
        }));
        return true;
      }
    }

    return false;
  }, [localForm]);

  const onModelSelect = useCallback((option: IDropdownOption) => {
    setLocalForm({
      model: { id: +option.key, name: option.text },
      category: option.data,
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
          isEditDone: true,
          model: {
            id: selectedModel.id,
            name: selectedModel.name,
            inputs: selectedModel.inputs,
            outputs: selectedModel.outputs,
            symphony_id: selectedModel.symphony_id,
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
        <Stack tokens={{ childrenGap: 5 }}>
          <Dropdown
            label="Select Model"
            selectedKey={localForm.model.id}
            onChange={(_, option: IDropdownOption) => onModelSelect(option)}
            options={modelOptions}
            required
            errorMessage={localForm.error.model}
          />
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
                      error: { ...prev.error, confidence_lower: '' },
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
                      error: { ...prev.error, confidence_upper: '' },
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
