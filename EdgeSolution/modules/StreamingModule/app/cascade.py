from typing import Union, Literal

from pydantic import BaseModel


NodeId = str


class Node(BaseModel):
    id: NodeId
    type: Literal['source', 'transform', 'export', 'model']
    name: str
    parameters: dict[str, object]


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
    name: str
    nodes: list[Node]
    edges: list[Edge]


if __name__ == '__main__':
    import json
    j = json.load(open('sample.json'))
    c = CascadeConfig(**j)
    print(c)
