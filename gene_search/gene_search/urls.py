"""
URL configuration for gene_search project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path ,include
from search import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('search/', include('search.urls')),
    path('finance/', include('finance.urls')),  # 更新路由
    # path('dj-rest-auth/', include('dj_rest_auth.urls')),  # 登入、登出、密碼重設等
    # path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),  # 註冊
]
