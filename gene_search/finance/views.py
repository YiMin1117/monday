from django.shortcuts import render
# views.py
import yfinance as yf
from django.http import JsonResponse
from datetime import datetime
#hw2 import
from .utils.book_example.rsi_stratepy import rsi_backtest_strategy,Performance, ChartTrade,getData
from django.views.decorators.csrf import csrf_exempt
import json
import numpy as np
import pandas as pd
#hw3 import 
import backtrader as bt
from .utils.backtest_strategy import RSIStrategy



def get_stock_data(request):
    stock1 = request.GET.get('stock1')
    stock2 = request.GET.get('stock2')
    start = request.GET.get('start')
    end = request.GET.get('end')

    if not all([stock1, stock2, start, end]):
        return JsonResponse({'error': '缺少參數'}, status=400)

    try:
        start_date = datetime.strptime(start, '%Y-%m-%d')
        end_date = datetime.strptime(end, '%Y-%m-%d')

        data1 = yf.download(stock1, start=start_date, end=end_date)
        data2 = yf.download(stock2, start=start_date, end=end_date)

        # 將日期作為索引轉換為字串，方便 JSON 化
        data1 = data1.reset_index().to_dict(orient='records')
        data2 = data2.reset_index().to_dict(orient='records')

        return JsonResponse({
            'stock1': data1,
            'stock2': data2
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt   
def get_rsi_strategy_data(request):
    try:
        if request.method == 'POST':
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError as e:
                return JsonResponse({'error': f'無效的 JSON 格式: {str(e)}'}, status=400)

            # 從請求中提取參數，設置預設值
            try:
                prod = data.get('stockCode', '0050')
                start_date = data.get('startDate', '2013-01-01')
                end_date = data.get('endDate', '2022-05-01')
                short_term = int(data.get('shortTermRSI', 120))
                long_term = int(data.get('longTermRSI', 150))
            except (KeyError, ValueError, TypeError) as e:
                return JsonResponse({'error': f'解析輸入參數錯誤: {str(e)}'}, status=400)

            # 調用策略函數並分別捕捉錯誤
            try:
                trade_data = rsi_backtest_strategy(prod, start_date, end_date, short_term, long_term)
            except Exception as e:
                return JsonResponse({'error': f'策略執行錯誤 (rsi_backtest_strategy): {str(e)}'}, status=500)

            try:
                performance_data = Performance(trade_data)
            except Exception as e:
                return JsonResponse({'error': f'績效分析錯誤 (Performance): {str(e)}'}, status=500)

            try:
                data_for_chart = getData(prod, start_date, end_date)
                chart_data = ChartTrade(data_for_chart, trade_data)
            except Exception as e:
                return JsonResponse({'error': f'圖表繪製錯誤 (ChartTrade): {str(e)}'}, status=500)
            


           # 確保在轉換成 JSON 格式之前，處理掉所有的 NaN 值
            if isinstance(trade_data, pd.DataFrame):
                trade_data = trade_data.replace({np.nan: None})
            chart_data = replace_nan_in_dict(chart_data)
            # 將 DataFrame 轉換為 JSON 格式返回
            response = {
                'trade_data': trade_data.to_dict(orient='records'),
                'performance_data': performance_data,
                'chart_data': chart_data
            }
            
            return JsonResponse(response, safe=False)

        else:
            return JsonResponse({'error': '僅支持 POST 請求'}, status=405)

    except Exception as e:
        return JsonResponse({'error': f'伺服器未知錯誤: {str(e)}'}, status=500)

# 如果 chart_data 是一個字典，則需要手動替換其中的 NaN 值
def replace_nan_in_dict(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, float) and np.isnan(value):
                data[key] = None
            elif isinstance(value, list):
                data[key] = [None if isinstance(item, float) and np.isnan(item) else item for item in value]
            elif isinstance(value, dict):
                replace_nan_in_dict(value)
    return data





def backtest_rsi_strategy(request):
    try:
        data = json.loads(request.body)
        stock = data.get('stock', '2330.TW')  # 預設股票代碼
        start_date = data.get('start_date', '2016-01-01')
        end_date = data.get('end_date', '2024-01-01')
        entry_strategy = data.get('entry_strategy_type', 'entry_strategy1')
        exit_strategy = data.get('exit_strategy_type', 'exit_strategy1')
        rsi_short_period = int(data.get('rsi_short_period', 7))
        rsi_long_period = int(data.get('rsi_long_period', 14))
        initial_capital=float(data.get('initialCapital',1000000))
        transaction_fee=float(data.get('transactionFee',0.001425))
        stack=int(data.get('stack',1000))

        # 加載股票數據
        data = yf.download(stock, start=start_date, end=end_date)

        # 準備數據格式，讓 Backtrader 接收
        datafeed = bt.feeds.PandasData(dataname=data)

        # 設置 Cerebro 引擎
        cerebro = bt.Cerebro()
        cerebro.addstrategy(RSIStrategy,
                            entry_strategy_type=entry_strategy,
                            exit_strategy_type=exit_strategy,
                            rsi_short_period=rsi_short_period,
                            rsi_long_period=rsi_long_period)

        cerebro.adddata(datafeed)
        cerebro.broker.setcash(initial_capital)  # 設定初始資金
        cerebro.broker.setcommission(commission=transaction_fee)
        cerebro.addsizer(bt.sizers.FixedSize, stake=stack)
        # print('starting portfolio value: %.2f'% cerebro.broker.getvalue())
        # 執行策略前檢查初始資金
  

        # 添加分析工具
        cerebro.addanalyzer(bt.analyzers.TimeReturn, timeframe=bt.TimeFrame.Years, _name='timereturn')
        cerebro.addanalyzer(bt.analyzers.AnnualReturn, _name='AnnualReturn')
        cerebro.addanalyzer(bt.analyzers.SharpeRatio, _name='SharpeRatio', riskfreerate=0.2)
        cerebro.addanalyzer(bt.analyzers.DrawDown, _name='DrawDown')
        cerebro.addanalyzer(bt.analyzers.TradeAnalyzer, _name='trade_analyzer')
        cerebro.addanalyzer(bt.analyzers.Returns, _name='returns')
        cerebro.addanalyzer(bt.analyzers.Transactions, _name='transactions')

        # 執行策略
        results = cerebro.run()
        # 執行策略後檢查資金變化

        strat:RSIStrategy = results[0]
        print(type(strat))
        # 提取資產信息和分析器數據
     
        final_value = cerebro.broker.getvalue()    # 最終資產價值
        # 提取 Sharpe Ratio 和最大回撤數據
        sharpe_ratio = strat.analyzers.SharpeRatio.get_analysis()['sharperatio']
        max_drawdown = strat.analyzers.DrawDown.get_analysis().max.drawdown
        # 提取年度回報
        annual_returns = strat.analyzers.AnnualReturn.get_analysis()
        transactions = strat.analyzers.transactions.get_analysis()
        # 提取交易信息並展平
        transactions_list = []
        for date, transaction_details in transactions.items():
            for detail in transaction_details:
                transactions_list.append({
                    'date': str(date),  # 將日期轉為字符串格式
                    'amount': detail[0],  # 買賣數量
                    'price': detail[1],   # 買賣價格
                    'value': detail[0] * detail[1]  # 總價值（數量 * 單價）
                })
        print('================\n',transactions_list)

        return JsonResponse({
            'initial_value': initial_capital,
            'final_value': final_value,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': max_drawdown,
            'annual_returns': [{'year': k, 'return': v} for k, v in annual_returns.items()],
            'transactions': transactions_list
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


