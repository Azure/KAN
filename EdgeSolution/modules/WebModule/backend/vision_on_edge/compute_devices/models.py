"""App models.
"""

import logging
import json

from django.db import models
from django.db.models.signals import post_save
from django.contrib.postgres.fields import ArrayField

from ..azure_app_insight.utils import get_app_insight_logger
from ..azure_settings.models import Setting

logger = logging.getLogger(__name__)


class ComputeDevice(models.Model):
    """ComputeDevice Model."""

    name = models.CharField(max_length=1000, null=True, blank=True, default="")
    iothub = models.CharField(max_length=1000, null=True, blank=True, default="")
    iotedge_device = models.CharField(max_length=1000, null=True, blank=True, default="")
    architecture = models.CharField(max_length=1000, null=True, blank=True, default="")
    acceleration = models.CharField(max_length=1000, null=True, blank=True, default="")
    tag_list = models.CharField(max_length=1000, null=True, blank=True, default="")