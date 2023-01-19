# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from typing import Union, Optional, List, Dict
try:
    from typing import Literal
except:
    from typing_extensions import Literal

from pydantic import BaseModel


NodeId = str

class Route(BaseModel):
    route: str
    type: Literal['frame']

class Node(BaseModel):
    id: NodeId
    type: Literal['source', 'transform', 'export', 'model']
    name: str
    inputs: Optional[List[Route]]
    outputs: Optional[List[Route]]
    configurations: Optional[Dict[str, object]]


class SourceNode(Node):
    type: Literal['source']
    outputs: List[Route]


class TransformNode(Node):
    type: Literal['transform']
    inputs: List[Route]
    outputs: List[Route]

class ExportNode(Node):
    type: Literal['export']
    inputs: List[Route]

class ModelNode(Node):
    type: Literal['model']
    inputs: List[Route]
    outputs: List[Route]

class NodeRoute(BaseModel):
    node: NodeId
    route: str

class Edge(BaseModel):
    source: NodeRoute
    target: NodeRoute



if __name__ == '__main__':
    import json
    j = json.load(open('sample.json'))
    c = CascadeConfig(**j)
    print(c)
