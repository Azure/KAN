// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef, useCallback, useState } from 'react';
import { Stack, Text, Label, Icon, Link } from '@fluentui/react';
import { isEmpty } from 'ramda';
import { useDispatch } from 'react-redux';

import { CreateComputeDeviceFormData, clusterOptions } from '../types';
import { ClusterType } from '../../../store/types';
import { validateComputeDeviceConfig } from '../../../store/computeDeviceSlice';
import { getKeuernetesInfoClasses } from '../styles';

import HorizonChoiceGroup from '../../Common/HorizonChoiceGroup';

const INCORRECT_FILE_FORMATE = 'The format of config file is incorrect.';
const INCORRECT_FILE_EXTENSION = 'Incorrect filename extension.';

interface Props {
  localFormData: CreateComputeDeviceFormData;
  onFormDataChange: (formData: CreateComputeDeviceFormData) => void;
}

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const toImageContent = (bolbContent: string) => bolbContent.split(',')[1];

const KeuernetesInfo = (props: Props) => {
  const { localFormData, onFormDataChange } = props;

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const classes = getKeuernetesInfoClasses();
  const dispatch = useDispatch();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      setDragActive(false);

      const transfer = e.dataTransfer as DataTransfer;

      if (transfer && transfer.files[0] && transfer.files[0].type === 'application/x-yaml') {
        const file = (await toBase64(e.dataTransfer.files[0])) as string;

        const response = (await dispatch(
          validateComputeDeviceConfig({ config_data: toImageContent(file) }),
        )) as any;

        if (response.payload === 200) {
          onFormDataChange({
            ...localFormData,
            config_data: toImageContent(file),
            error: { ...localFormData.error, config_data: '' },
          });
        } else {
          onFormDataChange({
            ...localFormData,
            config_data: '',
            error: { ...localFormData.error, config_data: INCORRECT_FILE_FORMATE },
          });
        }
      } else {
        onFormDataChange({
          ...localFormData,
          config_data: '',
          error: { ...localFormData.error, config_data: INCORRECT_FILE_EXTENSION },
        });
      }
    },
    [localFormData, onFormDataChange, dispatch],
  );

  const handleChange = useCallback(
    async (e) => {
      e.preventDefault();

      if (e.target.files && e.target.files[0]) {
        const file = (await toBase64(e.target.files[0])) as string;

        const response = (await dispatch(
          validateComputeDeviceConfig({ config_data: toImageContent(file) }),
        )) as any;

        if (response.payload === 200) {
          onFormDataChange({
            ...localFormData,
            config_data: toImageContent(file),
            error: { ...localFormData.error, config_data: '' },
          });
        } else {
          onFormDataChange({
            ...localFormData,
            config_data: '',
            error: { ...localFormData.error, config_data: INCORRECT_FILE_FORMATE },
          });
        }
      }
    },
    [localFormData, onFormDataChange, dispatch],
  );

  const onButtonClick = useCallback(() => {
    fileInputRef.current.click();
  }, []);

  return (
    <Stack tokens={{ childrenGap: 10 }}>
      <Stack>
        <Label styles={{ root: { fontWeight: 600, lineHeight: '20px' } }}>Kubernetes Info</Label>
        <Stack>
          <Text>Provide some details of your Kubernetes device.</Text>
        </Stack>
      </Stack>
      <HorizonChoiceGroup
        label="Cluster Context"
        selectedKey={localFormData.cluster_type}
        options={clusterOptions}
        onChange={(_, option) =>
          onFormDataChange({
            ...localFormData,
            cluster_type: option.key as ClusterType,
            error: {
              ...localFormData.error,
            },
          })
        }
        required
      />
      {localFormData.cluster_type === 'other' && (
        <Stack horizontal>
          <Label className={classes.fileLabel} required>
            Config File
          </Label>
          <Stack>
            <form
              id="form-file-upload"
              onDragEnter={handleDrag}
              onSubmit={(e) => e.preventDefault()}
              className={classes.fileForm}
            >
              <input
                id="input-file-upload"
                ref={fileInputRef}
                type="file"
                onChange={handleChange}
                accept=".yaml,.yml"
                multiple={true}
                className={classes.fileInput}
              />
              <label id="label-file-upload" htmlFor="input-file-upload" className={classes.formLabel}>
                <Stack tokens={{ childrenGap: 15 }}>
                  <Icon iconName="CloudUpload" className={classes.icon} />
                  <Stack tokens={{ childrenGap: 5 }}>
                    <p className={classes.text}>Drag and drop files here</p>
                    <p className={classes.text}>or</p>
                    <Link className={classes.linkText} onClick={onButtonClick}>
                      Browse for files
                    </Link>
                  </Stack>
                </Stack>
              </label>
              {dragActive && (
                <div
                  id="drag-file-element"
                  className={classes.dragDiv}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                ></div>
              )}
            </form>
            {!!localFormData.error.config_data && (
              <Stack
                horizontal
                tokens={{ childrenGap: 8 }}
                verticalAlign="center"
                className={classes.errorWrapper}
              >
                <Icon iconName="StatusErrorFull" className={classes.errorIcon} />
                <Text className={classes.errorMessage}>{localFormData.error.config_data}</Text>
              </Stack>
            )}
            {!isEmpty(localFormData.config_data) && (
              <Stack
                horizontal
                tokens={{ childrenGap: 8 }}
                verticalAlign="center"
                className={classes.errorWrapper}
              >
                <Icon iconName="CompletedSolid" className={classes.successIcon} />
                <Text className={classes.successMessage}>Uploaded!</Text>
              </Stack>
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};

export default KeuernetesInfo;
