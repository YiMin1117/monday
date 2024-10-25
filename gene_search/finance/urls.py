from django.urls import path
from .views import get_stock_data,get_rsi_strategy_data,backtest_rsi_strategy

urlpatterns = [
    path('api/get-stock-data/', get_stock_data, name='get_stock_data'),
    path('api/rsi-strategy/', get_rsi_strategy_data, name='rsi_strategy'),
    path('api/backtest/',backtest_rsi_strategy,name='backtrader_strategy'),
]