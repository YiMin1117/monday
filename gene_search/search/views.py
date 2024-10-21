from django.http import JsonResponse, HttpRequest, HttpResponse
from django.db.models import Q
from .models import BigTableV2,GeneData, SplicedCodingTranscript  # 將模型替換為 BigTableV2
from .utils.trans_crawler import crawler
import json
import os



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

from django.db.models import Q
from django.http import JsonResponse

def get_gene_by_type(request):
    
    """
    {
        mrna: false,
        nonCodingRNA: {
            selectAll: false,
            types: {
                '7kncRNA': false,
                ncRNA: false,
                asRNA: false,
                circRNA: false,
                lincRNA: false,
                miRNA: false,
                preMiRNA: false,
                rRNA: false,
                scRNA: false,
                miRNAPrimaryTranscript: false,
                nonCodingTranscript: false,
                snoRNA: false,
                snRNA: false,
                tRNA: false,
                transposonNcRNA: false,
                transposonMrna: false,
            }
        }
    }
    """
    search_type = getJSON(request)  # 獲取前端發送的 JSON 數據
    mrna = search_type.get('mrna', False)  # 獲取 mRNA 是否選中
    non_coding_rna = search_type.get('nonCodingRNA', {}).get('types', {})  # 獲取 nonCodingRNA 的類型

    try:
        # 初始化 Q 對象列表
        queries = []

        # 如果 mRNA 被選中，加入查詢條件
        if mrna:
            queries.append(Q(Type__iexact="coding_transcript"))

        # 處理 nonCodingRNA 的選擇，將選中的類型加入查詢條件
        for rna_type, selected in non_coding_rna.items():
            if selected:  # 如果某個 RNA 類型被選中
                queries.append(Q(Type__iexact=rna_type))
        # 如果有任何查詢條件，進行篩選
        if queries:
            # 用 OR (`|`) 組合所有條件來匹配多個選中的 RNA 類型
            final_query = queries.pop()
            for query in queries:
                final_query |= query  # 使用 OR (|) 組合查詢條件
            #print(final_query)
            # 執行查詢
            records = BigTableV2.objects.filter(final_query)
            #print(records)
        else:
            records = BigTableV2.objects.none()  # 如果沒有任何選中，返回空查詢
        # 檢查是否有找到記錄
        if records.exists():
            data = [record.get_dict() for record in records]  # 假設你有一個 get_dict() 方法來轉換記錄
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
def get_transcript_data(request):
    if request.method == 'POST':
        # 從請求中獲取 transcript_name
        try:
            data = json.loads(request.body)  # 解析 JSON 數據
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
        try:
            transcript_name = data.get('transcript_name', '')
            print(f"Fetching data for transcript: {transcript_name}")
            
            # 調用 crawler 函數來獲取 spliced_df, spliced_sequence 等數據
            spliced_df, spliced_sequence, unspliced_df, unspliced_sequence, protein_str = crawler(transcript_name)
            
            # 如果沒有抓到 spliced/unspliced data，返回空數組
            spliced_data = spliced_df.to_dict(orient='records') if not spliced_df.empty else []
            unspliced_data = unspliced_df.to_dict(orient='records') if not unspliced_df.empty else []

            # 如果沒有抓到序列，返回空字串
            spliced_sequence = spliced_sequence if spliced_sequence else ""
            unspliced_sequence = unspliced_sequence if unspliced_sequence else ""
            protein_data = protein_str if protein_str else ""

            response = {
            'spliced_data': spliced_data,
            'spliced_sequence': spliced_sequence,
            'unspliced_data': unspliced_data,
            'unspliced_sequence': unspliced_sequence,
            'protein_data': protein_data,
            'message': 'Data fetched successfully' if spliced_data or unspliced_data else 'No data found'
            }
            
            return JsonResponse(response)

        # 假如你需要處理其他異常，例如數據庫查詢異常
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

def search_ref_id(request):
    ref_id = request.GET.get('ref_id', None)  # 從 URL 參數中獲取 ref_id
    if not ref_id:
        return JsonResponse({'error': 'No ref_id provided'}, status=400)
    # 完整路徑
    base_dir = r'C:\Users\jimmy\Desktop\monday\csv\HW4_answer'
    # 查詢 GeneData 的資料，分別來自 m0, m1, m2
    gene_data_m0 = GeneData.objects.filter(ref_id=ref_id, source_file=os.path.join(base_dir,'SRR20334757_m0_bedgraph.csv'))
    gene_data_m1 = GeneData.objects.filter(ref_id=ref_id, source_file=os.path.join(base_dir,'SRR20334757_m1_bedgraph.csv'))
    gene_data_m2 = GeneData.objects.filter(ref_id=ref_id, source_file=os.path.join(base_dir,'SRR20334757_m2_bedgraph.csv'))

    # 查詢 SplicedCodingTranscript 的資料
    spliced_info = SplicedCodingTranscript.objects.filter(name=ref_id)

    # 將查詢結果轉換成 JSON 格式
    def format_gene_data(data):
        return [{
            'init_pos': gene.init_pos,
            'end_pos': gene.end_pos,
            'evenly_rc': gene.evenly_rc,
            'ref_id': gene.ref_id,
        } for gene in data]

    def format_spliced_data(data):
        return [{
            'name': transcript.name,
            'type': transcript.type,
            'start': transcript.start,
            'end': transcript.end,
            'length': transcript.length
        } for transcript in data]

    # 將資料組織成指定格式
    response_data = {
        'm0': format_gene_data(gene_data_m0) if gene_data_m0.exists() else [],
        'm1': format_gene_data(gene_data_m1) if gene_data_m1.exists() else [],
        'm2': format_gene_data(gene_data_m2) if gene_data_m2.exists() else [],
        'spliced_info': format_spliced_data(spliced_info) if spliced_info.exists() else []
    }

    return JsonResponse(response_data, safe=False)