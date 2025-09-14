from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Commented out to prevent database access during startup
        # from .models import create_admin_group
        # create_admin_group()  # Re-enable this after migrations
        pass
