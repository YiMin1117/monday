from django.db import models

# Create your models here.
class BigTableV2(models.Model):
    Gene_ID = models.TextField(db_column='Gene_ID', blank=True, null=True)  # Field name made lowercase.
    Status = models.TextField(db_column='Status', blank=True, null=True)  # Field name made lowercase.
    Sequence_Name = models.TextField(db_column='Sequence_Name', blank=True, null=True)  # Field name made lowercase.
    Gene_Name = models.TextField(db_column='Gene_Name', blank=True, null=True)  # Field name made lowercase.
    Other_Name = models.TextField(db_column='Other_Name', blank=True, null=True)  # Field name made lowercase.
    Transcript_Name = models.TextField(db_column='Transcript_Name', blank=True, null=True)  # Field name made lowercase.
    Type = models.TextField(db_column='Type', blank=True, null=True)  # Field name made lowercase.
    
    def __str__(self) -> str:
        output = f"""
            id:{self.id}
            Gene_ID:{self.Gene_ID}
            Status:{self.Status}
            Sequence_Name:{self.Sequence_Name}
            Gene_Name:{self.Gene_Name}
            Other_Name:{self.Other_Name}
            Transcript_Name:{self.Transcript_Name}
            Type:{self.Type}
        """
        return output
    
    def get_dict(self):
        return {
            "id":self.id,
            "Gene_ID":self.Gene_ID,
            "Status":self.Status,
            "Sequence_Name":self.Sequence_Name,
            "Gene_Name":self.Gene_Name,
            "Other_Name":self.Other_Name,
            "Transcript_Name":self.Transcript_Name,
            "Type":self.Type,
        }

# 針對 bedgraph 文件的模型
class GeneData(models.Model):
    init_pos = models.IntegerField()
    end_pos = models.IntegerField()
    evenly_rc = models.FloatField()
    ref_id = models.CharField(max_length=255)
    source_file = models.CharField(max_length=255)  # 用來標記文件來源

    def __str__(self):
        return f'{self.ref_id} ({self.init_pos}-{self.end_pos}) from {self.source_file}'

# 針對 spliced_codingtranscript_293.csv 的模型
class SplicedCodingTranscript(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    start = models.IntegerField()
    end = models.IntegerField()
    length = models.IntegerField()

    def __str__(self):
        return f'{self.name} ({self.type})'