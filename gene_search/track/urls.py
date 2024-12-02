from django.urls import path
from . import views

urlpatterns = [
    path('add_track/', views.add_track, name='add_track'),
    path('get_track_list/', views.get_track_list, name='get_track_list'),
    path('get_track_data/', views.get_track_data, name='get_track_data'),
    path('delete_track/', views.delete_track, name='delete_track'),
]
