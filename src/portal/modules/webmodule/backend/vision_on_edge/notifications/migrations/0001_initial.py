# Generated by Django 3.0.8 on 2023-01-19 08:26

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(choices=[('project', 'project'), ('part_detection', 'part_detection')], default='project', max_length=20)),
                ('sender', models.CharField(default='system', max_length=200)),
                ('timestamp', models.DateTimeField(auto_now=True)),
                ('title', models.CharField(max_length=200)),
                ('details', models.CharField(blank=True, default='', max_length=1000)),
            ],
        ),
    ]
