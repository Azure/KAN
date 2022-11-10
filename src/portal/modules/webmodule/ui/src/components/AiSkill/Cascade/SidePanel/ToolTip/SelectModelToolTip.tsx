import React from 'react';
import { Stack, IconButton, Callout, DirectionalHint, IDropdownProps } from '@fluentui/react';
import { useBoolean, useId } from '@uifabric/react-hooks';

import { getSelectModelToolTipClasses } from '../styles';

const SelectModelToolTip = (props: IDropdownProps): JSX.Element => {
  const [isCalloutVisible, { toggle: toggleIsCalloutVisible }] = useBoolean(false);
  const iconButtonId: string = useId('iconButton');

  const classes = getSelectModelToolTipClasses();

  return (
    <>
      <Stack
        horizontal
        verticalAlign="center"
        tokens={{
          childrenGap: 4,
          maxWidth: 300,
        }}
      >
        <span id={props.id} className={classes.lable}>
          {props.label}
        </span>
        <IconButton
          id={iconButtonId}
          iconProps={{ iconName: 'Info' }}
          title="Info"
          ariaLabel="Info"
          onClick={toggleIsCalloutVisible}
        />
        <span className={classes.requiredMark}>*</span>
      </Stack>
      {isCalloutVisible && (
        <Callout
          target={`#${iconButtonId}`}
          setInitialFocus
          onDismiss={toggleIsCalloutVisible}
          role="alertdialog"
          directionalHint={DirectionalHint.bottomCenter}
        >
          <Stack
            tokens={{
              childrenGap: 4,
              maxWidth: 280,
            }}
            horizontalAlign="start"
            styles={{ root: classes.contentWrapper }}
          >
            <span className={classes.boldContent}>Note: </span>
            <span className={classes.content}>
              Models from the model zoo will not appear if they are incompatible with your device
              acceleration.
            </span>
          </Stack>
        </Callout>
      )}
    </>
  );
};

export default SelectModelToolTip;
