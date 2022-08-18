# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from typing import Union, Literal, Optional

from pydantic import BaseModel


NodeId = str

class Route(BaseModel):
    route: str
    type: Literal['frame']

class Node(BaseModel):
    id: NodeId
    type: Literal['source', 'transform', 'export', 'model']
    name: str
    inputs: list[Route] | None
    outputs: list[Route] | None
    configurations: dict[str, object] | None


class SourceNode(Node):
    type: Literal['source']
    outputs: list[Route]


class TransformNode(Node):
    type: Literal['transform']
    inputs: list[Route]
    outputs: list[Route]

class ExportNode(Node):
    type: Literal['export']
    inputs: list[Route]

class ModelNode(Node):
    type: Literal['model']
    inputs: list[Route]
    outputs: list[Route]

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
