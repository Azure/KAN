// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect, useRef } from 'react';

import { useSelector } from 'react-redux';

import rootRquest from '../../store/rootRquest';
import { useInterval } from '../../hooks/useInterval';
import { handleAxiosError } from '../../utils/handleAxiosError';
import { selectCameraByKanId } from '../../store/cameraSlice';

type RTSPVideoProps = {
  cameraId: string;
  onStreamCreated?: (streamId: string) => void;
  partId?: number;
  onStreamConnected?: () => void;
};

export const RTSPVideoComponent: React.FC<RTSPVideoProps> = ({
  cameraId,
  onStreamCreated,
  partId = null,
  onStreamConnected,
}) => {
  const camera = useSelector(selectCameraByKanId(cameraId));

  const [streamId, setStreamId] = useState<string>('');

  const onDisconnect = (): void => {
    setStreamId('');
    fetch(`/api/streams/${streamId}/disconnect`).catch(console.error);
  };

  const onUnmountComponent = useRef<any>(null);
  onUnmountComponent.current = () => {
    if (streamId !== '') {
      onDisconnect();
    }
  };

  useEffect(() => {
    return () => onUnmountComponent.current();
  }, []);

  useInterval(
    () => {
      rootRquest.get(`/api/streams/${streamId}/keep_alive`).catch(console.error);
    },
    streamId ? 3000 : null,
  );

  useEffect(() => {
    if (typeof cameraId !== 'string') return;

    const url =
      partId === null
        ? `/api/streams/connect/?camera_id=${cameraId}`
        : `/api/streams/connect/?part_id=${partId}&camera_id=${cameraId}`;
    rootRquest
      .get(url)
      .then(({ data }) => {
        setStreamId(data.stream_id);
        onStreamCreated(data.stream_id);

        if (onStreamConnected) {
          onStreamConnected();
        }

        return void 0;
      })
      .catch(handleAxiosError)
      .catch((err) => {
        console.error(err);
      });
    // Ignore the dependency `onStreamCreated` because it may cause unecessary triggered in the useEffect
  }, [partId, cameraId, onStreamConnected]);

  const src = streamId ? `/api/streams/${streamId}/video_feed` : '';

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#F3F2F1', position: 'relative' }}>
      {src ? (
        <>
          {camera.is_live && (
            <div
              style={{
                position: 'absolute',
                left: 20,
                top: 20,
                background: '#E00B1C',
                borderRadius: '4px',
                color: 'white',
                padding: '5px 8px',
                fontWeight: 'bold',
              }}
            >
              • LIVE
            </div>
          )}
          <img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
        </>
      ) : null}
    </div>
  );
};

export const RTSPVideo = React.memo(RTSPVideoComponent);
