// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { useBoolean } from '@uifabric/react-hooks';
import { useRouteMatch } from 'react-router-dom';

import { Url } from '../constant';

import { TopNav } from './TopNav';
import { LeftNav } from './LeftNav';

import SettingModal from './SettingModal';

export const MainLayout: React.FC = ({ children }) => {
  const match = useRouteMatch(Url.AZURE_LOGIN);

  const [settingOpen, { setFalse: closeSettingPanel, setTrue: openSettingPanel }] = useBoolean(false);

  // Azure Login popup
  if (match) return <>{children}</>;

  return (
    <main
      style={{
        height: '100vh',
        display: 'grid',
        gridTemplateRows: '48px auto',
        gridTemplateColumns: '210px auto',
      }}
    >
      <nav style={{ gridRow: '1 / span 1', gridColumn: '1 / span 2' }}>
        <TopNav onSettingClick={openSettingPanel} />
      </nav>
      <nav style={{ gridRow: '2 / span 1', gridColumn: '1 / span 1' }}>
        <LeftNav />
      </nav>
      <div
        style={{
          gridRow: '2 / span 1',
          gridColumn: '2 / span 1',
          overflowY: 'scroll',
          position: 'relative',
        }}
      >
        {children}

        {settingOpen && <SettingModal onModalClose={closeSettingPanel} />}
      </div>
    </main>
  );
};
