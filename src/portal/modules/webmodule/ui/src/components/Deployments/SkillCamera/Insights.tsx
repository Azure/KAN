// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { Stack, Text, ProgressIndicator } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { JSONTree } from 'react-json-tree';

import { getDeploymentInsight } from '../../../store/deploymentSlice';

interface Props {
  deployment: number;
  skill_symphony_id: string;
  camera_symphony_id: string;
  status?: any;
}

const Insight = (props: Props) => {
  const { deployment, skill_symphony_id, camera_symphony_id } = props;

  const dispatch = useDispatch();

  const [isFetching, setIsFetching] = useState(false);
  const [localInsight, setLocalInsight] = useState(null);

  useEffect(() => {
    if (localInsight) return;

    (async () => {
      setIsFetching(true);
      const response = (await dispatch(
        getDeploymentInsight({ deployment, skill_symphony_id, camera_symphony_id }),
      )) as any;

      setLocalInsight(response.payload);
      setIsFetching(false);
    })();
  }, [dispatch, deployment, skill_symphony_id, camera_symphony_id, localInsight]);

  // console.log('localInsight', JSON.stringify(localInsight));
  // console.log('insightList', insightList);

  return (
    <Stack styles={{ root: { padding: '25px 30px' } }} tokens={{ childrenGap: 10 }}>
      <Text>The following metadata has been taken from your IoT Hub.</Text>

      {isFetching || !localInsight ? (
        <ProgressIndicator />
      ) : (
        <Stack style={{ height: '300px', width: '650px', overflowY: 'auto' }}>
          <JSONTree data={localInsight} />
        </Stack>
      )}
    </Stack>
  );
};

export default Insight;