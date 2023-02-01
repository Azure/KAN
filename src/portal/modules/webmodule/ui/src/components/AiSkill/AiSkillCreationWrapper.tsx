import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getTrainingProject } from '../../store/trainingProjectSlice';
import { getDeployments } from '../../store/deploymentSlice';
import { getParts } from '../../store/partSlice';

import PageLoading from '../Common/PageLoading';
import AISkillCreation from './AiSkillCreation';

interface Props {
  nameList: string[];
}

const AiSkillCreationWrapper = (props: Props) => {
  const { nameList } = props;

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await dispatch(getTrainingProject(false));
      await dispatch(getParts());
      await dispatch(getDeployments());
      // await dispatch(getCascades());
      setIsLoading(true);
    })();
  }, [dispatch]);

  if (isLoading) return <PageLoading />;

  return <AISkillCreation existingNameList={nameList} />;
};

export default AiSkillCreationWrapper;

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// import React, { useEffect, useState } from 'react';
// import { Label, Stack, IconButton } from '@fluentui/react';
// import { Switch, Route, useRouteMatch, useHistory } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';

// import { State as RootState } from 'RootStateType';
// import { AiSkill } from '../store/types';
// import { Url } from '../constant';
// import { getTrainingProject } from '../store/trainingProjectSlice';
// import { getCascades, selectAllCascades } from '../store/cascadeSlice';
// import { getDeployments } from '../store/deploymentSlice';
// import { getParts } from '../store/partSlice';

// import AiSkillCreation from '../components/AiSkill/AiSkillCreation';
// import AiSkillWrapper from '../components/AiSkill/AiSkillWrapper';
// import AiSkillEdit from '../components/AiSkill/AiSkillEdit';
// import PageLoading from '../components/Common/PageLoading';

// const AiSkillPage = () => {
//   const skillList = useSelector((state: RootState) => selectAllCascades(state)) as AiSkill[];

//   const isCancelMatch = useRouteMatch([Url.AI_SKILL_CREATION, Url.AI_SKILL_EDIT]);
//   const isEditRouteMatch = useRouteMatch(Url.AI_SKILL_EDIT);
//   const [isLoading, setIsLoading] = useState(true);

//   const dispatch = useDispatch();
//   const history = useHistory();

//   useEffect(() => {
//     (async () => {
//       setIsLoading(true);
//       // await dispatch(getTrainingProject(false));
//       // await dispatch(getParts());
//       await dispatch(getCascades());
//       // await dispatch(getDeployments());
//       setIsLoading(false);
//     })();
//   }, [dispatch]);

//   if (isLoading) return <PageLoading />;

//   return (
//     <section style={{ height: 'calc(100% - 35px) ', padding: '35px 20px 0', position: 'relative' }}>
//       <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
//         <Label styles={{ root: { fontSize: '24px', lineHeight: '32px' } }}>
//           {isEditRouteMatch ? 'Edit AI Skills' : 'AI Skills'}
//         </Label>
//         {isCancelMatch && (
//           <IconButton iconProps={{ iconName: 'Cancel' }} onClick={() => history.push(Url.AI_SKILL)} />
//         )}
//       </Stack>

//       <Switch>
//         <Route path={Url.AI_SKILL_EDIT} render={() => <AiSkillEdit />} />
//         <Route
//           path={Url.AI_SKILL_CREATION}
//           render={() => <AiSkillCreation existingNameList={skillList.map((skill) => skill.name)} />}
//         />
//         <Route path={Url.AI_SKILL} render={() => <AiSkillWrapper skillList={skillList} />} />
//       </Switch>
//     </section>
//   );
// };

// export default AiSkillPage;
