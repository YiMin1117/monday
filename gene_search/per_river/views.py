from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import PerRiver  # 引入你的 PerRiver 類別
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def get_per_river_data(request):
    if request.method == 'POST':
        try:
            # 獲取 POST 請求中的參數
            body = json.loads(request.body)
            stock_code = body.get("stockCode")
            time_unit = body.get("timeUnit").upper()  # 轉換為大寫（符合 PerRiver 類別要求）
            if time_unit == "QUARTER":
                time_unit = "QUAR"  # 將 quarter 替換為 quar
            print("時間單位",time_unit)
            # 確保參數完整
            if not stock_code or not time_unit:
                return JsonResponse({"error": "Missing parameters"}, status=400)

            # 調用 PerRiver 類別處理數據
            per_river = PerRiver()
            result = per_river.run(stock_code, time_unit)
            #print("here 是結果喔",result)
            return JsonResponse(result)

        except Exception as e:
            logger.error("發生錯誤: %s", str(e))
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=405)
