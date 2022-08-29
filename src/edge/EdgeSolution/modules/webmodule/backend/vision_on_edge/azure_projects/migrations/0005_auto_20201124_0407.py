# Generated by Django 3.0.8 on 2020-11-24 04:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("azure_projects", "0004_project_download_uri_fp16"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="is_prediction_module",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="project",
            name="prediction_header",
            field=models.CharField(blank=True, default="", max_length=1000, null=True),
        ),
        migrations.AddField(
            model_name="project",
            name="prediction_uri",
            field=models.CharField(blank=True, default="", max_length=1000, null=True),
        ),
    ]
