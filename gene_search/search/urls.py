from django.urls import path
from . import views

urlpatterns = [
    path('get_gene/', views.get_gene),  # 更新路由
    path('get_gene_by_type',views.get_gene_by_type),
    path('get_transcript_data/', views.get_transcript_data ),
     path('search_ref_id/', views.search_ref_id, name='search_ref_id'),
]
