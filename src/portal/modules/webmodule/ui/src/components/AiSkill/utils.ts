import { Node, Edge, isNode } from 'react-flow-renderer';
import { pick, omit, groupBy, mapObjIndexed } from 'ramda';

import { SOURCE_CONFIGURATIONS } from './constant';
import { AiSkill, ModelNodeType, TrainingProject } from '../../store/types';
import { SkillNodeData, ExportType, TransformType } from './types';

export const NODE_CONSTANT_X_POSITION = 350;
export const NODE_CONSTANT_Y_POSITION = 50;

type ConfigurationsPayload = Partial<{
  delay_buffer: string;
  broker_address: string;
  filename_prefix: string;
  instance_displayname: string;
  device_displayname: string;
  skill_displayname: string;
  recording_duration: string;
  insights_overlay: string;
  module_name: string;
  module_input: string;
}>;

export const getTransformType = (name: string): TransformType => {
  switch (name) {
    case 'filter_transform':
      return 'filter';
    case 'grpc_transform':
      return 'grpc';
    default:
      return null;
  }
};

export const getExportType = (name: string): ExportType => {
  switch (name) {
    case 'video_snippet_export':
      return 'snippet';
    case 'iothub_export':
      return 'iotHub';
    case 'iotedge_export':
      return 'iotEdge';
    case 'http_export':
      return 'http';
    case 'mqtt_export':
      return 'mqtt';
    default:
      return null;
  }
};

const isNotExportNode = (elements: Node[]) => {
  const exportNode = elements.find((element) => element.type === 'export') as Node | undefined;

  return !exportNode;
};

const isNotModleNode = (elements: Node[]) => {
  const modelNode = elements.find((element) => element.type === 'model') as Node | undefined;

  return !modelNode;
};

const isNotEditDone = (elements: Node[]) => elements.find((element) => !element.data.isEditDone);

type NodeMap = {
  source: Node | null;
  export: Node[];
  normal: Node[];
};

export const isDiscreteFlow = (nodeList: Node[], edgeList: Edge[]) => {
  const nodeMap: NodeMap = nodeList.reduce(
    (accMap, node) => {
      if (node.type === 'source') {
        return { ...accMap, source: node };
      }
      if (node.type === 'export') {
        return { ...accMap, export: [...accMap.export, node] };
      }
      return { ...accMap, normal: [...accMap.normal, node] };
    },
    { source: null, normal: [], export: [] },
  );

  const isConnectSource = edgeList.find((edge) => edge.source === nodeMap.source.id);

  if (!isConnectSource) return true;

  const exportNodeMap = nodeMap.export.reduce((acc, node) => {
    if (!acc[node.id]) return { ...acc, [node.id]: 0 };
    return acc;
  }, {});

  const normalNodeMap: { [key: number]: { target: number; source: number } } = nodeMap.normal.reduce(
    (accMap, node) => {
      if (!accMap.hasOwnProperty(node.id)) {
        return {
          ...accMap,
          [node.id]: { target: 0, source: 0 },
        };
      }
      return accMap;
    },
    {},
  );

  edgeList.forEach((edge) => {
    if (exportNodeMap.hasOwnProperty(edge.target)) {
      exportNodeMap[edge.target] = exportNodeMap[edge.target] + 1;
    }

    if (normalNodeMap.hasOwnProperty(edge.target)) {
      normalNodeMap[edge.target] = {
        ...normalNodeMap[edge.target],
        target: normalNodeMap[edge.target].target + 1,
      };
    }

    if (normalNodeMap.hasOwnProperty(edge.source)) {
      normalNodeMap[edge.source] = {
        ...normalNodeMap[edge.source],
        source: normalNodeMap[edge.source].source + 1,
      };
    }
  });

  if (Object.keys(exportNodeMap).find((key) => exportNodeMap[key] === 0)) return true;

  if (
    Object.keys(normalNodeMap).find(
      (key) => normalNodeMap[key].target === 0 || normalNodeMap[key].source === 0,
    )
  )
    return true;

  return false;
};

export const getCascadeErrorMessage = (elements: (Node | Edge)[]) => {
  if (elements.length === 1) return 'Drag and drop these nodes to the canvas on the right';

  const nodeList: Node[] = [];
  const edgeList: Edge[] = [];

  elements.forEach((ele) => {
    if (isNode(ele)) {
      nodeList.push(ele);
      return;
    }

    edgeList.push(ele as Edge);
  });

  if (isNotModleNode(nodeList)) return 'At least one model node';
  if (isNotExportNode(nodeList)) return 'At least one Export Node needed';

  if (isNotEditDone(nodeList)) {
    const node = isNotEditDone(nodeList);

    return `${node.data.name} Node cannot be blank`;
  }

  if (isDiscreteFlow(nodeList, edgeList)) {
    return 'Graph should be connected';
  }

  return '';
};

export const getNodeImage = (type: ModelNodeType) => {
  switch (type) {
    case 'source':
      return '/icons/aiSkill/import.png';
    case 'model':
      return '/icons/aiSkill/process.png';
    case 'transform':
      return '/icons/aiSkill/process.png';
    case 'export':
      return '/icons/aiSkill/export.png';
    default:
      return '';
  }
};

const parseNodePayload = (node: Node<SkillNodeData>) => {
  const { configurations, model } = node.data;

  if (node.type === 'source')
    return {
      id: node.id,
      type: node.type,
      name: model.name,
      model,
      configurations,
    };

  if (node.type === 'model')
    return {
      id: node.id,
      type: node.type,
      name: model.kan_id ? model.kan_id : model.name,
      configurations: {
        confidence_upper: configurations.confidence_upper.toString(),
        confidence_lower: configurations.confidence_lower.toString(),
        max_images: configurations.max_images.toString(),
      },
      model,
    };

  if (node.type === 'transform' && node.data.transformType === 'filter')
    return {
      id: node.id,
      type: node.type,
      name: model.name,
      configurations,
      model,
    };

  if (node.type === 'transform' && node.data.configurations.type === 'endpoint')
    return {
      id: node.id,
      type: node.type,
      name: model.name,
      configurations,
      model,
    };

  if (node.type === 'transform' && node.data.configurations.type === 'container')
    return {
      id: node.id,
      type: node.type,
      name: model.name,
      configurations,
      model,
    };

  if (node.type === 'export' && node.data.exportType === 'http') {
    return {
      id: node.id,
      type: node.type,
      name: model.name,
      configurations: {
        url: configurations.url,
      },
      model,
    };
  }

  if (node.type === 'export' && ['snippet', 'iotHub', 'iotEdge', 'mqtt'].includes(node.data.exportType)) {
    const configurationsPayload: ConfigurationsPayload = {
      delay_buffer: configurations.delay_buffer,
    };

    if (node.data.exportType === 'mqtt'){
      configurationsPayload.broker_address = configurations.broker_address;
    }

    if (node.data.exportType === 'snippet') {
      configurationsPayload.filename_prefix = configurations.filename_prefix;
      configurationsPayload.instance_displayname = '$param(instance_displayname)';
      configurationsPayload.device_displayname = '$param(device_displayname)';
      configurationsPayload.skill_displayname = '$param(skill_displayname)';
      configurationsPayload.recording_duration = configurations.recording_duration;
      configurationsPayload.insights_overlay = configurations.insights_overlay;
    }

    if (node.data.exportType === 'iotEdge') {
      configurationsPayload.module_name = configurations.module_name;
      configurationsPayload.module_input = configurations.module_input;
    }

    return {
      id: node.id,
      type: node.type,
      name: model.name,
      configurations: configurationsPayload,
      model,
    };
  }
};

type NodePayloadMap = {
  [key: string]: { inputs: { route: string; type: string }[]; outputs: { route: string; type: string }[] };
};

const parseEdgePayload = (edge: Edge, map: NodePayloadMap) => {
  return {
    source: {
      node: edge.source,
      route: map[edge.source].outputs[0].route,
    },
    target: { node: edge.target, route: map[edge.target].inputs[0].route },
  };
};

export const convertElementsPayload = (elements: (Edge<any> | Node<any>)[]) => {
  const newElements = elements.reduce(
    (acc, element) => {
      if (isNode(element)) {
        return { nodes: [...acc.nodes, parseNodePayload(element)], edges: acc.edges };
      }
      return {
        nodes: acc.nodes,
        edges: [...acc.edges, element],
      };
    },
    { nodes: [], edges: [] },
  );

  const nodeMedelMap = newElements.nodes.reduce((acc, node) => {
    const { inputs, outputs } = node.model;

    return {
      ...acc,
      [node.id]: { inputs, outputs },
    };
  }, {});

  const newEdgeList = newElements.edges.map((edge) => parseEdgePayload(edge, nodeMedelMap));
  const newNodeLost = newElements.nodes.map((node) => {
    return omit(['model'], node);
  });
  newElements.edges = newEdgeList;
  newElements.nodes = newNodeLost;

  return {
    ...newElements,
    parameters: {
      rtsp: 'invalid',
      fps: 'invalid',
      instance_displayname: 'invalid',
      skill_displayname: 'invalid',
      device_displayname: 'invalid',
      device_id: 'invalid',
    },
  };
};

const POSITION = { x: 350, y: 50 };

export const recoverRawElements = (
  flowData: {
    edges: { source: { node: string; route: string }; target: { node: string; route: string } }[];
    nodes: { id: string; type: ModelNodeType; name: string; configurations: any }[];
  },
  modelList: TrainingProject[],
) => {
  const originalEdgeList: {
    source: string;
    sourceHandle: string;
    target: string;
    targetHandle: string;
    id: string;
  }[] = flowData.edges.reduce((accEdges, edge) => {
    return [
      ...accEdges,
      {
        source: edge.source.node,
        sourceHandle: 'source',
        target: edge.target.node,
        targetHandle: 'target',
        id: `reactflow__edge-${edge.source.node}source-${edge.target.node}target`,
      },
    ];
  }, []);

  const originalNodeList = flowData.nodes.reduce((accNodes, node) => {
    const matchedModel = modelList.find((model) =>
      node.type === 'model' ? model.kan_id === node.name : model.name === node.name,
    );

    const data: SkillNodeData = {
      configurations: {},
      connectMap: originalEdgeList.map((edge) =>
        pick(['source', 'sourceHandle', 'target', 'targetHandle'], edge),
      ),
      isEditDone: true,
      nodeType: node.type,
      model: pick(['id', 'name', 'inputs', 'outputs', 'kan_id'] as (keyof TrainingProject)[], matchedModel),
    };

    if (node.type === 'source') {
      data.configurations = SOURCE_CONFIGURATIONS;
    }

    if (node.type === 'model') {
      data.projectType = matchedModel.projectType;
      data.configurations.model = { id: matchedModel.id, name: matchedModel.name };
      data.configurations.category = matchedModel.category;
      data.projectType = matchedModel.projectType;
      data.configurations.captureData = node.configurations.confidence_lower ? 'yes' : 'no';
      data.configurations.confidence_lower = +node.configurations.confidence_lower;
      data.configurations.confidence_upper = +node.configurations.confidence_upper;
      data.configurations.max_images = +node.configurations.max_images;
      data.configurations.error = {
        captureData: '',
        confidence_lower: '',
        confidence_upper: '',
        max_images: '',
        model: '',
      };
    }

    if (node.type === 'transform') {
      data.configurations = node.configurations;
    }

    if (node.type === 'export') {
      data.configurations.filename_prefix = node.configurations.filename_prefix;
      data.configurations.recording_duration = node.configurations.recording_duration;
      data.configurations.insights_overlay = node.configurations.insights_overlay;
      data.configurations.delay_buffer = node.configurations.delay_buffer;
      data.configurations.broker_address = node.configurations.broker_address;
      data.configurations.module_name = node.configurations.module_name;
      data.configurations.module_input = node.configurations.module_input;
      data.configurations.url = node.configurations.url;
      data.configurations.error = {
        filename_prefix: '',
        recording_duration: '',
        insights_overlay: '',
        broker_address: '',
        delay_buffer: '',
        module_name: '',
        url: '',
      };
    }

    if (node.type !== 'source') {
      data.name = node.type === 'model' ? 'Run ML Model' : matchedModel.name;
      data.displayName = node.type === 'model' ? 'Run ML Model' : matchedModel.displayName;
      data.exportType = getExportType(matchedModel.name);
      data.transformType = getTransformType(matchedModel.name);
    }

    const newNode = {
      id: node.id,
      type: node.type,
      position: POSITION,
      data,
    };

    return [...accNodes, newNode];
  }, []);

  return [...originalNodeList, ...originalEdgeList];
};

// Filter

export type SkillFieldKey = keyof Pick<AiSkill, 'acceleration' | 'fps'>;
export type SkillFieldMap = Record<SkillFieldKey, number[]>;

export const getFilterdSkillList = (skillList: AiSkill[], target: string): AiSkill[] => {
  const regex = new RegExp(target, 'i');
  const matchSkillList = [];

  skillList.forEach((skill) => {
    const isValueMatch = Object.values(
      pick(['name', 'acceleration', 'fps'] as (keyof AiSkill)[], skill),
    ).find((value: string) => value.toString().match(regex));

    if (isValueMatch) {
      matchSkillList.push(skill);
      return;
    }

    if (skill.tag_list.length === 0) return;

    const isTagMatch = skill.tag_list.find(({ name, value }) => name.match(regex) || value.match(regex));
    if (isTagMatch) {
      matchSkillList.push(skill);
    }
  });

  return matchSkillList;
};

export const getDropOptions = (skillList: AiSkill[], target: SkillFieldKey) => {
  const group = groupBy((skill) => skill[target.toString()], skillList);
  const displayOptions = mapObjIndexed((value) => value.map((n) => n.id), group);

  return displayOptions;
};

export const getMinContentList = (skillList: AiSkill[], fieldMap: SkillFieldMap) => {
  const minFilterFieldList = Object.values(fieldMap).reduce((minIdList, idList) => {
    if (minIdList.length === 0) return idList;
    if (minIdList.length > idList.length && idList.length !== 0) return idList;
    return minIdList;
  }, []);

  if (minFilterFieldList.length === 0) return skillList;
  return skillList.filter((device) => minFilterFieldList.includes(device.id));
};
