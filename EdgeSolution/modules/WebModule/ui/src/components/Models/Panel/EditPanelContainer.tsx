import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { State as RootState } from 'RootStateType';
import { selectTrainingProjectById, getSingleTrainingProject } from '../../../store/trainingProjectSlice';
import { trainingProjectPartsSelectorFactory } from '../../../store/partSlice';
import {
  getOneTrainingProjectStatus,
  selectAllTrainingProjectsStatus,
} from '../../../store/trainingProjectStatusSlice';
import { getParts } from '../../../store/partSlice';

import EditPanel from './EditPanel';

interface Props {
  projectId: number;
  onDismiss: () => void;
}

const EditPanelContainer = (props: Props) => {
  const { projectId, onDismiss } = props;

  const project = useSelector((state: RootState) => selectTrainingProjectById(state, projectId));
  const partSelector = useMemo(() => trainingProjectPartsSelectorFactory(project.id), [project]);
  const parts = useSelector(partSelector);
  // const imagesSelector = useMemo(() => isLabeledImagesSelector(projectId), [projectId]);
  // const images = useSelector(imagesSelector);
  const projectStatusList = useSelector((state: RootState) => selectAllTrainingProjectsStatus(state));

  const projectStatus = projectStatusList.find((status) => status.project === projectId);

  // const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await Promise.all([
        dispatch(getSingleTrainingProject(projectId)),
        dispatch(getOneTrainingProjectStatus(projectId)),
        dispatch(getParts()),
      ]);
      setLoading(false);
    })();
  }, [dispatch]);

  if (loading) return <></>;

  // useEffect(() => {
  //   dispatch(getSingleTrainingProject(projectId));
  //   dispatch(getOneTrainingProjectStatus(projectId));
  //   dispatch(getParts());
  // }, [dispatch]);

  // if (!projectStatus) return <></>;

  return <EditPanel onDismiss={onDismiss} project={project} parts={parts} status={projectStatus.status} />;
};

export default EditPanelContainer;
