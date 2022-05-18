"""App admin.
"""

from django.contrib import admin

from .models import ComputeDevice

# Register your models here.
admin.site.register(ComputeDevice)
