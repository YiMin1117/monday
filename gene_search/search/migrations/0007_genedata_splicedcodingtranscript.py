# Generated by Django 5.0.7 on 2024-10-21 04:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('search', '0006_rename_gene_id_bigtablev2_gene_id_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='GeneData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('init_pos', models.IntegerField()),
                ('end_pos', models.IntegerField()),
                ('evenly_rc', models.FloatField()),
                ('ref_id', models.CharField(max_length=255)),
                ('source_file', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='SplicedCodingTranscript',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('type', models.CharField(max_length=255)),
                ('start', models.IntegerField()),
                ('end', models.IntegerField()),
                ('length', models.IntegerField()),
            ],
        ),
    ]