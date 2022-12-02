import React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react';

interface Props {
  onDismiss: () => void;
}

const UnCustomVision = (props: Props) => {
  const { onDismiss } = props;

  return (
    <Dialog
      hidden={false}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'No Custom Vision access',
        subText:
          'You need Custom Vision access in order to create a custom model. Please use the installer to allow access.',
        showCloseButton: false,
      }}
      modalProps={{
        isBlocking: false,
      }}
    >
      <DialogFooter>
        {/* <PrimaryButton onClick={toggleHideDialog} text="Send" />
        <DefaultButton onClick={toggleHideDialog} text="Don't send" /> */}
      </DialogFooter>
    </Dialog>
  );
};

export default UnCustomVision;
