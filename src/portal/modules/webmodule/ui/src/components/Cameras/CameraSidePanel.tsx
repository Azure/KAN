// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useEffect } from 'react';
import { Panel, Stack, PrimaryButton, DefaultButton, Link, ProgressIndicator } from '@fluentui/react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, generatePath } from 'react-router-dom';
import { isEmpty } from 'ramda';

import { State as RootState } from 'RootStateType';
import { selectCameraById, getSingleCamera } from '../../store/cameraSlice';
import { selectAllLocations } from '../../store/locationSlice';
import { Url } from '../../constant';

import SidePanelLabel from '../Common/SidePanel/SidePanelLabel';
import SidePanelTag from '../Common/SidePanel/SidePanelTag';
import SidePanelStatus from '../Common/SidePanel/SidePanelStatus';

interface Props {
  onPanelClose: () => void;
  selectedCameraId: number;
  onDeleteModalOpen: () => void;
}

const CameraSidePanel = (props: Props) => {
  const { onPanelClose, selectedCameraId, onDeleteModalOpen } = props;

  const camera = useSelector((state: RootState) => selectCameraById(state, selectedCameraId));
  const locationList = useSelector((state: RootState) => selectAllLocations(state));

  const dispatch = useDispatch();
  const history = useHistory();

  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      await dispatch(getSingleCamera(selectedCameraId));
      setIsFetching(false);
    })();
  }, [dispatch, selectedCameraId]);

  const onRenderFooterContent = useCallback(
    () => (
      <Stack tokens={{ childrenGap: 5 }} horizontal>
        <PrimaryButton
          onClick={() => history.push(generatePath(Url.CAMERAS_EDIT, { step: 'basics', id: camera.id }))}
        >
          Edit
        </PrimaryButton>
        <DefaultButton iconProps={{ iconName: 'Delete' }} onClick={onDeleteModalOpen}>
          Delete
        </DefaultButton>
      </Stack>
    ),
    [history, camera, onDeleteModalOpen],
  );

  return (
    <Panel
      isOpen={true}
      onDismiss={onPanelClose}
      hasCloseButton
      headerText="Properties"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
      onOuterClick={() => null}
    >
      {isFetching ? (
        <ProgressIndicator />
      ) : (
        <Stack styles={{ root: { paddingTop: '25px' } }} tokens={{ childrenGap: 15 }}>
          <SidePanelLabel title="Camera name" content={camera.name} />
          <SidePanelLabel title="Camera or Video?" content={camera.media_type} />
          <SidePanelLabel title="RTSP URL" content={camera.rtsp} />
          <SidePanelLabel
            title="Location"
            content={locationList.find((location) => location.id === camera.location).name}
          />
          <SidePanelTag tagList={camera.tag_list} />
          <SidePanelLabel
            title="Linked compute devices"
            contentElement={
              !isEmpty(camera.status) && (
                <Stack>
                  {Object.entries(camera.status).map(([name, status], id) => (
                    <SidePanelStatus key={id} name={name} status={status} />
                  ))}
                </Stack>
              )
            }
          />
          <Link
            onClick={() => history.push(generatePath(Url.CAMERAS_LIVE_FEED, { id: camera.id }))}
            underline
          >
            View Feed/Playback
          </Link>
        </Stack>
      )}
    </Panel>
  );
};

export default CameraSidePanel;
