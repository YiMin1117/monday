from django.db import models

# Create your models here.
class BigTableV2(models.Model):
    gene_id = models.TextField(db_column='Gene_ID', blank=True, null=True)  # Field name made lowercase.
    status = models.TextField(db_column='Status', blank=True, null=True)  # Field name made lowercase.
    sequence_name = models.TextField(db_column='Sequence_Name', blank=True, null=True)  # Field name made lowercase.
    gene_name = models.TextField(db_column='Gene_Name', blank=True, null=True)  # Field name made lowercase.
    other_name = models.TextField(db_column='Other_Name', blank=True, null=True)  # Field name made lowercase.
    transcript_name = models.TextField(db_column='Transcript_Name', blank=True, null=True)  # Field name made lowercase.
    type = models.TextField(db_column='Type', blank=True, null=True)  # Field name made lowercase.
    
    def __str__(self) -> str:
        output = f"""
            id:{self.id}
            gene_id:{self.gene_id}
            status:{self.status}
            sequence_name:{self.sequence_name}
            gene_name:{self.gene_name}
            other_name:{self.other_name}
            transcript_name:{self.transcript_name}
            type:{self.type}
        """
        return output
    