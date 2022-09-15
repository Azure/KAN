// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  Stack,
  TextField,
  mergeStyleSets,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  DefaultButton,
  styled,
  ITextFieldProps,
  ITextFieldStyleProps,
  ITextFieldStyles,
  Label,
  IconButton,
  Text,
} from '@fluentui/react';

import { State as RootState } from 'RootStateType';
import {
  checkSettingStatus,
  // updateNamespace,
  // updateKey,
  thunkPostSetting,
  thunkGetAllCvProjects,
} from '../store/setting/settingAction';
import { theme } from '../constant';

interface Props {
  isModalOpen: boolean;
  onModalClose: () => void;
  canBeDismissed: boolean;
  showProjectDropdown: boolean;
}

const getClasses = () =>
  mergeStyleSets({
    scrollableContent: { width: '1080px', padding: '25px' },
    title: { fontSize: '20px', lineHeight: '24px', fontWeight: 600 },
    describe: { fontSize: '13px', lineHeight: '18px', fontWeight: 400 },
    sbutTitle: { fontSize: '14px', lineHeight: '24px', fontWeight: 600 },
  });

const HorizontalTextField = styled<ITextFieldProps, ITextFieldStyleProps, ITextFieldStyles>(
  TextField,
  () => ({
    root: {
      '& .ms-Label': {
        fontWeight: 400,
        width: '200px',
        color: theme.palette.neutralPrimary,
      },
    },
    wrapper: { display: 'flex' },
    field: { width: '480px' },
    errorMessage: { paddingLeft: '200px' },
  }),
);

// const NormalLabel = (props: ITextFieldProps): JSX.Element => {
//   return (
//     <Stack horizontal verticalAlign="center">
//       <Label styles={{ root: { fontWeight: 400 } }} required={props.required}>
//         {props.label}
//       </Label>
//       <IconButton iconProps={{ iconName: 'Info' }} />
//     </Stack>
//   );
// };

const SettingModal = (props: Props) => {
  const { isModalOpen, onModalClose, canBeDismissed, showProjectDropdown } = props;

  const settingData = useSelector((state: RootState) => state.setting);
  // const originSettingData = useSelector((state: RootState) => state.setting.origin);
  const error = useSelector((state: RootState) => state.setting.error);

  // const dontNeedUpdateOrSave = equals(settingData, originSettingData);
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
        <Text styles={{ root: classes.describe }}>These settings are autofilled with your credentials.</Text>
        <Stack tokens={{ childrenGap: 12 }}>
          <h4 className={classes.sbutTitle}>Service Principal Settings</h4>
          <HorizontalTextField
            label="tenantId"
            required
            value={settingData.tenant_id}
            disabled={true}
            // styles={{ root: classes.contentTitle }}
          />
          <HorizontalTextField label="clientId" required value={settingData.client_id} disabled={true} />
          <HorizontalTextField
            label="clientSecret"
            required
            value={settingData.client_secret}
            disabled={true}
            type="password"
          />
        </Stack>

        <Stack tokens={{ childrenGap: 12 }}>
          <h4 className={classes.sbutTitle}>Azure Storage Settings</h4>
          <HorizontalTextField
            label="storageAccount"
            required
            value={settingData.storage_account}
            disabled={true}
          />
          <HorizontalTextField
            label="storageContainer"
            required
            value={settingData.storage_container}
            disabled={true}
          />
          <HorizontalTextField
            label="subscriptionId"
            required
            value={settingData.subscription_id}
            disabled={true}
          />
        </Stack>

        <Stack tokens={{ childrenGap: 12 }}>
          <h4 className={classes.sbutTitle}>Azure Cognitive Services Settings</h4>
          <HorizontalTextField label="Endpoint" value={settingData.endpoint} disabled={true} />
          <HorizontalTextField label="Key" value={settingData.training_key} disabled={true} type="password" />
        </Stack>

        {error && <MessageBar messageBarType={MessageBarType.blocked}>{error.message}</MessageBar>}

        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <PrimaryButton text="Save" onClick={onConfirm} disabled={true} />
          {showProjectDropdown && <DefaultButton text="Cancel" onClick={onModalClose} />}
        </Stack>
      </Stack>
    </Modal>
  );
};

export default SettingModal;
