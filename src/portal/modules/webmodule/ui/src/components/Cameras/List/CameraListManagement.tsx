// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback } from 'react';
import { useHistory, generatePath, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isEmpty } from 'ramda';
import { useBoolean } from '@uifabric/react-hooks';

import { State as RootState } from 'RootStateType';
import { Camera } from '../../../store/cameraSlice';
import { ViewMode } from '../types';
import { Url } from '../../../constant';

import CameraCardList from './CameraCardList';
import CameraList from './CameraList';
import UnAzureStorage from '../../Common/Dialog/UnAzureStorage';

interface Props {
  cameraList: Camera[];
  onCameraCardSelect: (checked: boolean, cameraId: number) => void;
  onCameraListSelect: (ids: number[]) => void;
  viewMode: ViewMode;
}

const CameraListManagement = (props: Props) => {
  const { cameraList, onCameraCardSelect, viewMode, onCameraListSelect } = props;

  const history = useHistory();
  const location = useLocation<{ isCreated?: boolean }>();

  const { storage_account, storage_container, subscription_id } = useSelector(
    (state: RootState) => state.setting,
  );
  const isNoAzureStorage = isEmpty(storage_account) && isEmpty(storage_container) && isEmpty(subscription_id);
  const [showUnAzureStorage, { toggle: togglesUnAzureStorage }] = useBoolean(
    !!location.state?.isCreated && isNoAzureStorage,
  );

  const onLiveFeedRedirect = useCallback(
    (id: number) => {
      history.push(
        generatePath(Url.CAMERAS_LIVE_FEED, {
          id,
        }),
      );
    },
    [history],
  );

  return (
    <>
      {viewMode === 'card' ? (
        <CameraCardList
          cameraList={cameraList}
          onCameraCardSelect={onCameraCardSelect}
          onLiveFeedRedirect={onLiveFeedRedirect}
        />
      ) : (
        <CameraList
          cameraList={cameraList}
          onCameraListSelect={onCameraListSelect}
          onLiveFeedRedirect={onLiveFeedRedirect}
        />
      )}
      {showUnAzureStorage && <UnAzureStorage onDismiss={togglesUnAzureStorage} />}
    </>
  );
};

export default CameraListManagement;
