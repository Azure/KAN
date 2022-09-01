// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useMemo } from 'react';
import { DetailsList, Selection, IColumn, SelectionMode, Text, ActionButton } from '@fluentui/react';
import { useHistory, generatePath } from 'react-router-dom';

import { Camera } from '../../../store/cameraSlice';
import { theme, Url } from '../../../constant';

import MenuButton from '../../Common/MenuButton';

interface Props {
  cameraList: Camera[];
  onCameraListSelect: (ids: number[]) => void;
  onLiveFeedRedirect: (id: number) => void;
}

const CameraList = (props: Props) => {
  const { cameraList, onCameraListSelect } = props;

  const history = useHistory();

  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          const selectedCameraList = selection.getSelection() as Camera[];

          onCameraListSelect(selectedCameraList.map((c) => c.id));
        },
        selectionMode: SelectionMode.multiple,
      }),
    [onCameraListSelect],
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

  const columns: IColumn[] = [
    {
      key: 'name',
      minWidth: 50,
      maxWidth: 100,
      name: 'Name',
      fieldName: 'name',
    },
    {
      key: 'mediaType',
      minWidth: 250,
      maxWidth: 250,
      name: 'Camera or Video',
      fieldName: 'media_type',
      onRender: (item: Camera) => <Text>{item.media_type}</Text>,
    },
    {
      key: 'device',
      minWidth: 550,
      maxWidth: 550,
      name: 'Linked Devices',
      fieldName: '',
    },
    {
      key: 'url',
      minWidth: 550,
      maxWidth: 550,
      name: '',
      onRender: (item: Camera) => (
        <ActionButton
          styles={{
            root: { fontSize: '13px', color: theme.palette.themeSecondary },
            textContainer: { textDecoration: 'underline' },
            flexContainer: { flexDirection: 'row-reverse' },
          }}
          iconProps={{
            iconName: 'NavigateBackMirrored',
          }}
          onClick={() => onLiveFeedRedirect(item.id)}
        >
          view playback
        </ActionButton>
      ),
    },
    {
      key: 'control',
      minWidth: 50,
      maxWidth: 50,
      name: '',
      onRender: (item: Camera) => (
        <MenuButton iconName="More" onDeleteModalOpen={() => null} onTargetSelected={() => null} />
      ),
    },
  ];

  return (
    <DetailsList
      styles={{
        root: {
          '.ms-DetailsRow-cell': {
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.neutralPrimary,
            fontSize: '13px',
          },
        },
      }}
      items={cameraList}
      columns={columns}
      selection={selection}
    />
  );
};

export default CameraList;
