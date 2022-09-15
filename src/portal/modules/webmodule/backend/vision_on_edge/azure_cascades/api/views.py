# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import datetime
import logging
from distutils.util import strtobool

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Cascade
from .serializers import CascadeSerializer
from ...general.shortcuts import drf_get_object_or_404

logger = logging.getLogger(__name__)


class CascadeViewSet(FiltersMixin, viewsets.ModelViewSet):
    """Cascade ModelViewSet

    Filters:
        is_demo
    """

    queryset = Cascade.objects.all()
    serializer_class = CascadeSerializer

    @action(detail=True, methods=["get"], url_path="get_properties")
    def get_properties(self, request, pk=None):
        queryset = self.get_queryset()
        instance = drf_get_object_or_404(queryset, pk=pk)

        logger.warning(f"Retrieving skill [{instance.symphony_id}] config.")

        return Response(instance.get_properties())
