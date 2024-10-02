from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.contrib.auth.models import User
from .serializers import (
    Admin, Classroom, ClassStudent, StudentAssessment, Teacher, Student, Course, 
    Payment, Subject, Qualification, Assessment, Progress, Enrollment, Message, 
    DiscussionForumPost, Reply, Notification, Assignment, TeacherBoard, CodeEditor, 
    CameraInteraction, UserSerializer
)
from .models import (
    Admin, Classroom, ClassStudent, StudentAssessment, Teacher, Student, Course, 
    Payment, Subject, Qualification, Assessment, Progress, Enrollment, Message, 
    DiscussionForumPost, Reply, Notification, Assignment, TeacherBoard, CodeEditor, 
    CameraInteraction
)
from rest_framework import status

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        
        if serializer.is_valid():
            
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)