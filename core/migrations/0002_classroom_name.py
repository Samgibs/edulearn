# Generated by Django 4.2.16 on 2024-09-30 21:45

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="classroom",
            name="name",
            field=models.CharField(default="exit", max_length=100),
            preserve_default=False,
        ),
    ]
