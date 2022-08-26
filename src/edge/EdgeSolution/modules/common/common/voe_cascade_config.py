# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from typing import Union, Dict, List
try:
    from typing import Literal
except:
    from typing_extensions import Literal

from pydantic import BaseModel


NodeId = str


class Node(BaseModel):
    id: NodeId
    type: Literal['source', 'transform', 'export', 'model']
    name: str
    configurations: Dict[str, str]


class SourceNode(Node):
    type: Literal['source']


class TransformNode(Node):
    type: Literal['transform']


class ExportNode(Node):
    type: Literal['export']


class ModelNode(Node):
    type: Literal['model']


class Edge(BaseModel):
    source: NodeId
    target: NodeId

class CascadeConfig(BaseModel):
    edges: List[Edge]
    nodes: List[Node]


if __name__ == '__main__':
    import json
    j = json.load(open('sample.json'))
    c = CascadeConfig(**j)
    print(c)
