from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .utils import SupportResistance  # 引入學長的計算模組
import traceback

@csrf_exempt
def calculate_support_resistance(request):
    if request.method == 'POST':
        try:
            # 解析前端傳遞的參數
            body = json.loads(request.body.decode('utf-8'))
            stock_code = body.get('stockCode')
            start_date = body.get('startDate')
            ma_length = int(body.get('maLength'))
            ma_type = body.get('maType')
            method = body.get('method')
            
            # 呼叫 SupportResistance 類別進行計算
            sr = SupportResistance(stock_num=stock_code, start_date=start_date, ma_type=ma_type, ma_len=ma_length)
            result = sr.run(method)

            # 返回計算結果
            return JsonResponse(result, safe=False)

        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

