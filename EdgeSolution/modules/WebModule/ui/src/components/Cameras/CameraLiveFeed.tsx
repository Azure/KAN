import React, { useCallback, useState } from 'react';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react';
import { useHistory } from 'react-router-dom';

import { Camera } from '../../store/cameraSlice';

import { RTSPVideo } from '../RTSPVideo';
import CameraSidePanel from './CameraSidePanel';

interface Props {
  camera: Camera;
}

const LiveFeed = (props: Props) => {
  const { camera } = props;

  const [isOpen, setIsOpen] = useState(false);

  const history = useHistory();

  const onPageRefresh = useCallback(() => {
    history.go(0);
  }, [history]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: {
        iconName: 'Refresh',
      },
      onClick: onPageRefresh,
    },
    {
      key: 'capture',
      text: 'Capture Image',
      iconProps: {
        iconName: 'Camera',
      },
    },
    {
      key: 'edit',
      text: 'Edit Camera',
      iconProps: {
        iconName: 'Edit',
      },
      onClick: () => setIsOpen(true),
    },
  ];

  return (
    <>
      <CommandBar items={commandBarItems} styles={{ root: { paddingLeft: '0', marginBottom: '10px' } }} />
      <div style={{ height: '85%' }}>
        <RTSPVideo cameraId={camera.id} />
      </div>
      {isOpen && <CameraSidePanel camera={camera} onPanelClose={() => setIsOpen(false)} />}
    </>
  );
};

export default LiveFeed;
