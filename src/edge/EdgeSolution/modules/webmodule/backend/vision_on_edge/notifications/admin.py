# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""App admin.
"""

from django.contrib import admin

from .models import Notification

# Register your models here.
admin.site.register(Notification)
