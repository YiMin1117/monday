from django.urls import path
from .views import calculate_support_resistance

urlpatterns = [
    path('calculate/', calculate_support_resistance, name='calculate_support_resistance'),
]
