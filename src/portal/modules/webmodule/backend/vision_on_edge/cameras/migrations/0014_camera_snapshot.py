# Generated by Django 3.0.8 on 2022-07-04 09:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cameras', '0013_camera_symphony_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='camera',
            name='snapshot',
            field=models.CharField(blank=True, default='', max_length=1000),
        ),
    ]
