from ..models import BigTableV2
import requests
from django.http import JsonResponse
import pandas as pd

def get_url(transcript_type,transcript_name):
    if transcript_type in {'pseudogenic_transcripts', 'Transposon-pseudogenic_transcript'}:
        url = f'https://wormbase.org/rest/widget/pseudogene/{transcript_name}/sequences'
    elif transcript_type == 'Transposon-mRNA':
        url = f'https://wormbase.org/rest/widget/cds/{transcript_name}/sequences'
    else:
        url = f'https://wormbase.org/rest/widget/transcript/{transcript_name}/sequences'
    return url
def extract_spliced (data,transcript_type,transcript_name):
    if data['fields']['spliced_sequence_context']['data']['strand'] == '+':
        table = data['fields']['spliced_sequence_context']['data']['positive_strand']['features']
        spliced_sequence = data['fields']['spliced_sequence_context']['data']['positive_strand']['sequence']
    else:
        table = data['fields']['spliced_sequence_context']['data']['negative_strand']['features']
        spliced_sequence = data['fields']['spliced_sequence_context']['data']['negative_strand']['sequence']
    
    if transcript_name in{'VT23B5.1','F56F12.8','Y17G7A.2','C30D11.2','Y52B11B.2','C05A9.3'}:
        table = data['fields']['predicted_exon_structure']['data'] 
        spliced_df = pd.DataFrame(table)
        spliced_df=spliced_df.drop(columns=['no'])
        spliced_df['type'] = 'exon'
        spliced_df=spliced_df.rename(columns={'end':'stop'})
        return spliced_df,spliced_sequence
    spliced_df = pd.DataFrame(table)
    spliced_df['length'] = spliced_df['stop'] - spliced_df['start'] + 1
    spliced_df = spliced_df[['type', 'start', 'stop', 'length']]
    
    #    type  start  stop  length
    # 0  exon      1   151     151
    # Determine CDS start and stop
    if transcript_type == 'coding_transcript':
        if 'five_prime_UTR' in spliced_df['type'].values:
            last_five_prime_utr_stop = spliced_df[spliced_df['type'] == 'five_prime_UTR']['stop'].max()
        else:
            last_five_prime_utr_stop = spliced_df[spliced_df['type'] == 'exon']['start'].min() - 1

        if 'three_prime_UTR' in spliced_df['type'].values:
            first_three_prime_utr_start = spliced_df[spliced_df['type'] == 'three_prime_UTR']['start'].min()
        else:
            first_three_prime_utr_start = spliced_df[spliced_df['type'] == 'exon']['stop'].max() + 1

        cds_start = last_five_prime_utr_stop + 1
        cds_stop = first_three_prime_utr_start - 1
        
        # Add CDS row
        spliced_df.loc[len(spliced_df)] = ['cds', cds_start, cds_stop, cds_stop - cds_start + 1]
        # Rename exon types
    exon_counter = 1
    for index, row in spliced_df.iterrows():
        if row['type'] == 'exon':
            spliced_df.at[index, 'type'] = f'exon{exon_counter}'
            exon_counter += 1
    
    return spliced_df,spliced_sequence

def extract_unspliced(data,transcript_name):
    if data['fields']['unspliced_sequence_context']['data']['strand'] == '+':
        table = data['fields']['unspliced_sequence_context']['data']['positive_strand']['features']
        unspliced_sequence = data['fields']['unspliced_sequence_context']['data']['positive_strand']['sequence']
    else:
        table = data['fields']['unspliced_sequence_context']['data']['negative_strand']['features']
        unspliced_sequence = data['fields']['unspliced_sequence_context']['data']['negative_strand']['sequence']
    if transcript_name in{'VT23B5.1','F56F12.8','Y17G7A.2','C30D11.2','Y52B11B.2','C05A9.3'}:
        table = data['fields']['predicted_exon_structure']['data'] 
        unspliced_df = pd.DataFrame(table)
        unspliced_df=unspliced_df.drop(columns=['no'])
        unspliced_df['type'] = 'exon'
        unspliced_df=unspliced_df.rename(columns={'end':'stop'})

        return unspliced_df,unspliced_sequence
    unspliced_df = pd.DataFrame(table)
    unspliced_df['length'] = unspliced_df['stop'] - unspliced_df['start'] + 1
    unspliced_df = unspliced_df[['type', 'start', 'stop', 'length']]

    # Rename exon types
    exon_counter = 1
    intron_counter = 1
    for index, row in unspliced_df.iterrows():
        if row['type'] == 'exon':
            unspliced_df.at[index, 'type'] = f'exon{exon_counter}'
            exon_counter += 1
        elif row['type'] == 'intron':
            unspliced_df.at[index, 'type'] = f'intron{intron_counter}'
            intron_counter +=1
    
    return unspliced_df,unspliced_sequence
def crawler(transcript_name):
    try:
        # 使用 Django ORM 查詢數據庫
        transcript_info = BigTableV2.objects.get(Transcript_Name=transcript_name)

        # 根據查詢到的數據構建請求 URL
        transcript_type = transcript_info.Type
        url=get_url(transcript_type,transcript_name)
        # 發送請求到外部 API
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers)
        data=response.json()
        

        if transcript_type in {'pseudogenic_transcripts', 'Transposon-pseudogenic_transcript'}:
        # 對於 pseudogene 的邏輯
            spliced_table= data['fields']['predicted_exon_structure']['data']
            spliced_df=unspliced_df=pd.DataFrame(spliced_table)
            if data['fields']['sequence_context']['data']['strand']=='+':
                spliced_seq=unspliced_seq=data['fields']['sequence_context']['data']['positive_strand']['sequence']
            else:
                spliced_seq=unspliced_seq=data['fields']['sequence_context']['data']['negative_strand']['sequence']
            spliced_df=spliced_df.rename(columns={'end':'stop'})
            spliced_df=spliced_df.rename(columns={'no':'type'})
            spliced_df['type'] = 'index'
            unspliced_df=spliced_df.rename(columns={'end':'stop'})
            unspliced_df=spliced_df.rename(columns={'no':'type'})
            unspliced_df['type'] = 'index'
            print(spliced_df)
            protein_seq= None


        elif transcript_type == 'Transposon-mRNA':
            if data['fields']['cds_sequence']['data']['strand'] == '+':
                spliced_table  = data['fields']['cds_sequence']['data']['positive_strand']['features']
                spliced_seq=unspliced_seq = data['fields']['cds_sequence']['data']['positive_strand']['sequence']
            else:
                spliced_table = data['fields']['cds_sequence']['data']['negative_strand']['features']
                spliced_seq=unspliced_seq = data['fields']['cds_sequence']['data']['negative_strand']['sequence']
            spliced_df=pd.DataFrame(spliced_table)
            unspliced_df = pd.DataFrame(spliced_table)
            protein_seq = data['fields']['protein_sequence']['data']


        else:
            # 處理 coding 或 non-coding 的邏輯
            
            spliced_df,spliced_seq = extract_spliced(data,transcript_type,transcript_name)
            
            unspliced_df,unspliced_seq = extract_unspliced(data,transcript_name)
          
            if transcript_type == 'coding_transcript':
                protein_seq = data['fields']['protein_sequence']['data']['sequence']
            else: #non-coding
                protein_seq = None
                
        return spliced_df,spliced_seq,unspliced_df,unspliced_seq,protein_seq
    except BigTableV2.DoesNotExist:
            return JsonResponse({'error': f'Transcript ID \'{transcript_name}\' not found in the database.'}, status=404)