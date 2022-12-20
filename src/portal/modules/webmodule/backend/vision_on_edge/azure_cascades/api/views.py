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
from ..symphony_client import SymphonySkillClient
from ...compute_devices.symphony_client import SymphonyTargetClient, SymphonySolutionClient
from ...deployments.symphony_client import SymphonyInstanceClient
from .serializers import CascadeSerializer
from ...general.shortcuts import drf_get_object_or_404

logger = logging.getLogger(__name__)

skill_client = SymphonySkillClient()
target_client = SymphonyTargetClient()
solution_client = SymphonySolutionClient()
instance_client = SymphonyInstanceClient()


class CascadeViewSet(FiltersMixin, viewsets.ModelViewSet):
    """Cascade ModelViewSet

    Filters:
        is_demo
    """

    queryset = Cascade.objects.all()
    serializer_class = CascadeSerializer

    @action(detail=False, methods=["get"], url_path="get_properties")
    def get_properties(self, request, pk=None):

        symphony_id = request.query_params.get("symphony_id")

        logger.warning(f"Retrieving skill [{symphony_id}] config.")

        return Response(yaml.dump(skill_client.get_config_from_symphony(symphony_id)))

    @action(detail=False, methods=["get"], url_path="get_symphony_objects")
    def get_symphony_objects(self, request):

        symphony_id = request.query_params.get("symphony_id")
        logger.warning(f"Retrieving all skill configs.")
        return Response(skill_client.get_objects())

    @action(detail=False, methods=["get"], url_path="get_symphony_object")
    def get_symphony_object(self, request):

        symphony_id = request.query_params.get("symphony_id")

        if symphony_id:
            logger.warning(f"Retrieving skill [{symphony_id}] config.")
            skill = skill_client.get_object(symphony_id)

            return Response(skill)
        else:
            raise ValidationError("Not providing symphony_id")

    @action(detail=False, methods=["post"], url_path="create_symphony_object")
    def create_symphony_object(self, request):

        symphony_id = 'skill-' + str(uuid.uuid4())

        flow = json.loads(request.data.get("flow", "{}"))
        flow["displayName"] = request.data.get("name", "")
        flow["parameters"]["fpsRetrieve"] = request.data.get("fps", "")
        flow["parameters"]["accelerationRetrieve"] = request.data.get(
            "acceleration", "")
        skill_client.set_attr({
            "name": symphony_id,
            "spec": flow,
            "tag_list": request.data.get("tag_list", "[]"),
        })

        skill_client.deploy_config()
        return Response(skill_client.get_object(symphony_id))

    @action(detail=False, methods=["patch"], url_path="update_symphony_object")
    def update_symphony_object(self, request):

        symphony_id = request.query_params.get("symphony_id")

        flow = json.loads(request.data.get("flow", "{}"))
        skill_client.set_attr({
            "spec": flow,
            "tag_list": request.data.get("tag_list", "[]")
        })

        skill_client.patch_config(name=symphony_id)

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
                    if skill['id'] == symphony_id:
                        affected_solutions.append(target_client.get_object(
                            instance_obj["compute_device"])["solution_id"])

        skill_client.patch_config(name=symphony_id)

        logger.warning(f"Updating affected solutions: {affected_solutions}")
        for solution_id in affected_solutions:
            solution_client.touch_config(solution_id)

        return Response(skill_client.get_object(symphony_id))

    @action(detail=False, methods=["delete"], url_path="delete_symphony_object")
    def delete_symphony_object(self, request):

        symphony_id = request.query_params.get("symphony_id")

        skill_client.remove_config(name=symphony_id)
        return Response(status=status.HTTP_204_NO_CONTENT)
