# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import datetime
import logging
import json
import uuid
import yaml

from distutils.util import strtobool

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Cascade
from ..kan_client import KanSkillClient
from ...compute_devices.kan_client import KanTargetClient, KanSolutionClient
from ...deployments.kan_client import KanInstanceClient
from .serializers import CascadeSerializer
from ...general.shortcuts import drf_get_object_or_404

logger = logging.getLogger(__name__)

skill_client = KanSkillClient()
target_client = KanTargetClient()
solution_client = KanSolutionClient()
instance_client = KanInstanceClient()


class CascadeViewSet(FiltersMixin, viewsets.ModelViewSet):
    """Cascade ModelViewSet

    Filters:
        is_demo
    """

    queryset = Cascade.objects.all()
    serializer_class = CascadeSerializer

    @action(detail=False, methods=["get"], url_path="get_properties")
    def get_properties(self, request, pk=None):

        kan_id = request.query_params.get("kan_id")

        logger.warning(f"Retrieving skill [{kan_id}] config.")

        return Response(yaml.dump(skill_client.get_config_from_kan(kan_id)))

    @action(detail=False, methods=["get"], url_path="get_kan_objects")
    def get_kan_objects(self, request):

        kan_id = request.query_params.get("kan_id")
        logger.warning(f"Retrieving all skill configs.")
        return Response(skill_client.get_objects())

    @action(detail=False, methods=["get"], url_path="get_kan_object")
    def get_kan_object(self, request):

        kan_id = request.query_params.get("kan_id")

        if kan_id:
            logger.warning(f"Retrieving skill [{kan_id}] config.")
            skill = skill_client.get_object(kan_id)

            return Response(skill)
        else:
            raise ValidationError("Not providing kan_id")

    @action(detail=False, methods=["post"], url_path="create_kan_object")
    def create_kan_object(self, request):

        kan_id = 'skill-' + str(uuid.uuid4())

        flow = json.loads(request.data.get("flow", "{}"))
        flow["displayName"] = request.data.get("name", "")
        flow["parameters"]["fpsRetrieve"] = request.data.get("fps", "")
        flow["parameters"]["accelerationRetrieve"] = request.data.get(
            "acceleration", "")
        skill_client.set_attr({
            "name": kan_id,
            "spec": flow,
            "tag_list": request.data.get("tag_list", "[]"),
        })

        skill_client.deploy_config()
        return Response(skill_client.get_object(kan_id))

    @action(detail=False, methods=["patch"], url_path="update_kan_object")
    def update_kan_object(self, request):

        kan_id = request.query_params.get("kan_id")

        flow = json.loads(request.data.get("flow", "{}"))
        skill_client.set_attr({
            "spec": flow,
            "tag_list": request.data.get("tag_list", "[]")
        })

        skill_client.patch_config(name=kan_id)

        # maintain grpc components
        is_grpc = False
        grpc_components = []
        for node in flow["nodes"]:
            # check whether there are grpc nodes to be deployed
            if node["type"] == "transform" and node["name"] == "grpc_transform" and node["configurations"]["type"] == "container":
                is_grpc = True
                grpc_components.append(
                    {
                        "name": node["configurations"]["container_name"],
                        "type": "container",
                        "metadata": {
                            "deployment.replicas": "#1",
                            "service.ports": json.dumps(
                                [{
                                    "name": f"port{node['configurations']['port']}",
                                    "port": int(node["configurations"]["port"])
                                }]),
                            "service.type": "ClusterIP"
                        },
                        "properties": {
                            "container.image": node["configurations"]["container_image"],
                            "container.imagePullPolicy": "always",
                            "container.type": "docker",
                            "container.version": "0.0.1",
                            "container.restartPolicy": node["configurations"]["restart_policy"],
                            "container.ports": json.dumps(
                                [{"containerPort": int(
                                    node["configurations"]["port"]), "protocol":"TCP"}]
                            ),
                            "container.resources": json.dumps({"requests": {"cpu": "100m", "memory": "100Mi"}})
                        }
                    }
                )

        if is_grpc and grpc_components:
            solution_client.set_attr(
                {
                    "is_grpc": is_grpc,
                    "grpc_components": grpc_components
                }
            )

        # TODO Update affected solutions (after sync deployment finished)
        affected_solutions = []
        for instance_obj in instance_client.get_objects():
            configure = json.loads(instance_obj["configure"])
            for cam in configure:
                for skill in cam['skills']:
                    if skill['id'] == kan_id:
                        affected_solutions.append(target_client.get_object(
                            instance_obj["compute_device"])["solution_id"])

        skill_client.patch_config(name=kan_id)

        logger.warning(f"Updating affected solutions: {affected_solutions}")
        for solution_id in affected_solutions:
            solution_client.touch_config(solution_id)

        return Response(skill_client.get_object(kan_id))

    @action(detail=False, methods=["delete"], url_path="delete_kan_object")
    def delete_kan_object(self, request):

        kan_id = request.query_params.get("kan_id")

        skill_client.remove_config(name=kan_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
