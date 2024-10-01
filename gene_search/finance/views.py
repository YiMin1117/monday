from django.shortcuts import render
# views.py
import yfinance as yf
from django.http import JsonResponse
from datetime import datetime

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



    