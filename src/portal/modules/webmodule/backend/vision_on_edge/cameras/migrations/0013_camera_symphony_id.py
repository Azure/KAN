# Generated by Django 3.0.8 on 2022-06-28 10:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cameras', '0012_auto_20220608_1116'),
    ]

    operations = [
        migrations.AddField(
            model_name='camera',
            name='symphony_id',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
    ]