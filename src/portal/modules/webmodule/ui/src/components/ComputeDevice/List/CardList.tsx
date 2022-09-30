// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback } from 'react';
import { Stack } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';

import { ComputeDevice } from '../../../store/types';
import { deleteComputeDevice } from '../../../store/computeDeviceSlice';
import { selectHasDeviceDeploymentSelectoryFactory } from '../../../store/deploymentSlice';

import DeviceCard from './DeviceCard';
import DeviceSidePanel from '../DeviceSidePanel';
import DeleteModal from '../../Common/DeleteModal';
import DefinitionPanel from '../../Common/DefinitionPanel';

interface Props {
  deviceList: ComputeDevice[];
  onDeviceCardSelect: (checked: boolean, cameraId: number) => void;
}

const CardList = (props: Props) => {
  const { deviceList, onDeviceCardSelect } = props;

  const dispatch = useDispatch();

  const [localSelectedDevice, setLocalSelectedDevice] = useState<ComputeDevice | null>(null);
  const [deletedDeivce, setDeletedDeivce] = useState<ComputeDevice | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<ComputeDevice | null>(null);
  const hasDeviceDeploy = useSelector(selectHasDeviceDeploymentSelectoryFactory(deletedDeivce?.id ?? 0));

  // const onDeviceDelete = useCallback(async () => {
  //   await dispatch(deleteComputeDevice({ ids: [localSelectedDevice.id] }));
  //   setDeletedDeivce(null);
  // }, [dispatch, localSelectedDevice]);

  const onSingleDeviceDelete = useCallback(async () => {
    const resolve = () => {
      setLocalSelectedDevice(null);
      setDeletedDeivce(null);
    };

    await dispatch(
      deleteComputeDevice({ id: deletedDeivce.id, symphony_id: deletedDeivce.symphony_id, resolve }),
    );
  }, [deletedDeivce, dispatch]);

  return (
    <>
      <Stack styles={{ root: { marginTop: '40px' } }} tokens={{ childrenGap: 30 }} horizontal wrap>
        {deviceList.map((device, idx) => (
          <DeviceCard
            key={idx}
            device={device}
            onDeviceCardSelect={onDeviceCardSelect}
            onDeviceSelected={() => setLocalSelectedDevice(device)}
            onDeleteModalOpen={() => setDeletedDeivce(device)}
            onDefinitionOpen={() => setSelectedDefinition(device)}
          />
        ))}
      </Stack>
      {localSelectedDevice && (
        <DeviceSidePanel
          deivceId={localSelectedDevice.id}
          symphony_id={localSelectedDevice.symphony_id}
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
          isUsed={hasDeviceDeploy}
        />
      )}
      {selectedDefinition && (
        <DefinitionPanel
          onPanelClose={() => setSelectedDefinition(null)}
          selectedTargetId={selectedDefinition.symphony_id}
          pageType="deivce"
          onDeleteModalOpen={() => setDeletedDeivce(selectedDefinition)}
        />
      )}
    </>
  );
};

export default CardList;
