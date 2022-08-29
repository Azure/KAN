// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { useBoolean } from '@uifabric/react-hooks';
// import { useRouteMatch } from 'react-router-dom';
import {
  Modal,
  Stack,
  TextField,
  mergeStyleSets,
  MessageBar,
  MessageBarType,
  // Text,
  PrimaryButton,
  DefaultButton,
  Spinner,
  styled,
  ITextFieldProps,
  ITextFieldStyleProps,
  ITextFieldStyles,
  Label,
  IconButton,
} from '@fluentui/react';
import { equals } from 'ramda';

import { State as RootState } from 'RootStateType';
import {
  checkSettingStatus,
  updateNamespace,
  updateKey,
  thunkPostSetting,
  thunkGetAllCvProjects,
} from '../store/setting/settingAction';
import { theme } from '../constant';

import { CustomLabel } from './SettingPanel';
// import { WarningDialog } from './WarningDialog';

interface Props {
  isModalOpen: boolean;
  onModalClose: () => void;
  // isOpen: boolean;
  // onDismiss: () => void;
  canBeDismissed: boolean;
  showProjectDropdown: boolean;
}

const getClasses = () =>
  mergeStyleSets({
    scrollableContent: { width: '1080px', padding: '25px' },
    title: { fontSize: '20px', lineHeight: '24px', fontWeight: 600 },
    sbutTitle: { fontSize: '14px', lineHeight: '24px', fontWeight: 600 },
  });

const HorizontalTextField = styled<ITextFieldProps, ITextFieldStyleProps, ITextFieldStyles>(
  TextField,
  () => ({
    root: {
      '& .ms-Stack': {
        width: '200px',
        fontWeight: 400,
        color: theme.palette.neutralPrimary,
      },
    },
    wrapper: { display: 'flex' },
    field: { width: '480px' },
    errorMessage: { paddingLeft: '200px' },
  }),
);

const SettingModal = (props: Props) => {
  const { isModalOpen, onModalClose, canBeDismissed, showProjectDropdown } = props;

  const settingData = useSelector((state: RootState) => state.setting.current);
  const originSettingData = useSelector((state: RootState) => state.setting.origin);
  const error = useSelector((state: RootState) => state.setting.error);

  const dontNeedUpdateOrSave = equals(settingData, originSettingData);
  const [loading, setLoading] = useState(false);

  const classes = getClasses();
  const dispatch = useDispatch();

  useEffect(() => {
    if (showProjectDropdown) dispatch(thunkGetAllCvProjects());
  }, [dispatch, showProjectDropdown]);

  useEffect(() => {
    dispatch(checkSettingStatus());
  }, [dispatch]);

  const onConfirm = useCallback(async () => {
    try {
      setLoading(true);

      await dispatch(thunkPostSetting());

      setLoading(false);
      onModalClose();
    } catch (e) {
      alert(e);
    }
  }, [dispatch, onModalClose]);

  return (
    <Modal
      isOpen={isModalOpen}
      onDismiss={onModalClose}
      isBlocking={true}
      styles={{ scrollableContent: classes.scrollableContent }}
    >
      <Stack tokens={{ childrenGap: 25 }}>
        <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
          <Label styles={{ root: classes.title }}>Settings</Label>
          <IconButton
            iconProps={{ iconName: 'Cancel' }}
            onClick={onModalClose}
            disabled={!showProjectDropdown}
          />
        </Stack>
        <Stack tokens={{ childrenGap: 12 }}>
          <h4 className={classes.sbutTitle}>Azure Cognitive Services settings</h4>
          <HorizontalTextField
            label="Endpoint"
            required
            value={settingData.namespace}
            onChange={(_, value): void => {
              dispatch(updateNamespace(value));
            }}
            onRenderLabel={(props: ITextFieldProps) => <CustomLabel {...props} />}
            disabled={showProjectDropdown}
          />
          <HorizontalTextField
            label="Key"
            required
            value={settingData.key}
            onChange={(_, value): void => {
              dispatch(updateKey(value));
            }}
            onRenderLabel={(props: ITextFieldProps) => (
              <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 4 }}>
                <Label required={props.required}>{props.label}</Label>
                <IconButton iconProps={{ iconName: 'Info' }} />
              </Stack>
            )}
            disabled={showProjectDropdown}
          />
        </Stack>

        {error && <MessageBar messageBarType={MessageBarType.blocked}>{error.message}</MessageBar>}

        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <PrimaryButton text="Save" onClick={onConfirm} disabled={dontNeedUpdateOrSave || loading} />
          {showProjectDropdown && <DefaultButton text="Cancel" onClick={onModalClose} />}
        </Stack>

        {loading && <Spinner label="loading" />}
      </Stack>
    </Modal>
  );
};

export default SettingModal;
