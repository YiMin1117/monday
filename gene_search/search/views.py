from django.http import JsonResponse, HttpRequest, HttpResponse
from django.db.models import Q
from .models import BigTableV2  # 將模型替換為 BigTableV2

import json

def getJSON(request:HttpRequest):
    body_unicode = request.body.decode('utf-8')
    body_data = json.loads(body_unicode)
    return body_data



def get_gene(request):
    """
    searchInput:{
        searchBy:str, // "target" or "regulator"
        search_term:str, // input string
    }
    """
    search_input = getJSON(request)
    search_term = search_input.get("search_term", "")
    
    try:
        # 使用 Q 物件進行多字段查詢，查找匹配的記錄
        records = BigTableV2.objects.filter(
            Q(Gene_ID__iexact=search_term)|
            Q(Gene_Name__iexact=search_term) |
            Q(Sequence_Name__iexact=search_term) |
            Q(Other_Name__iexact=search_term) |
            Q(Transcript_Name__iexact=search_term)
        )
        
        # 檢查是否有找到記錄
        if records.exists():
            data = [record.get_dict() for record in records]  # 假設你有一個 get_dict() 方法
            response = {
                'status': 'success',
                'data': data
            }
        else:
            response = {
                'status': 'error',
                'message': 'No matching records found'
            }
    except Exception as e:
        # 如果發生錯誤，返回錯誤信息
        response = {
            'status': 'error',
            'message': str(e)
        }

    return JsonResponse(response)

