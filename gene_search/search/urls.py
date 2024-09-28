from django.urls import path
from . import views

urlpatterns = [
    path('get_gene/', views.get_gene),  # 更新路由
    path('get_gene_by_type',views.get_gene_by_type)
]
