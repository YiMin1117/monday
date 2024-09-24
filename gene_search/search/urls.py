from django.urls import path
from . import views

urlpatterns = [
    path('', views.test),
    path('get_gene/', views.get_gene),  # 更新路由
]
