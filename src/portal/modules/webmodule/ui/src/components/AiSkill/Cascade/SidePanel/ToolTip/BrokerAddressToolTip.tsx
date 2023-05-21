import React from 'react';
import { Stack, ITextFieldProps, Callout, IconButton, DirectionalHint } from '@fluentui/react';
import { useBoolean, useId } from '@uifabric/react-hooks';

import { getDelayBufferToolTipClasses } from '../styles';

const BrokerAddressToolTip = (props: ITextFieldProps): JSX.Element => {
  const [isCalloutVisible, { toggle: toggleIsCalloutVisible }] = useBoolean(false);
  const iconButtonId: string = useId('iconButton');

  const classes = getDelayBufferToolTipClasses();

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
            <span className={classes.content}>
              This is MQTT the broker address and there is default broker "mqtt.default.svc.cluster.local:1883" for k8s solutions.
            </span>
          </Stack>
        </Callout>
      )}
    </>
  );
};

export default BrokerAddressToolTip;