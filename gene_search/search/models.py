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
    