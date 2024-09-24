from django.http import JsonResponse
from .models import BigTableV2  # 將模型替換為 BigTableV2

def get_gene_data(request):
    try:
        # 查詢資料庫中的前5筆資料
        records = BigTableV2.objects.all()[:5]
        
        # 創建一個列表來保存資料
        gene_data = []
        for record in records:
            gene_data.append({
                'gene_id': record.gene_id,
                'gene_name': record.gene_name,
                'sequence_name': record.sequence_name,
                'transcript_name': record.transcript_name,
            })
        
        # 返回JSON響應
        response = {
            'status': 'success',
            'data': gene_data
        }
    except Exception as e:
        # 如果發生錯誤，返回錯誤信息
        response = {
            'status': 'error',
            'message': str(e)
        }

    return JsonResponse(response)
