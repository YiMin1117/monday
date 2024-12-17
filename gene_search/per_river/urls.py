from django.urls import path
from .views import get_per_river_data

urlpatterns = [
    path('get_data/', get_per_river_data, name='get_per_river_data'),
]
