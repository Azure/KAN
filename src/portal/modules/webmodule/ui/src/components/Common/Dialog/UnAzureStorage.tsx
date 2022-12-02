import React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react';

interface Props {
  onDismiss: () => void;
}

const UnCustomVision = (props: Props) => {
  const { onDismiss } = props;

  return (
    // <Dialog
    //     hidden={hideDialog}
    //     onDismiss={toggleHideDialog}
    //     dialogContentProps={dialogContentProps}
    //     modalProps={modalProps}
    //   >
    //     <DialogFooter>
    //       <PrimaryButton onClick={toggleHideDialog} text="Send" />
    //       <DefaultButton onClick={toggleHideDialog} text="Don't send" />
    //     </DialogFooter>
    //   </Dialog>

    <Dialog
      hidden={false}
      // onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'No Azure Storage',
        subText:
          'You need Azure Storage credentials in order to view camera feed. Please use the installer to add your Azure Storage account. ',
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
