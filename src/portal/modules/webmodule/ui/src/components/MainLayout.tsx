// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from '@uifabric/react-hooks';
import { useRouteMatch } from 'react-router-dom';

import { State } from 'RootStateType';
import { Url } from '../constant';

import { TopNav } from './TopNav';
import { LeftNav } from './LeftNav';
// import { SettingPanel } from './SettingPanel';
import SettingModal from './SettingModal';

export const MainLayout: React.FC = ({ children }) => {
  const appInsightHasInit = useSelector((state: State) => state.setting.appInsightHasInit);
  const isTrainerValid = useSelector((state: State) => state.setting.isTrainerValid);
  const userHasInitSetting = isTrainerValid;

  const match = useRouteMatch(Url.AZURE_LOGIN);

  const [settingOpen, { setFalse: closeSettingPanel, setTrue: openSettingPanel, toggle }] = useBoolean(false);
  const askUserToSetup = () => {
    let setupMsg = '';
    if (!appInsightHasInit) setupMsg += 'Check with our data policy.\n';
    if (!isTrainerValid) setupMsg += 'Fill in customvision endpoint and key.';
    // eslint-disable-next-line no-alert
    alert(`Please complete the following steps to continue: \n${setupMsg}`);
  };
  const toggleSettingPanel = () => {
    if (userHasInitSetting) toggle();
    else askUserToSetup();
  };

  // useEffect(() => {
  //   if (!userHasInitSetting) {
  //     openSettingPanel();
  //   }
  // }, [openSettingPanel, userHasInitSetting]);

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
        <TopNav onSettingClick={toggleSettingPanel} />
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
        {/* <SettingPanel
          isOpen={settingOpen}
          onDismiss={closeSettingPanel}
          canBeDismissed={appInsightHasInit && isTrainerValid}
          // openDataPolicyDialog={!appInsightHasInit}
          showProjectDropdown={isTrainerValid}
        /> */}
        <SettingModal
          isModalOpen={settingOpen}
          onModalClose={closeSettingPanel}
          canBeDismissed={appInsightHasInit && isTrainerValid}
          showProjectDropdown={isTrainerValid}
        />
      </div>
    </main>
  );
};
