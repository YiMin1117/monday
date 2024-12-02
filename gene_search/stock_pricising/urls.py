from django.urls import path
from . import views

urlpatterns = [
    path('get_stock_data/', views.get_stock_data, name='get_stock_data'),
    path('pricising_calculate/', views.pricising_calculate, name='pricising_calculate'),
    path('current_prices/', views.current_prices, name='current_prices'),
]
