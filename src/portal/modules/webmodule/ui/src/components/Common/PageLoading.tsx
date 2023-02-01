// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { ProgressIndicator, mergeStyleSets } from '@fluentui/react';

const getClasses = () =>
  mergeStyleSets({
    section: {
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    process: {
      width: '500px',
    },
  });

const PageLoading = () => {
  const classes = getClasses();

  return (
    <section className={classes.section}>
      <ProgressIndicator className={classes.process} />
    </section>
  );
};

export default PageLoading;
