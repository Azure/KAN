# Generated by Django 3.0.8 on 2021-10-29 09:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('azure_projects', '0012_project_classification_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='is_trained',
            field=models.BooleanField(default=False),
        ),
    ]
