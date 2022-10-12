# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import logging
import json

from ..general.symphony_client import SymphonyClient


logger = logging.getLogger(__name__)


class SymphonyModelClient(SymphonyClient):

    def __init__(self):
        super().__init__()
        self.group = "ai.symphony"
        self.plural = "models"

    def get_config(self):

        name = self.args.get("name", "")
        endpoint = self.args.get("endpoint", "")
        display_name = self.args.get("display_name", "")
        project_id = self.args.get("project_id", "")
        model_subtype = self.args.get("model_subtype", "")
        model_type = self.args.get("model_type", "")
        iteration_id = self.args.get("iteration_id", "")
        tags = self.args.get("tags", "")
        tag_list = self.args.get("tag_list", "[]")

        labels = {}
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        config_json = {
            "apiVersion": "ai.symphony/v1",
            "kind": "Model",
            "metadata": {
                "name": name,
                "labels": labels
            },
            "spec": {
                "properties": {
                    "model.endpoint": endpoint,
                    "model.project": project_id,
                    "model.subtype": model_subtype,
                    "model.type": model_type,
                    "model.symphony.id": name,
                    "model.version.1": iteration_id,
                    "state": "trained",
                    "tags": tags
                },
                "displayName": display_name,
            },
        }
        return config_json

    def get_patch_config(self):

        tag_list = self.args.get("tag_list", "[]")

        labels = {}
        if tag_list:
            for tag in json.loads(tag_list):
                labels[tag["name"]] = tag["value"]

        # can only patch labels on portal for now
        patch_config = [
            {'op': 'replace', 'path': '/metadata/labels', 'value': labels},
        ]
        return patch_config

    def load_symphony_objects(self):
        from .models import Project
        from ..azure_settings.models import Setting
        from .utils import pull_cv_project_helper

        api = self.get_client()

        if api:
            res = api.list_namespaced_custom_object(
                group="ai.symphony",
                version="v1",
                namespace="default",
                plural="models"
            )
            targets = res['items']

            # record to-delete model
            model_table = {model[0]: model[1] for model in Project.objects.filter(
                node_type="model").values_list('name', 'pk')}

            for target in targets:
                symphony_id = target['metadata']['name']
                project_type = target['spec']['properties'].get("model.subtype", "").split('.')[
                    1]
                _type = target['spec']['properties'].get(
                    "model.subtype", "").split('.')[0]
                display_name = target['spec'].get("displayName", symphony_id)
                category = target['spec']['properties'].get("model.type", "")
                project = target['spec']['properties'].get("model.project", "")

                if display_name in model_table.keys():
                    logger.warning(f'Project {display_name} already exists.. ')
                    model_table.pop(display_name)
                    continue

                setting_obj = Setting.objects.first()
                logger.warning(f"Creating project: {display_name}")

                if _type == "customvision":
                    pull_cv_project_helper(
                        customvision_project_id=project, is_partial=True, name=display_name, symphony_id=symphony_id)
                else:
                    project_obj = Project.objects.create(
                        setting=setting_obj,
                        name=display_name,
                        customvision_id=project,
                        project_type=project_type,
                        is_demo=False,
                        type=_type,
                        category=category,
                        node_type="model",
                        symphony_id=symphony_id,
                        inputs=json.dumps([
                            {
                                "route": "f",
                                "type": "frame"
                            }
                        ]),
                        outputs=json.dumps([
                            {
                                "route": "f",
                                "type": "frame"
                            }
                        ]),
                    )
                    logger.info("Project: %s.", project_obj)

            to_delete = list(model_table.values())
            logger.warning(f"Models to delete: {model_table.keys()}")
            # this would not trigger pre/post delete, get instance and delete if needed
            Project.objects.filter(id__in=to_delete).all().delete()

        else:
            logger.warning("Not loading symphony models")
