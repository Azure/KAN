# Generated by Django 3.0.8 on 2022-09-12 09:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('azure_settings', '0002_setting_monitored_iothubs'),
    ]

    operations = [
        migrations.AddField(
            model_name='setting',
            name='client_id',
            field=models.CharField(blank=True, max_length=1000),
        ),
        migrations.AddField(
            model_name='setting',
            name='client_secret',
            field=models.CharField(blank=True, max_length=1000),
        ),
        migrations.AddField(
            model_name='setting',
            name='storage_account',
            field=models.CharField(blank=True, max_length=1000),
        ),
        migrations.AddField(
            model_name='setting',
            name='storage_container',
            field=models.CharField(blank=True, max_length=1000),
        ),
        migrations.AddField(
            model_name='setting',
            name='subscription_id',
            field=models.CharField(blank=True, max_length=1000),
        ),
        migrations.AddField(
            model_name='setting',
            name='tenant_id',
            field=models.CharField(blank=True, max_length=1000),
        ),
    ]