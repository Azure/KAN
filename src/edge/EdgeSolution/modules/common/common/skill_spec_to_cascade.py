# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from common.cascade import CascadeConfig, Edge, Node

def skill_spec_to_cascade(skill):

    nodes = []
    edges = []

    for skill_node in skill.nodes:
        if skill_node.sub_type.contains('ObjectDetection'):
            name = 'ObjectDetection'
        elif skill_node.sub_type.contains('Classification'):
            name = 'Classification'
        elif skill_node.sub_type.contains('GPT4'):
            name = 'GPT4'
        else:
            raise Exception('Unknown subtype {skill_node.sub_type}')
            
        node = Node(
            id=skill_node.id,
            type='model',
            name=name,
            configurations=skill_node.configurations or {},
        )
        nodes.append(node)

    for skill_edge in skill.edges:
        edge = Edge(
            source=skill_edge.source.node,
            target=skill_edge.target.node
        )
        edges.append(edge)

    cascade_config = CascadeConfig(edges=edges, nodes=nodes)

    return cascade_config