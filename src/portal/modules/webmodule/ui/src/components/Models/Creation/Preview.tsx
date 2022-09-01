// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack } from '@fluentui/react';

import { CreateModelFormData, PivotTabKey } from '../types';

import PreviewLabel from '../../Common/PreviewLabel';
import PreviewTag from '../../Common/PreviewTag';
import PreviewLink from '../../Common/PreviewLink';

interface Props {
  localFormData: CreateModelFormData;
  onLinkClick: (key: PivotTabKey) => void;
  customVisionName: string;
}

const Preview = (props: Props) => {
  const { localFormData, onLinkClick, customVisionName } = props;

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }} tokens={{ childrenGap: 15 }}>
      <PreviewLabel
        title="Name"
        content={localFormData.createType === 'yes' ? customVisionName : localFormData.name}
      />
      <PreviewLabel title="Source" content="Azure Custom Vision" />
      <PreviewLabel title="Trainable" content="True" />
      <PreviewLabel
        title="Type"
        content={localFormData.type === 'ObjectDetection' ? 'Object Detection' : 'Classification'}
      />
      {localFormData.type === 'Classification' && (
        <PreviewLabel
          title="Classification Types"
          content={localFormData.classification ?? localFormData.classification}
        />
      )}
      {/* <PreviewLabel
        title="Classification Types"
        content={localFormData.type === 'ObjectDetection' ? 'Object Detection' : 'Classification'}
      /> */}
      <PreviewLabel title="Objects" content={localFormData.objects.join(', ')} />
      <PreviewTag tagList={localFormData.tag_list} />
      <PreviewLink title="Edit model" onClick={() => onLinkClick('basics')} />
    </Stack>
  );
};

export default Preview;
