# Generated by Django 5.1 on 2024-09-24 08:40

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='TestModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('a_text', models.CharField(max_length=20)),
                ('a_int', models.IntegerField(default=48763)),
            ],
        ),
    ]
