import csv
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from search.models import GeneData, SplicedCodingTranscript

class Command(BaseCommand):
    help = 'Imports gene data from multiple CSV files into the database'

    def handle(self, *args, **kwargs):
        # 獲取 BASE_DIR 的父層目錄
        parent_dir = os.path.abspath(os.path.join(settings.BASE_DIR, os.pardir))

        # 定義批次大小
        batch_size = 1000

        # bedgraph 類型 CSV 文件的絕對路徑
        bedgraph_files = [
            os.path.join(parent_dir, 'csv', 'HW4_answer', 'SRR20334757_m0_bedgraph.csv'),
            os.path.join(parent_dir, 'csv', 'HW4_answer', 'SRR20334757_m1_bedgraph.csv'),
            os.path.join(parent_dir, 'csv', 'HW4_answer', 'SRR20334757_m2_bedgraph.csv')
        ]

        for file_path in bedgraph_files:
            print(f'Importing data from: {file_path}')
            gene_data_list = []  # 暫存當前批次的資料
            with open(file_path, 'r') as csvfile:
                reader = csv.DictReader(csvfile)
                for i, row in enumerate(reader):
                    gene_data_list.append(
                        GeneData(
                            init_pos=int(row['init_pos']),
                            end_pos=int(row['end_pos']),
                            evenly_rc=float(row['evenly_rc']),
                            ref_id=row['ref_id'],
                            source_file=file_path.split('/')[-1]  # 用檔案名標記資料來源
                        )
                    )

                    # 當批次大小達到限制時，插入資料並清空列表
                    if len(gene_data_list) >= batch_size:
                        GeneData.objects.bulk_create(gene_data_list)
                        gene_data_list = []  # 清空批次列表

                # 插入剩下的資料
                if gene_data_list:
                    GeneData.objects.bulk_create(gene_data_list)

            print(f'Successfully imported data from {file_path}')

        # 匯入 spliced_codingtranscript_293.csv 的資料
        spliced_path = os.path.join(parent_dir, 'csv', 'HW4_answer', 'spliced_codingtranscript_293.csv')
        print(f'Importing data from: {spliced_path}')
        spliced_data_list = []
        with open(spliced_path, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            for i, row in enumerate(reader):
                try:
                    spliced_data_list.append(
                        SplicedCodingTranscript(
                            name=row['name'],
                            type=row['type'],
                            start=int(row['start']) if row['start'] else 0,  # 檢查空值
                            end=int(row['end']) if row['end'] else 0,        # 檢查空值
                            length=int(row['length']) if row['length'] else 0  # 檢查空值
                        )
                    )
                except ValueError as e:
                    print(f"Skipping row {i} due to error: {e}")
                    continue  # 如果有問題就跳過該行

                # 當批次大小達到限制時，插入資料並清空列表
                if len(spliced_data_list) >= batch_size:
                    SplicedCodingTranscript.objects.bulk_create(spliced_data_list)
                    spliced_data_list = []  # 清空批次列表

            # 插入剩下的資料
            if spliced_data_list:
                SplicedCodingTranscript.objects.bulk_create(spliced_data_list)

        self.stdout.write(self.style.SUCCESS('Successfully imported data from all CSV files'))
