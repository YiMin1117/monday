from django.urls import path
from . import views

urlpatterns = [
    path('get_genes/', views.get_gene_data, name='get_genes'),  # 更新路由
]
