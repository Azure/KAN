import React, { useCallback } from 'react';
import { Stack, DefaultButton, PrimaryButton } from '@fluentui/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { PivotTabKey, CreateDeploymentFormData } from '../types';
import { postRTSPCamera, postMediaSourceCamera } from '../../../store/cameraSlice';
import { Url } from '../../../constant';
import { thunkUpdateCameraSetting } from '../../../store/cameraSetting/cameraSettingActions';
import { getFilteredTagList } from '../../Common/TagPage';

interface Props {
  localPivotKey: PivotTabKey;
  onLinkClick: (key: PivotTabKey) => void;
  localFormData: CreateDeploymentFormData;
  isCreating: boolean;
  onCreatingChange: () => void;
}

const isDisable = (localFormData: CreateDeploymentFormData) => {
  // if (getFilteredTagList(localFormData.tagList).some((tag) => !!tag.errorMessage)) return true;
  // if (localFormData.name === '' || localFormData.location === -1) return true;
  // if (localFormData.error.name) return true;
  // if (localFormData.media_type === 'Camera') return localFormData.error.rTSP || localFormData.rtsp === '';
  // if (localFormData.media_type === 'Video')
  //   return localFormData.error.mediaSource || localFormData.media_source === '';
  return false;
};

const getNextPivotKey = (key: PivotTabKey): PivotTabKey => {
  switch (key) {
    case 'basics':
      return 'configure';
    case 'configure':
      return 'tag';
    case 'tag':
      return 'preview';
    default:
      return 'basics';
  }
};

const getPrevPivotKey = (key: PivotTabKey): PivotTabKey => {
  switch (key) {
    case 'configure':
      return 'basics';
    case 'tag':
      return 'configure';
    case 'preview':
      return 'tag';
    default:
      return 'basics';
  }
};

const Footer = (props: Props) => {
  const { localPivotKey, onLinkClick, localFormData, isCreating, onCreatingChange } = props;

  // const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();

  const isCreateDisable = isDisable(localFormData);

  return (
    <Stack
      horizontal
      tokens={{ childrenGap: 8 }}
      styles={{
        root: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          padding: '15px',
          borderTop: '1px solid rgba(204,204,204,0.8)',
          width: '100%',
        },
      }}
    >
      <PrimaryButton text="Review + Create" onClick={() => onLinkClick('preview')} />
      {localPivotKey !== 'preview' && (
        <DefaultButton
          text="Previous"
          iconProps={{ iconName: 'ChevronLeft' }}
          onClick={() => onLinkClick(getPrevPivotKey(localPivotKey))}
        />
      )}
      {localPivotKey !== 'preview' && (
        <DefaultButton
          text="Next"
          styles={{ flexContainer: { flexDirection: 'row-reverse' } }}
          iconProps={{ iconName: 'ChevronRight' }}
          onClick={() => onLinkClick(getNextPivotKey(localPivotKey))}
        />
      )}
    </Stack>
  );
};

export default Footer;
