# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App models.
"""

import datetime
import logging
import os
import threading
import time
import subprocess
import json
import uuid

from azure.cognitiveservices.vision.customvision.training.models import (
    CustomVisionErrorException,
)
from django.db import models
from django.db.models.signals import pre_save, post_save, post_delete
from django.utils import timezone
from rest_framework.exceptions import APIException

from ..azure_iot.utils import prediction_module_url
from ..azure_settings.exceptions import SettingCustomVisionAccessFailed
from ..azure_settings.models import Setting
from ..azure_app_insight.utils import get_app_insight_logger

from .symphony_client import SymphonyModelClient
from .exceptions import (
    ProjectAlreadyTraining,
    ProjectCannotChangeDemoError,
    ProjectCustomVisionError,
    ProjectResetWithoutNameError,
    ProjectTrainWithoutParts,
    ProjectWithoutSettingError,
)

logger = logging.getLogger(__name__)

ROOT = '/workspace'

model_client = SymphonyModelClient()


class Project(models.Model):
    """Project Model."""

    setting = models.ForeignKey(Setting, on_delete=models.CASCADE, null=True)
    customvision_id = models.CharField(
        max_length=200, null=True, blank=True, default=""
    )
    name = models.CharField(max_length=200, null=True, blank=True, default="")
    download_uri = models.CharField(max_length=1000, null=True, blank=True, default="")
    download_uri_fp16 = models.CharField(
        max_length=1000, null=True, blank=True, default=""
    )
    download_uri_openvino = models.CharField(
        max_length=1000, null=True, blank=True, default=""
    )
    is_prediction_module = models.BooleanField(default=False)
    prediction_uri = models.CharField(
        max_length=1000, null=True, blank=True, default=""
    )
    prediction_header = models.CharField(
        max_length=1000, null=True, blank=True, default=""
    )
    training_counter = models.IntegerField(default=0)
    is_demo = models.BooleanField(default=False)

    retraining_counter = models.IntegerField(default=0)
    maxImages = models.IntegerField(default=20)
    needRetraining = models.BooleanField(default=True)
    relabel_expired_time = models.DateTimeField(default=timezone.now)

    project_type = models.CharField(max_length=1000, null=True, blank=True, default="")
    category = models.CharField(max_length=1000, null=True, blank=True, default="")

    is_cascade = models.BooleanField(default=False)
    type = models.CharField(max_length=1000, null=True, blank=True, default="")
    node_type = models.CharField(max_length=1000, null=True, blank=True, default="")
    inputs = models.CharField(max_length=2000, null=True, blank=True, default="")
    outputs = models.CharField(max_length=2000, null=True, blank=True, default="")
    combined = models.CharField(max_length=50, null=True, blank=True, default="")
    demultiply_count = models.IntegerField(blank=True, null=True)
    openvino_library_name = models.CharField(
        max_length=1000, null=True, blank=True, default="")
    openvino_model_name = models.CharField(
        max_length=1000, null=True, blank=True, default="")
    classification_type = models.CharField(
        max_length=1000, null=True, blank=True, default="")
    is_trained = models.BooleanField(default=False)
    symphony_id = models.CharField(max_length=2000, null=True, blank=True, default="")
    tag_list = models.CharField(max_length=1000, null=True, blank=True, default="")

    def __repr__(self):
        return self.name.__repr__()

    def __str__(self):
        return self.name.__str__()

    def reset(self, name: str = None):
        """reset.

        Args:
            name (str): name
        """
        if name is None:
            raise ProjectResetWithoutNameError
        self.customvision_id = ""
        self.name = name
        self.download_uri = ""
        self.needRetraining = Project._meta.get_field("needRetraining").get_default()
        self.maxImages = Project._meta.get_field("maxImages").get_default()
        self.create_project()

    def get_trainer_obj(self):
        """get_trainer_obj."""
        if not self.setting:
            raise ProjectWithoutSettingError
        if not self.setting.is_trainer_valid:
            raise SettingCustomVisionAccessFailed
        return self.setting.get_trainer_obj()

    def get_project_obj(self):
        """get_project_obj."""
        if not self.setting:
            raise ProjectWithoutSettingError
        if not self.customvision_id:
            raise ProjectCustomVisionError
        trainer = self.setting.get_trainer_obj()
        return trainer.get_project(self.customvision_id)

    def get_prediction_uri(self):
        """get_prediction_uri"""
        if self.prediction_uri:
            return self.prediction_uri
        if self.customvision_id and self.download_uri and self.download_uri_fp16:
            return prediction_module_url()
        return self.prediction_uri

    def validate(self, raise_exception: bool = False) -> bool:
        """validate.

        Returns:
            bool: if project customvision_id valid
        """
        if not self.setting:
            if raise_exception:
                raise ProjectWithoutSettingError
            return False
        try:
            self.get_project_obj()
            logger.info("Project %s validate pass.", self.name)
            return True
        except Exception:
            logger.info("Project %s validate failed.", self.name)
            if raise_exception:
                raise ProjectCustomVisionError
            return False

    @staticmethod
    def pre_save(**kwargs):
        """pre_save.

        Args:
            kwargs:
        """
        logger.info("Project pre_save start")
        instance = kwargs["instance"]
        update_fields = kwargs["update_fields"]

        if not instance.symphony_id:
            instance.symphony_id = 'model-' + str(uuid.uuid4())

        # Pass if update relabel_only
        if update_fields == frozenset({"relabel_expired_time"}):
            logger.info("Pass pre_save (relabel_keep_alive)")
            return

        # Don't change demo project
        # if instance.is_demo and instance.id:
        #    raise ProjectCannotChangeDemoError

        # Set default name

        logger.info(
            "Project (id, customvision_id, name): (%s, %s, %s)",
            instance.id,
            instance.customvision_id,
            instance.name,
        )
        try:
            # set project name
            project = instance.get_project_obj()
            if not instance.name:
                instance.name = project.name
                logger.info("Project Found. Set instance.name to %s", instance.name)

            # check is_trained
            trainer = instance.get_trainer_obj()
            iterations = trainer.get_iterations(instance.customvision_id)
            tags_ = trainer.get_tags(instance.customvision_id)
            tag_list = [i.name for i in tags_]
            if len(iterations) > 0:
                instance.is_trained = True
            else:
                instance.is_trained = False

        except Exception:
            tag_list = []
            if not instance.name:
                instance.name = ("VisionOnEdge-" +
                                 datetime.datetime.utcnow().isoformat())
            instance.customvision_id = ""
        logger.info(
            "Project (id, customvision_id, name): (%s, %s, %s)",
            instance.id,
            instance.customvision_id,
            instance.name,
        )
        logger.info("Project pre_save end")

        az_logger = get_app_insight_logger()
        properties = {
            "custom_dimensions": {
                "create_project": json.dumps({
                    "name": instance.name,
                    "project_type": instance.project_type,
                    "tags": tag_list,
                })
            }
        }
        az_logger.warning(
            "create_project",
            extra=properties,
        )

    def dequeue_iterations(self, max_iterations: int = 2):
        """dequeue_iterations.

        Args:
            max_iterations (int): max_iterations
        """
        try:
            if not self.setting or not self.setting.validate():
                return
            if not self.customvision_id:
                return
            trainer = self.setting.get_trainer_obj()
            iterations = trainer.get_iterations(self.customvision_id)
            if len(iterations) > max_iterations:
                trainer.delete_iteration(
                    self.customvision_id, iterations[-1].as_dict()["id"]
                )
        except CustomVisionErrorException as customvision_err:
            logger.error(customvision_err)
        except Exception:
            logger.exception("dequeue_iteration error")
            raise

    def create_project(self, project_type: str = None, classification_type: str = None):
        """create_project.

        Create a project on CustomVision.
        """
        logger.info("Creating {} project".format(project_type))

        try:
            if not self.name:
                self.name = "VisionOnEdge-" + datetime.datetime.utcnow().isoformat()
            if project_type == 'ObjectDetection':
                obj_detection_domain = next(domain for domain in self.setting.get_trainer_obj(
                ).get_domains() if domain.type == project_type and domain.name == "General (compact)")
                project = self.setting.create_project(
                    project_name=self.name, domain_id=obj_detection_domain.id)
            elif project_type == 'Classification':
                obj_detection_domain = next(domain for domain in self.setting.get_trainer_obj(
                ).get_domains() if domain.type == project_type and domain.name == "General (compact)")
                project = self.setting.create_project(
                    project_name=self.name, domain_id=obj_detection_domain.id, classification_type=classification_type)
            else:
                project = self.setting.create_project(project_name=self.name)

            self.customvision_id = project.id
            self.name = project.name
            update_fields = ["customvision_id", "name"]
            self.save(update_fields=update_fields)
        except CustomVisionErrorException as customvision_err:
            logger.error("Project create_project error %s", customvision_err)
            raise customvision_err
        except Exception:
            logger.exception("Project create_project: Unexpected Error")
            raise

    def delete_tag_by_name(self, tag_name) -> None:
        """delete_tag_by_name.

        Delete tag on Custom Vision.

        Args:
            tag_name: Tag name to search on Custom Vision.
        """
        logger.info("deleting tag: %s", tag_name)
        if not self.validate():
            raise ProjectCustomVisionError
        trainer = self.setting.get_trainer_obj()
        tags = trainer.get_tags(project_id=self.customvision_id)
        for tag in tags:
            if tag.name.lower() == tag_name.lower():
                trainer.delete_tag(project_id=self.customvision_id, tag_id=tag.id)
                logger.info("tag deleted: %s", tag_name)
                return

    def delete_tag_by_id(self, tag_id) -> None:
        """delete_tag_by_id.

        Delete tag on Custom Vision.

        Args:
            tag_id: Tag id.
        """
        logger.info("Deleting tag: %s", tag_id)
        if not self.validate():
            raise ProjectCustomVisionError
        trainer = self.setting.get_trainer_obj()
        trainer.delete_tag(project_id=self.customvision_id, tag_id=tag_id)

    def is_trainable(self, raise_exception: bool = False) -> bool:
        """is_trainable.

        Args:
            raise_exception (bool): raise_exception

        Returns:
            bool: is_trainable
        """
        try:
            if self.is_demo:
                raise ProjectCannotChangeDemoError
            if not self.part_set.exists():
                raise ProjectTrainWithoutParts
            for part in self.part_set.all():
                part.is_trainable(raise_exception=True)
            for iteration in self.get_iterations():
                if iteration.status.lower() == "training":
                    raise ProjectAlreadyTraining
            return True
        except APIException:
            if raise_exception:
                raise
            return False

    def is_deployable(self, raise_exception: bool = False) -> bool:
        """is_deployable.

        Args:
            raise_exception (bool): raise_exception

        Returns:
            bool: is_trainable
        """
        try:
            if self.is_demo:
                return True
            if self.is_prediction_module:
                return True
            return self.is_trainable(raise_exception=True)
        except APIException:
            if raise_exception:
                raise
            return False

    def train_project(self):
        """train_project.

        Submit training task to CustomVision.
        Return training task submit result (boolean)
        : Success: return True
        : Failed : return False
        """
        is_task_success = False
        if not self.setting:
            raise ProjectWithoutSettingError
        if not self.setting.validate():
            raise SettingCustomVisionAccessFailed
        trainer = self.setting.get_trainer_obj()
        # Submit training task to CustomVision
        logger.info(
            "%s %s submit training task to CustomVision",
            self.customvision_id,
            self.name,
        )
        trainer.train_project(self.customvision_id)

        # If all above is success
        is_task_success = True
        return is_task_success

    def export_iteration(self, iteration_id, platform: str = "ONNX", flavor: str = ""):
        """export_iterationv3_3.

        CustomVisionTrainingClient SDK may have some issues exporting.
        Use the REST API
        """
        # trainer.export_iteration(customvision_id,
        # iteration.id,
        # 'ONNX')
        trainer = self.get_trainer_obj()
        res = trainer.export_iteration(
            project_id=self.customvision_id,
            iteration_id=iteration_id,
            platform=platform,
            flavor=flavor,
        )
        return res

    def get_exports(self, iteration_id):
        """export_iterationv3_3.

        CustomVisionTrainingClient SDK may have some issues exporting.
        Use the REST API
        """
        # trainer.export_iteration(customvision_id,
        # iteration.id,
        # 'ONNX')
        trainer = self.get_trainer_obj()
        res = trainer.get_exports(
            project_id=self.customvision_id, iteration_id=iteration_id
        )
        return res

    def get_iterations(self):
        """get_iterations"""
        trainer = self.get_trainer_obj()
        return trainer.get_iterations(project_id=self.customvision_id)

    @staticmethod
    def post_save(**kwargs):
        """post_save."""
        instance = kwargs["instance"]
        created = kwargs["created"]

        if hasattr(instance, "skip_signals") and instance.skip_signals:
            return

        if instance.category == "customvision":
            # TODO process other categories

            endpoint = os.environ.get("ENDPOINT").replace("https://", "").strip('/')
            # get customvision tags
            logger.warning(f"endpoint: {endpoint}")
            logger.warning(f"customvision_id: {instance.customvision_id}")
            if instance.customvision_id:
                trainer = instance.get_trainer_obj()
                project_name = trainer.get_project(
                    project_id=instance.customvision_id).name
                iterations = trainer.get_iterations(instance.customvision_id)
                if iterations:
                    iteration_id = iterations[0].id
                else:
                    iteration_id = ""
                tags_ = trainer.get_tags(instance.customvision_id)
                tag_list = [i.name for i in tags_]
            else:
                project_name = ""
                iteration_id = ""
                tag_list = []
            model_client.set_attr({
                "name": instance.symphony_id,
                "endpoint": endpoint,
                "display_name": instance.name,
                "project_id": instance.customvision_id,
                "model_subtype": f"customvision.{instance.project_type}",
                "model_type": "customvision",
                "iteration_id": iteration_id,
                "tags": json.dumps(tag_list),
                "tag_list": instance.tag_list,
            })

            if created:
                # create
                model_client.deploy_config(group="ai.symphony", plural="models")
            else:
                # update
                model_client.patch_config(
                    group="ai.symphony", plural="models", name=instance.symphony_id)

    @staticmethod
    def post_delete(**kwargs):
        instance = kwargs["instance"]
        model_client.remove_config(
            group="ai.symphony", plural="models", name=instance.symphony_id)


class Task(models.Model):
    """Task Model"""

    task_type = models.CharField(max_length=100)
    status = models.CharField(max_length=200)
    log = models.CharField(max_length=1000)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    def start_exporting(self):
        """start_exporting."""

        def _export_worker(self):
            """Export Model Worker"""
            project_obj = self.project
            trainer = project_obj.setting.get_trainer_obj()
            customvision_id = project_obj.customvision_id
            while True:
                time.sleep(1)
                iterations = trainer.get_iterations(customvision_id)
                if len(iterations) == 0:
                    logger.error("Failed: not yet trained")
                    self.status = "running"
                    self.log = "Failed: not yet trained"
                    self.save()
                    return

                iteration = iterations[0]
                if not iteration.exportable or iteration.status != "Completed":
                    self.status = "running"
                    self.log = "Status : training model"
                    self.save()
                    continue

                # no need to export model now
                # try:
                #     project_obj.export_iteration(iteration.id)
                # except Exception:
                #     logger.exception("Export already in queue")
                # try:
                #     project_obj.export_iteration(iteration.id, flavor="ONNXFloat16")
                # except Exception:
                #     logger.exception("Export already in queue")
                # try:
                #     project_obj.export_iteration(iteration.id, platform="OPENVINO")
                # except Exception:
                #     logger.exception("Export already in queue")
                # exports = project_obj.get_exports(iteration.id)
                # if (
                #     len(exports) < 2
                #     or not exports[0].download_uri
                #     or not exports[1].download_uri
                # ):
                #     logger.info("Status: exporting model")
                #     self.status = "running"
                #     self.log = "Status : exporting model"
                #     self.save()
                #     continue

                # logger.info(
                #     "Successfully export model. download_uri: %s",
                #     exports[0].download_uri,
                # )
                # logger.info(
                #     "Successfully export model. download_uri: %s",
                #     exports[1].download_uri,
                # )
                # logger.info(
                #     "Successfully export model. download_uri: %s",
                #     exports[2].download_uri,
                # )
                self.status = "ok"
                self.log = "Status : work done"
                self.save()
                # # Get the latest object
                # project_obj = Project.objects.get(pk=project_obj.id)
                # for export in exports:
                #     if export.flavor:
                #         project_obj.download_uri_fp16 = export.download_uri
                #     else:
                #         if "onnx" in export.platform.lower():
                #             project_obj.download_uri = export.download_uri
                #         else:
                #             project_obj.download_uri_openvino = export.download_uri

                # project_obj.save()

                # # pre-download openvino model.zip
                # model_name = project_obj.download_uri_openvino.split('/')[3][2:]
                # iteration_id = project_obj.download_uri_openvino.split(
                #     '/')[4].split('.')[0]
                # file_name = ROOT + '/' + iteration_id + '.zip'
                # logger.warning("Pre-download customvision model.zip")
                # if not os.path.isfile(file_name):
                #     subprocess.run(
                #         ['wget', '-O', file_name, project_obj.download_uri_openvino])

                break
            return

        threading.Thread(target=_export_worker, args=(self,), daemon=True).start()


pre_save.connect(Project.pre_save, Project, dispatch_uid="Project_pre")
post_save.connect(Project.post_save, Project, dispatch_uid="Project_post")
post_delete.connect(Project.post_delete, Project, dispatch_uid="Project_delete")
