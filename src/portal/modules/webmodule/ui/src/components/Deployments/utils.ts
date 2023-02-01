import { pick, groupBy, mapObjIndexed } from 'ramda';

import { FormattedDeployment, ConfigureCamera } from './types';
import { AiSkill } from '../../store/types';

export type DeploymentFieldKey = keyof Pick<FormattedDeployment, 'deviceName'>;
export type DeploymentFieldMap = Record<DeploymentFieldKey, number[]>;

export const getFilteredDeploymentList = (
  deploymentList: FormattedDeployment[],
  target: string,
): FormattedDeployment[] => {
  const regex = new RegExp(target, 'i');
  const matchDeviceList = [];

  deploymentList.forEach((deploy) => {
    const isValueMatch = Object.values(
      pick(['name', 'deviceName'] as (keyof FormattedDeployment)[], deploy),
    ).find((value: string) => value.match(regex));

    if (isValueMatch) {
      matchDeviceList.push(deploy);
      return;
    }

    if (deploy.tag_list.length === 0) return;

    const isTagMatch = deploy.tag_list.find(({ name, value }) => name.match(regex) || value.match(regex));
    if (isTagMatch) {
      matchDeviceList.push(deploy);
    }
  });

  return matchDeviceList;
};

export const getDropOptions = (deploymentList: FormattedDeployment[], target: DeploymentFieldKey) => {
  const group = groupBy((deployment) => deployment[target], deploymentList);
  const displayOptions = mapObjIndexed((value) => value.map((n) => n.id), group);

  return displayOptions;
};

export const getMinContentList = (deploymentList: FormattedDeployment[], fieldMap: DeploymentFieldMap) => {
  const minFilterFieldList = Object.values(fieldMap).reduce((minIdList, idList) => {
    if (minIdList.length === 0) return idList;
    if (minIdList.length > idList.length && idList.length !== 0) return idList;
    return minIdList;
  }, []);

  if (minFilterFieldList.length === 0) return deploymentList;
  return deploymentList.filter((deployment) => minFilterFieldList.includes(deployment.id));
};

const IotNameList = ['iothub_export', 'iotedge_export'];

export const getSingleK8sWarning = ({ flow }: AiSkill) =>
  flow.nodes.filter((node) => IotNameList.includes(node.name)).length > 0;

export const getK8sWarning = (configureCameraList: ConfigureCamera[], aiSkillList: AiSkill[]): boolean => {
  const skillList = configureCameraList.map((camera) => camera.skillList.map((skill) => skill.id)).flat(1);

  console.log(
    skillList
      .map((id) =>
        aiSkillList
          .find((sk) => sk.kan_id === id)
          .flow.nodes.filter((node) => IotNameList.includes(node.name)),
      )
      .flat(1),
  );

  return (
    skillList
      .map((id) =>
        aiSkillList
          .find((sk) => sk.kan_id === id)
          .flow.nodes.filter((node) => IotNameList.includes(node.name)),
      )
      .flat(1).length > 0
  );
};
