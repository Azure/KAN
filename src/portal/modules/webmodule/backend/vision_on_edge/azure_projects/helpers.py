# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App helpers
"""
import logging
import json

from ..azure_settings.constants import DEFAULT_SETTING_NAME
from ..azure_settings.models import Setting
from .models import Project

logger = logging.getLogger(__name__)


def create_default_objects():
    """create_default_objects"""
    logger.info("Create/update a default project.")
    setting_obj = Setting.objects.first()
    project_obj = Project.objects.filter(is_demo=False, setting=setting_obj).first()
    if project_obj:
        project_obj.save()
    else:
        Project.objects.update_or_create(
            is_demo=False,
            setting=setting_obj
        )


def create_demo_objects():
    """create demo objects"""
    logger.info("Creating demo projects.")

    # Default Settings should be created already
    default_settings = Setting.objects.filter(name=DEFAULT_SETTING_NAME)

    if not default_settings.exists():
        logger.info("Cannot find default settings....")
        return
    # =============================================
    # Simple Part Detection                     ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Part Detection Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "is_trained": True,
            "download_uri": "default_model_6parts",
        },
    )
    # =============================================
    # Part Counting                             ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Part Counting Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "is_trained": True,
            "download_uri": "scenario_models/1",
        },
    )
    # =============================================
    # Employee safety                           ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Employee Safety Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "is_trained": True,
            "download_uri": "scenario_models/2",
        },
    )
    # =============================================
    # Defect Detection                          ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Defect Detection Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "is_trained": True,
            "download_uri": "scenario_models/3",
        },
    )
    logger.info("Create demo project end.")

    # =============================================
    # Empty Shelf Alert                         ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Empty Shelf Alert Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "is_trained": True,
            "download_uri": "scenario_models/4",
        },
    )

    # =============================================
    # Total Customer Counting                   ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Total Customer Counting Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "is_trained": True,
            "download_uri": "scenario_models/5",
        },
    )

    # =============================================
    # Crowded Queue Alert                       ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Crowded Queue Alert Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "is_trained": True,
            "download_uri": "scenario_models/6",
        },
    )


def create_default_nodes():

    # =============================================
    # Cascade Demo Nodes                        ===
    # =============================================

    # default cascade node

    Project.objects.update_or_create(
        name="rtsp",
        defaults={
            "is_cascade": True,
            "node_type": "source",
            "outputs": json.dumps([
                {
                    "route": "f",
                    "type": "frame"
                }
            ])
        },
    )

    Project.objects.update_or_create(
        name="filter_transform",
        defaults={
            "is_cascade": True,
            "node_type": "transform",
            "inputs": json.dumps([
                {
                    "route": "f",
                    "type": "frame"
                }
            ]),
            "outputs": json.dumps([
                {
                    "route": "f",
                    "type": "frame"
                }
            ])
        },
    )

    Project.objects.update_or_create(
        name="grpc_transform",
        defaults={
            "is_cascade": True,
            "node_type": "transform",
            "inputs": json.dumps([
                {
                    "route": "f",
                    "type": "frame"
                }
            ]),
            "outputs": json.dumps([
                {
                    "route": "f",
                    "type": "frame"
                }
            ])
        },
    )

    Project.objects.update_or_create(
        name="video_snippet_export",
        defaults={
            "is_cascade": True,
            "node_type": "export",
            "inputs": json.dumps([
                {
                    "route": "f",
                    "type": "frame"
                }
            ])
        },
    )

    Project.objects.update_or_create(
        name="iothub_export",
        defaults={
            "is_cascade": True,
            "node_type": "export",
            "inputs": json.dumps([
                {
                    "route": "f",
                    "type": "frame"
                }
            ])
        },
    )

    Project.objects.update_or_create(
        name="mqtt_export",
        defaults={
            "is_cascade": True,
            "node_type": "export",
            "inputs": json.dumps([
                {
                    "route": "f",
                    "type": "frame"
                }
            ])
        },
    )

    Project.objects.update_or_create(
        name="iotedge_export",
        defaults={
            "is_cascade": True,
            "node_type": "export",
            "inputs": json.dumps([
                {
                    "route": "f",
                    "type": "frame"
                }
            ])
        },
    ),

    Project.objects.update_or_create(
        name="http_export",
        defaults={
            "is_cascade": True,
            "node_type": "export",
            "inputs": json.dumps([
                {
                    "route": "f",
                    "type": "frame"
                }
            ])
        },
    )
