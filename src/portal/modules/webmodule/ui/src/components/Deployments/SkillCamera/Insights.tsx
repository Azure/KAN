// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { Stack, Text, ProgressIndicator } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { JSONTree } from 'react-json-tree';

import { getDeploymentInsight } from '../../../store/deploymentSlice';

interface Props {
  deploymentSymphonyId: string;
  skillSymphonyId: string;
  cameraSymphonyId: string;
  status?: any;
}

const Insight = (props: Props) => {
  const { deploymentSymphonyId, skillSymphonyId, cameraSymphonyId } = props;

  const dispatch = useDispatch();

  const [isFetching, setIsFetching] = useState(false);
  const [localInsight, setLocalInsight] = useState(null);

  useEffect(() => {
    if (localInsight) return;

    (async () => {
      setIsFetching(true);
      const response = (await dispatch(
        getDeploymentInsight({ deploymentSymphonyId, skillSymphonyId, cameraSymphonyId }),
      )) as any;

      setLocalInsight(response.payload);
      setIsFetching(false);
    })();
  }, [dispatch, deploymentSymphonyId, skillSymphonyId, cameraSymphonyId, localInsight]);

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
