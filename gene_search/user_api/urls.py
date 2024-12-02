from django.urls import path
from . import views

urlpatterns = [
	path('register', views.UserRegister.as_view(), name='register'),
	path('login', views.UserLogin.as_view(), name='login'),
	path('logout', views.UserLogout.as_view(), name='logout'),
	path('user', views.UserView.as_view(), name='user'),
    path('session-check', views.SessionCheckView.as_view(), name='session-check'),
    path('token-refresh', views.TokenRefreshView.as_view(), name='token-refresh'),
]