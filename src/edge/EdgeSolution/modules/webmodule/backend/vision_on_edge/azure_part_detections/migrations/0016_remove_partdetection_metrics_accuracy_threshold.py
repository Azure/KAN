# Generated by Django 3.0.8 on 2020-10-06 08:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("azure_part_detections", "0015_auto_20200929_1042"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="partdetection",
            name="metrics_accuracy_threshold",
        ),
    ]
