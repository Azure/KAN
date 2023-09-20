# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import networkx as nx
from common.voe_cascade_config import CascadeConfig

from sources import RtspSource
from transforms import FilterTransform, GrpcTransform
from exports import VideoSnippetExport, IothubExport, MqttExport, IotedgeExport, Cv2ImshowExport, HttpExport
from models import FakeModel, ObjectDetectionModel, ClassificationModel


supported_sources = {
    'rtsp': RtspSource
}

supported_transforms = {
    'filter_transform': FilterTransform,
    'grpc_transform': GrpcTransform
}

supported_exports = {
    'video_snippet_export': VideoSnippetExport,
    'iothub_export': IothubExport,
    'mqtt_export': MqttExport,
    'iotedge_export': IotedgeExport,
    'cv2_imshow_export': Cv2ImshowExport,
    'http_export': HttpExport
}

supported_models = {
    'fake_model': FakeModel,
    'object_detection_model': ObjectDetectionModel,
    'classification_model': ClassificationModel
    
}

class Stream:
    
    def __init__(self, g: nx.DiGraph=None):
        self._elements = []
        self._g = g


        for i, node_id in enumerate(nx.topological_sort(self._g)):
            node = self._g.nodes[node_id]

            node_type = node['type']
            node_name = node['name']
            node_configurations = node['configurations']


            if node_type == 'source':
                    #case 'source':
                    if node_name not in supported_sources:
                        raise Exception(f'Unknown Name {node_name} for Type {node_type}')
                    element = supported_sources[node_name](**node_configurations)

                    node['element'] = element
                    self._elements.append(element)

                    #case 'transform':
            elif node_type == 'transform':
                    if node_name not in supported_transforms:
                        raise Exception(f'Unknown Name {node_name} for Type {node_type}')
                    element = supported_transforms[node_name](**node_configurations)

                    #for parent_node_id in nx.predecessors(self._g, node_id):
                    for parent_node_id in self._g.predecessors(node_id):
                        parent_node = self._g.nodes[parent_node_id]
                        parent_node['element'].add_child(element)

                    node['element'] = element
                    self._elements.append(element)

                    

            elif node_type == 'export':
                #   case 'export':
                    if node_name not in supported_exports:
                        raise Exception(f'Unknown Name {node_name} for Type {node_type}')
                    element = supported_exports[node_name](**node_configurations)

                    #for parent_node_id in nx.predecessors(self._g, node_id):
                    for parent_node_id in self._g.predecessors(node_id):
                        parent_node = self._g.nodes[parent_node_id]
                        parent_node['element'].add_child(element)

                    node['element'] = element
                    self._elements.append(element)

            elif node_type == 'model':
                    #case 'model':
                    if node_name not in supported_models:
                        raise Exception(f'Unknown Name {node_name} for Type {node_type}')
                    element = supported_models[node_name](**node_configurations)

                    #for parent_node_id in nx.predecessors(self._g, node_id):
                    for parent_node_id in self._g.predecessors(node_id):
                        parent_node = self._g.nodes[parent_node_id]
                        parent_node['element'].add_child(element)

                    node['element'] = element
                    self._elements.append(element)

            else:
                    #case _:
                    raise Exception(f'Unknown Type {node_type}')



    @classmethod
    def from_cascade_config(cls, cascade_config):
        g = nx.node_link_graph(data=cascade_config.dict(), directed=True, multigraph=False, attrs={'link': 'edges'})
        return Stream(g=g)

    def start(self):
        for node_id in reversed(list(nx.topological_sort(self._g))):
            node = self._g.nodes[node_id]
            node['element'].start()

    def stop(self):
        for node_id in nx.topological_sort(self._g):
            node = self._g.nodes[node_id]
            node['element'].stop()

    def join(self):
        for node_id in nx.topological_sort(self._g):
            node = self._g.nodes[node_id]
            node['element'].join()
