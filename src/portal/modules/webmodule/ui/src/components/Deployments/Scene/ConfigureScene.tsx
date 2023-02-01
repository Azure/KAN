// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import Konva from 'konva';
import { Stage, Image as KonvaImage, Layer } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';
import { useSelector, useDispatch } from 'react-redux';

import { State as RootState } from 'RootStateType';
import {
  // onCreateConfigureAnnoClick,
  // selectAllConfigureAnnos,
  CreatingState,
  updateVideoAnno,
  onCreatingPoint,
  removeVideoAnno,
} from '../../../store/configureAnnoSlice';
import useImage from '../../LabelingPage/util/useImage';
import { Shape, VideoAnno } from '../../../store/shared/BaseShape';
import { isCountingLine } from '../../../store/shared/VideoAnnoUtil';

import { VideoAnnosGroup } from '../../LiveViewScene/VideoAnnosGroup';
import { plusOrderVideoAnnos } from '../../../utils/plusVideoAnnos';

interface Props {
  annoList: VideoAnno[];
}

/**
 * Because the layer has been scaled to fit the window size, we need to transform the coordinate to the
 * original image coordinate
 * @param layer
 */
const getRelativePosition = (layer: Konva.Layer): { x: number; y: number } => {
  const transform = layer.getAbsoluteTransform().copy();
  transform.invert();
  const pos = layer.getStage().getPointerPosition();
  return transform.point(pos);
};

const ConfigureScene = (props: Props) => {
  const { annoList: configureAnnoList } = props;

  const { creatingState, shape: creatingShape } = useSelector((state: RootState) => state.configureAnno);

  const divRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const layerRef = useRef<Konva.Layer>(null);
  const dispatch = useDispatch();

  const [imgEle, status, { width: imgWidth, height: imgHeight }] = useImage(
    'https://images.pexels.com/photos/20787/pexels-photo.jpg',
    '',
    true,
    false,
  );

  useEffect(() => {
    const { width: divWidth, height: divHeight } = divRef.current.getBoundingClientRect();
    stageRef.current.width(divWidth);
    stageRef.current.height(divHeight);
  }, []);

  /* Fit Image to Stage */
  useEffect(() => {
    if (imgWidth !== 0 && imgHeight !== 0) {
      const { width: stageWidth, height: stageHeight } = stageRef.current.size();
      const scale = Math.min(stageWidth / imgWidth, stageHeight / imgHeight);
      layerRef.current.scale({ x: scale, y: scale });

      const offsetX = (stageWidth - imgWidth * scale) / 2;
      const offsetY = (stageHeight - imgHeight * scale) / 2;
      layerRef.current.position({ x: offsetX, y: offsetY });
    }
  }, [imgHeight, imgWidth]);

  const onMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>): void => {
      if (creatingState === CreatingState.Disabled) return;

      const { x, y } = getRelativePosition(e.target.getLayer());

      dispatch(onCreatingPoint({ point: { x, y }, cameraId: 8 }));
    },
    [creatingState, dispatch],
  );

  const onAnnUpdate = useCallback(
    (id, changes) => {
      dispatch(updateVideoAnno({ id, changes }));
    },
    [dispatch],
  );

  const onMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>): void => {
      if (creatingState !== CreatingState.Creating) return;

      const { x, y } = getRelativePosition(e.target.getLayer());
      if (creatingShape === Shape.BBox)
        onAnnUpdate(configureAnnoList[configureAnnoList.length - 1].id, { x2: x, y2: y });
      else if (creatingShape === Shape.Polygon || creatingShape === Shape.Line)
        onAnnUpdate(configureAnnoList[configureAnnoList.length - 1].id, {
          idx: -1,
          vertex: { x, y },
        });
    },
    [creatingState, onAnnUpdate, creatingShape, configureAnnoList],
  );

  // const AOIs = useMemo(() => {
  //   return configureAnnoList.filter(isAOIShape);
  // }, [configureAnnoList]);

  const countingLines = useMemo(() => {
    return plusOrderVideoAnnos(configureAnnoList.filter(isCountingLine));
  }, [configureAnnoList]);

  return (
    <div
      ref={divRef}
      style={{ width: '100%', height: '100%', backgroundColor: 'black', minHeight: '500px' }}
      tabIndex={0}
    >
      <Stage ref={stageRef} style={{ cursor: creatingState !== CreatingState.Disabled ? 'crosshair' : '' }}>
        <Layer ref={layerRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove}>
          <KonvaImage image={imgEle} ref={imgRef} />
          {
            /* Render when image is loaded to prevent the shapes show in unscale size */
            status === 'loaded' && (
              <>
                {/** AOIs */}
                {/* <VideoAnnosGroup
                  imgWidth={imgWidth}
                  imgHeight={imgHeight}
                  videoAnnos={AOIs}
                  updateVideoAnno={(id, changes) => updateVideoAnno({ id, changes })}
                  removeVideoAnno={removeVideoAnno}
                  visible={true}
                  creatingState={creatingState}
                  needMask={false}
                /> */}
                {/** Counting Lines */}
                <VideoAnnosGroup
                  imgWidth={imgWidth}
                  imgHeight={imgHeight}
                  videoAnnos={countingLines}
                  updateVideoAnno={onAnnUpdate}
                  removeVideoAnno={(id) => dispatch(removeVideoAnno(id))}
                  visible={true}
                  creatingState={creatingState}
                  needMask={false}
                />
                {/** Danger Zones */}
                {/* <VideoAnnosGroup
                  imgWidth={imgWidth}
                  imgHeight={imgHeight}
                  videoAnnos={dangerZone}
                  updateVideoAnno={updateVideoAnno}
                  removeVideoAnno={removeVideoAnno}
                  visible={dangerZoneVisible}
                  creatingState={creatingState}
                  needMask={false}
                  color="yellow"
                /> */}
              </>
            )
          }
        </Layer>
      </Stage>
    </div>
  );
};

export default ConfigureScene;
