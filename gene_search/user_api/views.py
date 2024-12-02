from django.contrib.auth import get_user_model, login, logout
from rest_framework.authentication import SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserRegisterSerializer, UserLoginSerializer, UserSerializer
from rest_framework import permissions, status
from .validations import custom_validation, validate_email, validate_password
from django.utils import timezone
from django.conf import settings
from django.contrib.sessions.models import Session
from datetime import timedelta


#User = get_user_model()

class UserRegister(APIView):
	permission_classes = (permissions.AllowAny,)
	def post(self, request):
		clean_data = custom_validation(request.data)
		serializer = UserRegisterSerializer(data=clean_data)
		if serializer.is_valid(raise_exception=True):
			user = serializer.create(clean_data)
			if user:
				return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(status=status.HTTP_400_BAD_REQUEST)


class UserLogin(APIView):
	permission_classes = (permissions.AllowAny,)
	authentication_classes = (SessionAuthentication,)
	##
	def post(self, request):
		data = request.data
		assert validate_email(data)
		assert validate_password(data)
		serializer = UserLoginSerializer(data=data)
		if serializer.is_valid(raise_exception=True):
			user = serializer.check_user(data)
			login(request, user)
			return Response(serializer.data, status=status.HTTP_200_OK)


class UserLogout(APIView):
	permission_classes = (permissions.AllowAny,)
	authentication_classes = ()
	def post(self, request):
		logout(request)
		return Response(status=status.HTTP_200_OK)


class UserView(APIView):
	permission_classes = (permissions.IsAuthenticated,)
	authentication_classes = (SessionAuthentication,)
	##
	def get(self, request):
		serializer = UserSerializer(request.user)
		return Response({'user': serializer.data}, status=status.HTTP_200_OK)


from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response


class SessionCheckView(APIView):
    """
    检查当前会话状态，返回用户是否已验证。
    """
    authentication_classes = [SessionAuthentication]  # 使用 SessionAuthentication
    permission_classes = [IsAuthenticated]  # 仅限已登录用户访问
    
    def get(self, request):
        if request.user.is_authenticated:
            return Response({"authenticated": True}, status=status.HTTP_200_OK)
        else:
            return Response({"authenticated": False}, status=status.HTTP_401_UNAUTHORIZED)

class TokenRefreshView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.session.set_expiry(3600)  # 延长会话时间，1小时
        request.session.modified = True  # 确保 Django 刷新会话
        return Response({"message": "Session refreshed"})