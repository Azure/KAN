# Generated by Django 3.0.8 on 2023-01-19 08:26

from django.db import migrations, models
import django.db.models.deletion
import vision_on_edge.cameras.constants


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('locations', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Camera',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('rtsp', models.CharField(blank=True, max_length=1000)),
                ('area', models.CharField(blank=True, max_length=1000)),
                ('lines', models.CharField(blank=True, default=vision_on_edge.cameras.constants.gen_default_lines, max_length=1000)),
                ('danger_zones', models.CharField(blank=True, default=vision_on_edge.cameras.constants.gen_default_zones, max_length=1000)),
                ('is_demo', models.BooleanField(default=False)),
                ('is_live', models.BooleanField(default=True)),
                ('media_type', models.CharField(blank=True, max_length=1000)),
                ('tag_list', models.CharField(blank=True, default='', max_length=1000, null=True)),
                ('username', models.CharField(blank=True, default='', max_length=200)),
                ('password', models.CharField(blank=True, default='', max_length=200)),
                ('allowed_devices', models.CharField(blank=True, default='[]', max_length=1000)),
                ('symphony_id', models.CharField(blank=True, default='', max_length=200)),
                ('snapshot', models.CharField(blank=True, default='', max_length=1000, null=True)),
                ('status', models.CharField(blank=True, default='', max_length=1000)),
                ('location', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='locations.Location')),
            ],
        ),
    ]
