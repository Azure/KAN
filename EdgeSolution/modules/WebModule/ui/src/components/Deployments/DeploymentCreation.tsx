import React, { useState, useCallback } from 'react';
import { Stack, Pivot, PivotItem } from '@fluentui/react';
import { useHistory, generatePath, useLocation, Route, Switch } from 'react-router-dom';

import { Url } from '../../constant';
import { CreateDeploymentFormData, PivotTabKey } from './types';

import Basics from './Creation/Basics';
import Configure from './Creation/Configure';
import TagPage from '../Common/TagPage';
import Preview from './Creation/Preview';
import Footer from './Creation/Footer';

const DeploymentCreation = () => {
  const history = useHistory();
  const location = useLocation();

  const [localFormData, setLocalFormData] = useState<CreateDeploymentFormData>({
    name: '',
    cameraList: [],
    device: { key: -1, text: '' },
    tagList: [{ name: '', value: '', errorMessage: null }],
  });
  const [localPivotKey, setLocalPivotKey] = useState<PivotTabKey>(
    location.pathname.split('/')[3] as PivotTabKey,
  );

  const onLinkClick = useCallback(
    (key: PivotTabKey) => {
      setLocalPivotKey(key);

      history.push(
        generatePath(Url.DEPLOYMENT2_CREATION, {
          key,
        }),
      );
    },
    [history],
  );

  const onFormDataChange = useCallback((newFormData: CreateDeploymentFormData) => {
    setLocalFormData({ ...newFormData });
  }, []);

  return (
    <>
      <Stack horizontal verticalAlign="center">
        <Pivot
          styles={{ itemContainer: { height: 'calc(100% - 44px)' } }}
          onLinkClick={(item) => onLinkClick(item?.props.itemKey! as PivotTabKey)}
          selectedKey={localPivotKey}
        >
          <PivotItem headerText="Basics" itemKey="basics" />
          <PivotItem headerText="Configure AI Skills" itemKey="configure" />
          <PivotItem headerText="Tags (Optional)" itemKey="tag" />
          <PivotItem
            headerText="Review + Create"
            itemKey="preview"
            style={{ height: '100%', position: 'relative' }}
          />
        </Pivot>
        {/* {isCreating && <Spinner size={3} />} */}
      </Stack>
      <Switch>
        <Route
          exact
          path={Url.DEPLOYMENT2_CREATION_PREVIEW}
          render={() => <Preview localFormData={localFormData} />}
        />
        <Route
          exact
          path={Url.DEPLOYMENT2_CREATION_TAG}
          render={() => (
            <TagPage tagList={localFormData.tagList} onTagChange={() => {}} onTagDelete={() => {}} />
          )}
        />
        <Route
          exact
          path={Url.DEPLOYMENT2_CREATION_CONFIGURE}
          render={() => <Configure cameraList={localFormData.cameraList} />}
        />
        <Route
          exact
          path={Url.DEPLOYMENT2_CREATION_BASIC}
          render={() => <Basics localFormData={localFormData} onFormDataChange={onFormDataChange} />}
        />
      </Switch>
      <Footer
        localPivotKey={localPivotKey}
        onLinkClick={onLinkClick}
        localFormData={localFormData}
        isCreating={false}
        onCreatingChange={() => {}}
      />
    </>
  );
};

export default DeploymentCreation;
