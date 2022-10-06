// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
import { Panel, Stack, PrimaryButton, DefaultButton, ProgressIndicator } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, generatePath } from 'react-router-dom';
import { isEmpty } from 'ramda';

import { State as RootState } from 'RootStateType';
import { getSingleComputeDevice, selectComputeDeviceById } from '../../store/computeDeviceSlice';
import { Url } from '../../constant';

import SidePanelLabel from '../Common/SidePanel/SidePanelLabel';
import SidePanelTag from '../Common/SidePanel/SidePanelTag';
import SidePanelStatus from '../Common/SidePanel/SidePanelStatus';

interface Props {
  onPanelClose: () => void;
  deivceId: number;
  symphony_id: string;
  onDeleteModalOpen: () => void;
}

const DeviceSidePanel = (props: Props) => {
  const { onPanelClose, deivceId, symphony_id, onDeleteModalOpen } = props;

  const device = useSelector((state: RootState) => selectComputeDeviceById(state, deivceId));

  const history = useHistory();
  const [isFetching, setIsFetching] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      setIsFetching(true);

      await dispatch(getSingleComputeDevice({ id: deivceId, symphony_id }));

      setIsFetching(false);
    })();
  }, [dispatch, deivceId, symphony_id]);

  const onRenderFooterContent = useCallback(
    () => (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton
          onClick={() => history.push(generatePath(Url.COMPUTE_DEVICE_EDIT_BASIC, { id: device.id }))}
        >
          Edit
        </PrimaryButton>
        <DefaultButton iconProps={{ iconName: 'Delete' }} onClick={onDeleteModalOpen}>
          Delete
        </DefaultButton>
      </Stack>
    ),
    [device.id, history, onDeleteModalOpen],
  );

  return (
    <Panel
      isOpen={true}
      onDismiss={onPanelClose}
      hasCloseButton
      headerText="Compute Devices Properties"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
      isBlocking={true}
      onOuterClick={() => null}
    >
      {isFetching ? (
        <ProgressIndicator />
      ) : (
        <Stack styles={{ root: { paddingTop: '25px' } }} tokens={{ childrenGap: 15 }}>
          <SidePanelLabel title="Device Name" content={device.name} />
          {device.is_k8s ? (
            <SidePanelLabel
              title="Cluster Context"
              content={device.cluster_type === 'current' ? 'Current cluster' : 'Other cluster'}
            />
          ) : (
            <>
              <SidePanelLabel title="IoT Hub Account" content={device.iothub} />
              <SidePanelLabel title="IoT Edge Device" content={device.iotedge_device} />
            </>
          )}
          <SidePanelLabel title="CPU Architecture" content={device.architecture} />
          <SidePanelLabel title="Acceleration" content={device.acceleration} />
          <SidePanelTag tagList={device.tag_list} />
          <SidePanelLabel
            title="Linked cameras"
            contentElement={
              !isEmpty(device.status) && (
                <Stack>
                  {Object.entries(device.status).map(([name, status], id) => (
                    <SidePanelStatus key={id} name={name} status={status} />
                  ))}
                </Stack>
              )
            }
          />
        </Stack>
      )}
    </Panel>
  );
};

export default DeviceSidePanel;
