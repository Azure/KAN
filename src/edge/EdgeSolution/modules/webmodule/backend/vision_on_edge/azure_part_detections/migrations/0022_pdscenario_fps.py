# Generated by Django 3.0.8 on 2021-05-17 09:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('azure_part_detections', '0021_auto_20210209_0858'),
    ]

    operations = [
        migrations.AddField(
            model_name='pdscenario',
            name='fps',
            field=models.FloatField(default=0.0),
        ),
    ]
