// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
import {
  Panel,
  Stack,
  Text,
  IChoiceGroupOption,
  PrimaryButton,
  DefaultButton,
  TextField,
  Dropdown,
  IDropdownOption,
  ChoiceGroup,
  ITextFieldProps,
} from '@fluentui/react';
import { Node, Edge } from 'react-flow-renderer';
import { clone } from 'ramda';

import { theme, ERROR_BLANK_VALUE } from '../../../../constant';
import { InsightsOverLayType, ExportPanelFromData, SkillNodeData, ExportType } from '../../types';

import DelayBufferToolTip from './ToolTip/DelayBufferToolTip';

interface Props {
  node: Node<SkillNodeData>;
  onDismiss: () => void;
  setElements: any;
}

const ERROR_GREAT_THAN_ONE = 'Value must be equal to or greater than 1.';
const ERROR_GREAT_THAN_ZERO = 'Value must be greater than 0.';

const durationOptions: IDropdownOption[] = [
  { key: '10', text: '10s' },
  { key: '20', text: '20s' },
];

const insightsOverlayOptions: IChoiceGroupOption[] = [
  { key: 'true', text: 'Yes' },
  { key: 'false', text: 'No' },
];

const getExportNodeHeader = (exportType: ExportType) => {
  switch (exportType) {
    case 'snippet':
      return 'Export Video Snippet';
    case 'iotHub':
      return 'Export (Send Insights to IoT Hub)';
    case 'mqtt':
      return 'Export (Send Insights to MQTT Endpoint)';
    case 'iotEdge':
      return 'Export (Send Insights to IoT Edge Module)';
    case 'http':
      return 'Export (Send Insights to HTTP Endpoint)';
    default:
      return '';
  }
};

const getExportNodeDesc = (exportType: ExportType) => {
  switch (exportType) {
    case 'snippet':
      return 'Use this node to record snippets from your cameras at a set interval and duration, and save them to storage.';
    case 'iotHub':
      return 'Use this node to send insights from this skill directly to your IoT Hub account.';
    case 'iotEdge':
      return 'Use this node to send metadata from this skill directly to your IoT Edge Modules.';
    case 'http':
      return 'Use this node to send insights from this skill directly to your HTTP endpoint.';
    case 'mqtt':
      return 'Use this node to send insights from this skill directly to your MQTT endpoint.';
    default:
      return '';
  }
};

const getDelayBufferDefaultValue = (exportType: ExportType) => {
  switch (exportType) {
    case 'snippet':
      return '2'; // unit: minutes
    case 'iotHub':
      return '30'; // unit: second
    case 'mqtt':
      return '30'; // unit: second
    case 'iotEdge':
      return '10'; // unit: second
    case 'http':
      return '';
    default:
      return '';
  }
};

const ModelPanel = (props: Props) => {
  const { node, onDismiss, setElements } = props;
  const { data } = node;

  const [localForm, setLocalForm] = useState<ExportPanelFromData>({
    filename_prefix: '',
    recording_duration: '',
    insights_overlay: '',
    delay_buffer: getDelayBufferDefaultValue(data.exportType),
    module_name: '',
    module_input: '',
    url: '',
    error: {
      filename_prefix: '',
      recording_duration: '',
      insights_overlay: '',
      delay_buffer: '',
      module_name: '',
      module_input: '',
      url: '',
    },
  });

  useEffect(() => {
    if (data.configurations) {
      setLocalForm({
        ...(data.configurations as ExportPanelFromData),
        error: {
          filename_prefix: '',
          recording_duration: '',
          insights_overlay: '',
          delay_buffer: '',
          module_name: '',
          url: '',
        },
      });
    }
  }, [data]);

  const onFormValidate = useCallback(() => {
    if ((data.exportType as ExportType) === 'http' && localForm.url === '') {
      setLocalForm((prev) => ({
        ...prev,
        error: { ...prev.error, url: ERROR_BLANK_VALUE },
      }));
      return true;
    }

    if ((data.exportType as ExportType) === 'snippet') {
      if (localForm.filename_prefix === '') {
        setLocalForm((prev) => ({
          ...prev,
          error: { ...prev.error, filename_prefix: ERROR_BLANK_VALUE },
        }));
        return true;
      }

      if (localForm.recording_duration === '') {
        setLocalForm((prev) => ({
          ...prev,
          error: { ...prev.error, recording_duration: ERROR_BLANK_VALUE },
        }));
        return true;
      }

      if (localForm.insights_overlay === '') {
        setLocalForm((prev) => ({
          ...prev,
          error: { ...prev.error, insightsOverLay: ERROR_BLANK_VALUE },
        }));
        return true;
      }
    }

    if ((data.exportType as ExportType) === 'iotEdge') {
      if (localForm.module_name === '') {
        setLocalForm((prev) => ({
          ...prev,
          error: { ...prev.error, module_name: ERROR_BLANK_VALUE },
        }));
        return true;
      }

      if (localForm.module_input === '') {
        setLocalForm((prev) => ({
          ...prev,
          error: { ...prev.error, module_input: ERROR_BLANK_VALUE },
        }));
        return true;
      }
    }

    if (['iotHub', 'iotEdge', 'snippet', 'mqtt'].includes(data.exportType) && localForm.delay_buffer === '') {
      setLocalForm((prev) => ({
        ...prev,
        error: { ...prev.error, delay_buffer: ERROR_BLANK_VALUE },
      }));
      return true;
    }

    if ((data.exportType as ExportType) === 'snippet' && +localForm.delay_buffer < 1) {
      setLocalForm((prev) => ({
        ...prev,
        error: { ...prev.error, delay_buffer: ERROR_GREAT_THAN_ONE },
      }));
      return true;
    }

    if (['iotHub', 'iotEdge'].includes(data.exportType) && +localForm.delay_buffer <= 0) {
      setLocalForm((prev) => ({
        ...prev,
        error: { ...prev.error, delay_buffer: ERROR_GREAT_THAN_ZERO },
      }));
      return true;
    }

    return false;
  }, [localForm, data]);

  const onPanelDone = useCallback(() => {
    if (onFormValidate()) return;

    setElements((oldElements: (Node<SkillNodeData> | Edge<any>)[]) => {
      const idx = oldElements.findIndex((element) => element.id === node.id);

      const newElements = clone(oldElements);
      newElements.splice(idx, 1, {
        ...oldElements[idx],
        data: { ...oldElements[idx].data, configurations: localForm, isEditDone: true },
      });

      return newElements;
    });

    onDismiss();
  }, [setElements, node, localForm, onDismiss, onFormValidate]);

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
      headerText={getExportNodeHeader(data.exportType)}
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
    >
      <Stack styles={{ root: { marginTop: '30px' } }} tokens={{ childrenGap: 25 }}>
        <Text>{getExportNodeDesc(data.exportType)}</Text>
        {(data.exportType as ExportType) === 'snippet' && (
          <>
            <TextField
              label="Filename Prefix"
              value={localForm.filename_prefix}
              required
              onChange={(_, newValue) =>
                setLocalForm((prev) => ({
                  ...prev,
                  filename_prefix: newValue,
                  error: { ...prev.error, filename_prefix: '' },
                }))
              }
              errorMessage={localForm.error.filename_prefix}
            />
            <Dropdown
              label="Snippet Duration"
              selectedKey={localForm.recording_duration}
              options={durationOptions}
              required
              onChange={(_, option: IDropdownOption) =>
                setLocalForm((prev) => ({
                  ...prev,
                  recording_duration: option.key as string,
                  error: { ...prev.error, recording_duration: '' },
                }))
              }
              errorMessage={localForm.error.recording_duration}
            />
            <Stack>
              <ChoiceGroup
                label="Insights Overlay"
                selectedKey={localForm.insights_overlay}
                options={insightsOverlayOptions}
                required
                styles={{
                  flexContainer: {
                    display: 'flex',
                    '& div:not(:first-child)': {
                      marginLeft: '10px',
                    },
                  },
                }}
                onChange={(_, option: IChoiceGroupOption) =>
                  setLocalForm((prev) => ({ ...prev, insights_overlay: option.key as InsightsOverLayType }))
                }
              />
              {!!localForm.error.insights_overlay && (
                <Text styles={{ root: { color: theme.palette.redDark } }}>
                  {localForm.error.insights_overlay}
                </Text>
              )}
            </Stack>
          </>
        )}
        {(data.exportType as ExportType) === 'iotEdge' && (
          <>
            <TextField
              label="IoT Edge Module Name"
              value={localForm.module_name}
              required
              onChange={(_, newValue) =>
                setLocalForm((prev) => ({
                  ...prev,
                  module_name: newValue,
                  error: { ...prev.error, module_name: '' },
                }))
              }
              errorMessage={localForm.error.module_name}
            />
            <TextField
              label="IoT Edge Module Input"
              value={localForm.module_input}
              required
              onChange={(_, newValue) =>
                setLocalForm((prev) => ({
                  ...prev,
                  module_input: newValue,
                  error: { ...prev.error, module_input: '' },
                }))
              }
              errorMessage={localForm.error.module_input}
            />
          </>
        )}
        {['snippet', 'iotHub', 'iotEdge', 'mqtt'].includes(data.exportType) && (
          <TextField
            label="Delay Buffer"
            onRenderLabel={(props: ITextFieldProps) => <DelayBufferToolTip {...props} />}
            value={localForm.delay_buffer}
            required
            placeholder={
              (data.exportType as ExportType) === 'snippet'
                ? 'minutes (Equal or Greater than 1)'
                : 'seconds (greater than 0)'
            }
            onChange={(_, newValue) =>
              setLocalForm((prev) => ({
                ...prev,
                delay_buffer: +newValue >= 0 ? newValue : prev.delay_buffer,
                error: { ...prev.error, delay_buffer: '' },
              }))
            }
            errorMessage={localForm.error.delay_buffer}
          />
        )}
        {data.exportType === 'http' && (
          <TextField
            label="Endpoint URL"
            value={localForm.url}
            required
            onChange={(_, newValue) =>
              setLocalForm((prev) => ({
                ...prev,
                url: newValue,
                error: { ...prev.error, url: '' },
              }))
            }
            errorMessage={localForm.error.url}
          />
        )}
      </Stack>
    </Panel>
  );
};

export default ModelPanel;
