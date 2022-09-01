// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback } from 'react';
import { Stack } from '@fluentui/react';
import { useDispatch } from 'react-redux';

import { ComputeDevice } from '../../../store/types';
import { deleteComputeDevice } from '../../../store/computeDeviceSlice';

import DeviceCard from './DeviceCard';
import DeviceSidePanel from '../DeviceSidePanel';
import DeleteModal from '../../Common/DeleteModal';

interface Props {
  deviceList: ComputeDevice[];
  onDeviceCardSelect: (checked: boolean, cameraId: number) => void;
}

const CardList = (props: Props) => {
  const { deviceList, onDeviceCardSelect } = props;

  const dispatch = useDispatch();

  const [localSelectedDevice, setLocalSelectedDevice] = useState<ComputeDevice | null>(null);
  const [deletedDeivce, setDeletedDeivce] = useState<ComputeDevice | null>(null);

  const onDeviceDelete = useCallback(async () => {
    await dispatch(deleteComputeDevice({ ids: [localSelectedDevice.id] }));
    setDeletedDeivce(null);
  }, [dispatch, localSelectedDevice]);

  const onSingleDeviceDelete = useCallback(async () => {
    const resolve = () => {
      setLocalSelectedDevice(null);
      setDeletedDeivce(null);
    };

    await dispatch(deleteComputeDevice({ ids: [deletedDeivce.id], resolve }));
  }, [deletedDeivce, dispatch]);

  return (
    <>
      <Stack styles={{ root: { marginTop: '40px' } }} tokens={{ childrenGap: 30 }} horizontal wrap>
        {deviceList.map((device, idx) => (
          <DeviceCard
            key={idx}
            device={device}
            onDeviceCardSelect={onDeviceCardSelect}
            onDeviceSelected={(inputDevice) => setLocalSelectedDevice(inputDevice)}
            onDeleteModalOpen={(inputDevice) => setDeletedDeivce(inputDevice)}
          />
        ))}
      </Stack>
      {localSelectedDevice && (
        <DeviceSidePanel
          selectedDeviceId={localSelectedDevice.id}
          onPanelClose={() => setLocalSelectedDevice(null)}
          onDeleteModalOpen={() => setDeletedDeivce(localSelectedDevice)}
        />
      )}

      {deletedDeivce && (
        <DeleteModal
          type="device"
          name={deletedDeivce.name}
          onDelte={onSingleDeviceDelete}
          onClose={() => setDeletedDeivce(null)}
        />
      )}
    </>
  );
};

export default CardList;
