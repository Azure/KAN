// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { State as RootState } from 'RootStateType';
import { selectTrainingProjectById, getSingleTrainingProject } from '../store/trainingProjectSlice';
import { getParts } from '../store/partSlice';
import { getImages } from '../store/imageSlice';
import { getCameras } from '../store/cameraSlice';
import { getOneTrainingProjectStatus } from '../store/trainingProjectStatusSlice';

import CVModelDetail from '../components/CVModelDetail/ModelDetail';
import PageLoading from '../components/Common/PageLoading';

const CVModelPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();

  const trainingProject = useSelector((state: RootState) => selectTrainingProjectById(state, id));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await dispatch(getSingleTrainingProject(parseInt(id, 10)));
      await dispatch(getImages({ freezeRelabelImgs: true, selectedProject: +id }));
      await dispatch(getOneTrainingProjectStatus(+id));
      await dispatch(getCameras(false));
      // We need part info for image list items
      await dispatch(getParts());
      setIsLoading(false);
    })();
  }, [dispatch, id]);

  if (isLoading) return <PageLoading />;

  return <CVModelDetail model={trainingProject} />;
};

export default CVModelPage;
