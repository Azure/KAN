// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Label, Text, TextField } from '@fluentui/react';
import { useDispatch, useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { Purpose, Shape } from '../../../store/shared/BaseShape';
import { onCreateConfigureAnnoClick, selectAllConfigureAnnos } from '../../../store/configureAnnoSlice';

import ConfigureScene from './ConfigureScene';

interface Props {
  camera: number;
  cascade: number;
}

const ConfigureSceneWrapper = (props: Props) => {
  const dispatch = useDispatch();

  const configureAnnoList = useSelector((state: RootState) => selectAllConfigureAnnos(state));

  return (
    <Stack horizontal tokens={{ childrenGap: 25 }}>
      <Stack grow={2}>
        <ConfigureScene annoList={configureAnnoList} />
      </Stack>
      <Stack grow={1} tokens={{ childrenGap: '20px' }}>
        <Stack styles={{ root: { padding: '6px 8px', border: '1px solid #EDEBE9' } }}>
          <Label required>param_453</Label>
          <Text
            styles={{ root: { color: '#0078D4', cursor: 'pointer' } }}
            onClick={() =>
              dispatch(onCreateConfigureAnnoClick({ shape: Shape.Line, purpose: Purpose.Counting }))
            }
          >
            Draw line
          </Text>
          <TextField value="(0.0,0.0) (0.0, 0.0)" styles={{ root: { width: '150px' } }} />
        </Stack>
        <Stack styles={{ root: { padding: '6px 8px', border: '1px solid #EDEBE9' } }}>
          <Label required>param_453</Label>
          <Label required>underscoredstop</Label>
          <Text
            onClick={() =>
              dispatch(onCreateConfigureAnnoClick({ shape: Shape.Polygon, purpose: Purpose.DangerZone }))
            }
          >
            Draw polygon
          </Text>
          <TextField value="(0.0,0.0) (0.0, 0.0)" />
        </Stack>
        <Stack styles={{ root: { padding: '6px 8px', border: '1px solid #EDEBE9' } }}>
          <Label required>param_453</Label>
          <Label required>general_entry</Label>
          <Text
            onClick={() =>
              dispatch(onCreateConfigureAnnoClick({ shape: Shape.BBox, purpose: Purpose.DangerZone }))
            }
          >
            Draw Box
          </Text>
          <TextField value="(0.0,0.0) (0.0, 0.0)" />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ConfigureSceneWrapper;
