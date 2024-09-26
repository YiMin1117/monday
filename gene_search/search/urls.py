from django.urls import path
from . import views

urlpatterns = [
    path('get_gene/', views.get_gene),  # 更新路由
]
