from django.http import JsonResponse, HttpRequest, HttpResponse

from .models import BigTableV2  # 將模型替換為 BigTableV2

import json

def getJSON(request:HttpRequest):
    body_unicode = request.body.decode('utf-8')
    body_data = json.loads(body_unicode)
    return body_data

def test(request:HttpRequest):
    return HttpResponse("Hello")

def get_gene(request):
    
    """
    searchInput:{
        searchBy:str, // "target" or "regulator"
        Gene_Name:str, // input string
    }
    """
    search_input = getJSON(request)
    try:
        records = BigTableV2.objects.get(Gene_Name=search_input["Gene_Name"])
        # 返回JSON響應
        response = {
            'status': 'success',
            'data': records.get_dict()
        }
    except Exception as e:
        # 如果發生錯誤，返回錯誤信息
        response = {
            'status': 'error',
            'message': str(e)
        }

    return JsonResponse(response)
