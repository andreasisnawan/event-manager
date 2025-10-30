from django.contrib.auth import authenticate, get_user_model
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (UserListSerializer, UserLoginSerializer,
                          UserRegistrationSerializer)

User = get_user_model()

class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'username': user.username,
                        'email': user.email,
                        'role': user.role,
                    }
                })
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(APIView):
    def get(self, request):
        # Only admin users can list all users
        if not request.user.role == 'admin':
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.all()
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)

class UserDetailView(APIView):
    def get(self, request, pk):
        # Admin can view any user, others can only view themselves
        if not request.user.role == 'admin' and str(request.user.id) != pk:
            return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserListSerializer(user)
        return Response(serializer.data)
