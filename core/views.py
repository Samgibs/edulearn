from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken ,OutstandingToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.db.models import Q, Count, Avg, Sum, F
from django.utils import timezone
from django.core.paginator import Paginator
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
import uuid
from .serializers import (
    Admin, Classroom, ClassStudent, StudentAssessment, Teacher, Student, Course, 
    Payment, Subject, Qualification, Assessment, Progress, Enrollment, Message, 
    DiscussionForumPost, Reply, Notification, Assignment, TeacherBoard, CodeEditor, 
    CameraInteraction, UserSerializer, SigninSerializer, AdminSerializer,
    ClassroomSerializer, ClassStudentSerializer, StudentAssessmentSerializer,
    TeacherSerializer, StudentSerializer, CourseSerializer, PaymentSerializer,
    SubjectSerializer, QualificationSerializer, AssessmentSerializer, ProgressSerializer,
    EnrollmentSerializer, MessageSerializer, DiscussionForumPostSerializer, ReplySerializer,
    NotificationSerializer, AssignmentSerializer, TeacherBoardSerializer, CodeEditorSerializer,
    CameraInteractionSerializer
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
            return Response({'message': 'User created successfully. Please select your role.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoleSelectionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        role = request.data.get('role')
        
        if role not in ['student', 'teacher']:
            return Response({"detail": "Invalid role selected."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user

        try:
            # Check if user already has a profile
            if hasattr(user, 'student'):
                return Response({"detail": "User already has a student profile."}, status=status.HTTP_400_BAD_REQUEST)
            elif hasattr(user, 'teacher'):
                return Response({"detail": "User already has a teacher profile."}, status=status.HTTP_400_BAD_REQUEST)

            if role == 'student':
                # Validate required fields for student
                required_fields = ['education_level', 'total_fees']
                for field in required_fields:
                    if field not in request.data:
                        return Response({"detail": f"Field '{field}' is required for student registration."}, status=status.HTTP_400_BAD_REQUEST)

                # Create or get the course
                course, created = Course.objects.get_or_create(
                    title="Default Course Name",
                    defaults={
                        'description': 'This is a default course description.',
                        'teacher': user,
                        'price': 0.00,
                        'start_date': '2024-01-01',
                        'end_date': '2024-12-31',
                        'level': request.data.get('education_level', 'Primary'),
                        'requirements': 'Basic requirements',
                    }
                )

                # Create the student object with required fields
                student = Student.objects.create(
                    user=user,
                    full_name=user.username,
                    education_level=request.data.get('education_level'),
                    fees_paid=0.00,
                    total_fees=request.data.get('total_fees', 1000.00),
                    profile_picture='profile_pictures/default.jpg',  # Default profile picture
                )

                # Now, create the progress associated with the student
                progress = Progress.objects.create(course=course, student=student)

            elif role == 'teacher':
                # Validate required fields for teacher
                required_fields = ['experience_years', 'teaching_level', 'payment_rate']
                for field in required_fields:
                    if field not in request.data:
                        return Response({"detail": f"Field '{field}' is required for teacher registration."}, status=status.HTTP_400_BAD_REQUEST)

                # Create teacher with required fields
                teacher = Teacher.objects.create(
                    user=user,
                    full_name=user.username,
                    experience_years=request.data.get('experience_years'),
                    teaching_level=request.data.get('teaching_level'),
                    payment_rate=request.data.get('payment_rate'),
                    profile_picture='profile_pictures/default.jpg',  # Default profile picture
                    social_link='https://example.com',  # Default social link
                    certifications='certifications/default.pdf',  # Default certification file
                    payment_method='mpesa',  # Default payment method
                )

            return Response({"message": f"Role {role} selected successfully."}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"detail": f"Error creating {role}: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class ProgressView(APIView):
    def post(self, request, *args, **kwargs):
        student_id = request.data.get('student_id')
        course_id = request.data.get('course_id')

        try:
            student = Student.objects.get(id=student_id)
            course = Course.objects.get(id=course_id)
            progress = Progress.objects.create(student=student, course=course)
            return Response({"message": "Progress created successfully"}, status=201)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=404)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=404)

class SigninView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SigninSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({"error": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST)

            if user.check_password(password):
                refresh = RefreshToken.for_user(user)

                
                if user.is_superuser:
                    return Response({
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                        "message": "Login successful. Redirecting to admin dashboard.",
                        "dashboard_url": "/admin-dashboard/"
                    }, status=status.HTTP_200_OK)

                if hasattr(user, 'student'):
                    return Response({
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                        "message": "Login successful. Redirecting to student dashboard.",
                        "dashboard_url": "/student-dashboard/",
                        "role": "student"
                    }, status=status.HTTP_200_OK)
                elif hasattr(user, 'teacher'):
                    return Response({
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                        "message": "Login successful. Redirecting to teacher dashboard.",
                        "dashboard_url": "/teacher-dashboard/",
                        "role": "teacher"
                    }, status=status.HTTP_200_OK)
                else:
                    # User exists but doesn't have a role assigned yet
                    return Response({
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                        "message": "Login successful. Please select your role.",
                        "dashboard_url": "/role-selection/"
                    }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"error": "Invalid data", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)



class SignoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('token')
        if refresh_token is None:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"detail": "Token is invalid or already logged out."}, status=status.HTTP_400_BAD_REQUEST)


# ==================== USER MANAGEMENT APIs ====================

class UserListView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if request.user != user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== STUDENT APIs ====================

class StudentListCreateView(ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Student.objects.all()
        return Student.objects.filter(user=self.request.user)

class StudentDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

class StudentCoursesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        student = get_object_or_404(Student, id=pk)
        if request.user != student.user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        enrollments = Enrollment.objects.filter(student=student)
        courses = [enrollment.course for enrollment in enrollments]
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

class StudentProgressView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        student = get_object_or_404(Student, id=pk)
        if request.user != student.user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        progress = Progress.objects.filter(student=student)
        serializer = ProgressSerializer(progress, many=True)
        return Response(serializer.data)

class StudentPaymentsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        student = get_object_or_404(Student, id=pk)
        if request.user != student.user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        payments = Payment.objects.filter(student=student)
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)

class StudentMeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
            serializer = StudentSerializer(student)
            return Response(serializer.data)
        except Student.DoesNotExist:
            return Response({"detail": "Student profile not found"}, status=status.HTTP_404_NOT_FOUND)

class StudentMeCoursesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
            enrollments = Enrollment.objects.filter(student=student)
            courses = [enrollment.course for enrollment in enrollments]
            serializer = CourseSerializer(courses, many=True)
            return Response(serializer.data)
        except Student.DoesNotExist:
            return Response({"detail": "Student profile not found"}, status=status.HTTP_404_NOT_FOUND)


# ==================== TEACHER APIs ====================

class TeacherListCreateView(ListCreateAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Teacher.objects.all()
        return Teacher.objects.filter(user=self.request.user)

class TeacherDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

class TeacherCoursesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        teacher = get_object_or_404(Teacher, id=pk)
        if request.user != teacher.user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        courses = Course.objects.filter(teacher=teacher.user)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

class TeacherStudentsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        teacher = get_object_or_404(Teacher, id=pk)
        if request.user != teacher.user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        enrollments = Enrollment.objects.filter(teacher=teacher)
        students = [enrollment.student for enrollment in enrollments]
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

class TeacherSalaryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        teacher = get_object_or_404(Teacher, id=pk)
        if request.user != teacher.user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        salary_data = {
            'payment_rate': teacher.payment_rate,
            'net_salary': teacher.net_salary,
            'tax_deductions': teacher.tax_deductions,
            'loan_deductions': teacher.loan_deductions,
            'payment_method': teacher.payment_method,
            'mpesa_number': teacher.mpesa_number,
            'bank_name': teacher.bank_name,
            'bank_account_number': teacher.bank_account_number
        }
        return Response(salary_data)

class TeacherMeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            serializer = TeacherSerializer(teacher)
            return Response(serializer.data)
        except Teacher.DoesNotExist:
            return Response({"detail": "Teacher profile not found"}, status=status.HTTP_404_NOT_FOUND)

class TeacherMeCoursesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            teacher = Teacher.objects.get(user=request.user)
            courses = Course.objects.filter(teacher=teacher.user)
            serializer = CourseSerializer(courses, many=True)
            return Response(serializer.data)
        except Teacher.DoesNotExist:
            return Response({"detail": "Teacher profile not found"}, status=status.HTTP_404_NOT_FOUND)


# ==================== COURSE APIs ====================

class CourseListCreateView(ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Course.objects.all()
        elif hasattr(self.request.user, 'teacher'):
            return Course.objects.filter(teacher=self.request.user)
        else:
            # Students can see courses they're enrolled in
            enrollments = Enrollment.objects.filter(student__user=self.request.user)
            return Course.objects.filter(enrollment__in=enrollments)

class CourseDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'title'

class CourseEnrollmentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        course = get_object_or_404(Course, title=pk)
        student = get_object_or_404(Student, user=request.user)
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=student, course=course).exists():
            return Response({"detail": "Already enrolled in this course"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create enrollment
        enrollment = Enrollment.objects.create(
            student=student,
            course=course,
            payment_status=False
        )
        
        # Create progress tracking
        progress = Progress.objects.create(
            student=student,
            course=course,
            total_modules=10  # Default value, should be set based on course content
        )
        
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CourseStudentsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        course = get_object_or_404(Course, title=pk)
        
        # Check if user is the teacher of this course or admin
        if course.teacher != request.user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        enrollments = Enrollment.objects.filter(course=course)
        students = [enrollment.student for enrollment in enrollments]
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

class CourseSyllabusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        course = get_object_or_404(Course, title=pk)
        syllabus_data = {
            'title': course.title,
            'syllabus_structure': course.syllabus_structure,
            'syllabus_content': course.syllabus_content,
            'syllabus_format': course.syllabus_format,
            'syllabus_availability': course.syllabus_availability,
            'syllabus_status': course.syllabus_status,
            'syllabus_level': course.syllabus_level,
            'subjects': [subject.name for subject in course.subjects.all()]
        }
        return Response(syllabus_data)
    
    def put(self, request, pk):
        course = get_object_or_404(Course, title=pk)
        if course.teacher != request.user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        syllabus_fields = [
            'syllabus_structure', 'syllabus_content', 'syllabus_format',
            'syllabus_availability', 'syllabus_status', 'syllabus_level'
        ]
        
        for field in syllabus_fields:
            if field in request.data:
                setattr(course, field, request.data[field])
        
        course.save()
        return Response({"detail": "Syllabus updated successfully"})


# ==================== CLASSROOM APIs ====================

class ClassroomListCreateView(ListCreateAPIView):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]

class ClassroomDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]

class ClassroomStudentsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        classroom = get_object_or_404(Classroom, pk=pk)
        class_students = ClassStudent.objects.filter(class_obj=classroom)
        students = [cs.student for cs in class_students]
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)


# ==================== SUBJECT APIs ====================

class SubjectListCreateView(ListCreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

class SubjectDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]


# ==================== ASSESSMENT APIs ====================

class AssessmentListCreateView(ListCreateAPIView):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Assessment.objects.all()
        elif hasattr(self.request.user, 'teacher'):
            return Assessment.objects.filter(course__teacher=self.request.user)
        else:
            # Students can see assessments for their enrolled courses
            enrollments = Enrollment.objects.filter(student__user=self.request.user)
            return Assessment.objects.filter(course__in=[e.course for e in enrollments])

class AssessmentDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [IsAuthenticated]

class AssessmentSubmissionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        assessment = get_object_or_404(Assessment, pk=pk)
        student = get_object_or_404(Student, user=request.user)
        
        # Check if student is enrolled in the course
        if not Enrollment.objects.filter(student=student, course=assessment.course).exists():
            return Response({"detail": "Not enrolled in this course"}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if already submitted
        if StudentAssessment.objects.filter(student=student, assessment=assessment).exists():
            return Response({"detail": "Already submitted"}, status=status.HTTP_400_BAD_REQUEST)
        
        score = request.data.get('score')
        if score is None or score > assessment.max_score:
            return Response({"detail": "Invalid score"}, status=status.HTTP_400_BAD_REQUEST)
        
        student_assessment = StudentAssessment.objects.create(
            student=student,
            assessment=assessment,
            score=score
        )
        
        serializer = StudentAssessmentSerializer(student_assessment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AssessmentResultsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        assessment = get_object_or_404(Assessment, pk=pk)
        
        # Check if user is the teacher of this course or admin
        if assessment.course.teacher != request.user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        results = StudentAssessment.objects.filter(assessment=assessment)
        serializer = StudentAssessmentSerializer(results, many=True)
        return Response(serializer.data)


# ==================== PROGRESS APIs ====================

class ProgressListCreateView(ListCreateAPIView):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Progress.objects.all()
        elif hasattr(self.request.user, 'student'):
            return Progress.objects.filter(student__user=self.request.user)
        elif hasattr(self.request.user, 'teacher'):
            return Progress.objects.filter(course__teacher=self.request.user)

class ProgressDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer
    permission_classes = [IsAuthenticated]

class ProgressUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        progress = get_object_or_404(Progress, pk=pk)
        
        # Check permissions
        if progress.student.user != request.user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        completed_modules = request.data.get('completed_modules', 0)
        if completed_modules < 0:
            return Response({"detail": "Invalid number of completed modules"}, status=status.HTTP_400_BAD_REQUEST)
        
        progress.update_progress(completed_modules)
        serializer = ProgressSerializer(progress)
        return Response(serializer.data)


# ==================== PAYMENT APIs ====================

class PaymentListCreateView(ListCreateAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Payment.objects.all()
        elif hasattr(self.request.user, 'student'):
            return Payment.objects.filter(student__user=self.request.user)

class PaymentDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

class PaymentProcessView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        student = get_object_or_404(Student, user=request.user)
        course_title = request.data.get('course_title')
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method', 'mpesa')
        
        if not course_title or not amount:
            return Response({"detail": "Course title and amount are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        course = get_object_or_404(Course, title=course_title)
        
        # Create payment record
        payment = Payment.objects.create(
            student=student,
            course=course,
            amount_paid=amount,
            total_fee=course.price,
            payment_method=payment_method,
            mpesa_phone_number=request.data.get('mpesa_phone_number'),
            bank_name=request.data.get('bank_name'),
            bank_account_number=request.data.get('bank_account_number')
        )
        
        # Update student's fees_paid
        student.fees_paid += amount
        student.save()
        
        # Update enrollment payment status if fully paid
        if payment.is_fully_paid:
            enrollment = Enrollment.objects.get(student=student, course=course)
            enrollment.payment_status = True
            enrollment.save()
        
        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PaymentVerificationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # This would integrate with M-Pesa or bank verification APIs
        payment_id = request.data.get('payment_id')
        verification_code = request.data.get('verification_code')
        
        if not payment_id or not verification_code:
            return Response({"detail": "Payment ID and verification code required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mock verification - in real implementation, verify with payment provider
        payment = get_object_or_404(Payment, pk=payment_id)
        
        if verification_code == "VERIFIED":  # Mock verification
            payment.is_fully_paid = True
            payment.save()
            
            # Update enrollment status
            enrollment = Enrollment.objects.get(student=payment.student, course=payment.course)
            enrollment.payment_status = True
            enrollment.save()
            
            return Response({"detail": "Payment verified successfully"})
        else:
            return Response({"detail": "Invalid verification code"}, status=status.HTTP_400_BAD_REQUEST)


# ==================== ASSIGNMENT APIs ====================

class AssignmentListCreateView(ListCreateAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Assignment.objects.all()
        elif hasattr(self.request.user, 'teacher'):
            return Assignment.objects.filter(teacher=self.request.user)
        else:
            # Students can see assignments for their enrolled courses
            enrollments = Enrollment.objects.filter(student__user=self.request.user)
            return Assignment.objects.filter(course__in=[e.course for e in enrollments])

class AssignmentDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

class AssignmentSubmissionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        assignment = get_object_or_404(Assignment, pk=pk)
        student = get_object_or_404(Student, user=request.user)
        
        # Check if student is enrolled in the course
        if not Enrollment.objects.filter(student=student, course=assignment.course).exists():
            return Response({"detail": "Not enrolled in this course"}, status=status.HTTP_403_FORBIDDEN)
        
        # Update assignment with submission
        assignment.student = student
        assignment.submission_text = request.data.get('submission_text', '')
        assignment.submission_date = timezone.now()
        assignment.save()
        
        serializer = AssignmentSerializer(assignment)
        return Response(serializer.data)

class AssignmentGradingView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        assignment = get_object_or_404(Assignment, pk=pk)
        
        # Check if user is the teacher of this course or admin
        if assignment.teacher != request.user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        feedback = request.data.get('feedback', '')
        ai_assist_used = request.data.get('ai_assist_used', False)
        ai_assist_details = request.data.get('ai_assist_details', '')
        
        assignment.feedback = feedback
        assignment.ai_assist_used = ai_assist_used
        assignment.ai_assist_details = ai_assist_details
        assignment.save()
        
        serializer = AssignmentSerializer(assignment)
        return Response(serializer.data)


# ==================== MESSAGING APIs ====================

class MessageListCreateView(ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Message.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        ).order_by('-timestamp')

class MessageDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Message.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        )

class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get all unique users that the current user has conversations with
        sent_messages = Message.objects.filter(sender=request.user).values_list('receiver', flat=True)
        received_messages = Message.objects.filter(receiver=request.user).values_list('sender', flat=True)
        
        user_ids = set(list(sent_messages) + list(received_messages))
        users = User.objects.filter(id__in=user_ids)
        
        conversations = []
        for user in users:
            last_message = Message.objects.filter(
                Q(sender=request.user, receiver=user) | Q(sender=user, receiver=request.user)
            ).order_by('-timestamp').first()
            
            conversations.append({
                'user_id': user.id,
                'username': user.username,
                'last_message': MessageSerializer(last_message).data if last_message else None,
                'unread_count': Message.objects.filter(
                    sender=user, receiver=request.user, is_read=False
                ).count()
            })
        
        return Response(conversations)

class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        other_user = get_object_or_404(User, id=user_id)
        
        messages = Message.objects.filter(
            Q(sender=request.user, receiver=other_user) | 
            Q(sender=other_user, receiver=request.user)
        ).order_by('timestamp')
        
        # Mark messages as read
        Message.objects.filter(sender=other_user, receiver=request.user, is_read=False).update(is_read=True)
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    def post(self, request, user_id):
        other_user = get_object_or_404(User, id=user_id)
        content = request.data.get('content')
        course_id = request.data.get('course_id')
        
        if not content:
            return Response({"detail": "Message content is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        course = None
        if course_id:
            course = get_object_or_404(Course, title=course_id)
        
        message = Message.objects.create(
            sender=request.user,
            receiver=other_user,
            content=content,
            course=course
        )
        
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ==================== DISCUSSION FORUM APIs ====================

class DiscussionForumPostListCreateView(ListCreateAPIView):
    queryset = DiscussionForumPost.objects.all()
    serializer_class = DiscussionForumPostSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        if course_id:
            return DiscussionForumPost.objects.filter(course__title=course_id).order_by('-timestamp')
        return DiscussionForumPost.objects.all().order_by('-timestamp')

class DiscussionForumPostDetailView(RetrieveUpdateDestroyAPIView):
    queryset = DiscussionForumPost.objects.all()
    serializer_class = DiscussionForumPostSerializer
    permission_classes = [IsAuthenticated]

class ReplyListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        post = get_object_or_404(DiscussionForumPost, pk=pk)
        replies = Reply.objects.filter(post=post).order_by('timestamp')
        serializer = ReplySerializer(replies, many=True)
        return Response(serializer.data)
    
    def post(self, request, pk):
        post = get_object_or_404(DiscussionForumPost, pk=pk)
        content = request.data.get('content')
        
        if not content:
            return Response({"detail": "Reply content is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        reply = Reply.objects.create(
            post=post,
            author=request.user,
            content=content
        )
        
        serializer = ReplySerializer(reply)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ReplyDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Reply.objects.all()
    serializer_class = ReplySerializer
    permission_classes = [IsAuthenticated]


# ==================== NOTIFICATION APIs ====================

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        notifications = Notification.objects.filter(recipient=request.user).order_by('-timestamp')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class NotificationDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        notification_ids = request.data.get('notification_ids', [])
        if notification_ids:
            Notification.objects.filter(
                id__in=notification_ids, 
                recipient=request.user
            ).update(is_read=True)
        else:
            # Mark all notifications as read
            Notification.objects.filter(recipient=request.user).update(is_read=True)
        
        return Response({"detail": "Notifications marked as read"})


# ==================== CODE EDITOR APIs ====================

class CodeEditorListCreateView(ListCreateAPIView):
    queryset = CodeEditor.objects.all()
    serializer_class = CodeEditorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return CodeEditor.objects.all()
        return CodeEditor.objects.filter(student__user=self.request.user)

class CodeEditorDetailView(RetrieveUpdateDestroyAPIView):
    queryset = CodeEditor.objects.all()
    serializer_class = CodeEditorSerializer
    permission_classes = [IsAuthenticated]

class CodeExecutionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        code_editor = get_object_or_404(CodeEditor, pk=pk)
        
        # Check permissions
        if code_editor.student.user != request.user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        code = request.data.get('code', code_editor.code)
        language = request.data.get('language', code_editor.language)
        
        # Mock code execution - in real implementation, use a code execution service
        output = f"Mock output for {language} code execution"
        
        # Update the code editor
        code_editor.code = code
        code_editor.language = language
        code_editor.output = output
        code_editor.save()
        
        return Response({
            "output": output,
            "language": language,
            "execution_time": "0.001s"  # Mock execution time
        })


# ==================== TEACHER BOARD APIs ====================

class TeacherBoardListCreateView(ListCreateAPIView):
    queryset = TeacherBoard.objects.all()
    serializer_class = TeacherBoardSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return TeacherBoard.objects.all()
        return TeacherBoard.objects.filter(teacher__user=self.request.user)

class TeacherBoardDetailView(RetrieveUpdateDestroyAPIView):
    queryset = TeacherBoard.objects.all()
    serializer_class = TeacherBoardSerializer
    permission_classes = [IsAuthenticated]


# ==================== CAMERA INTERACTION APIs ====================

class CameraInteractionListCreateView(ListCreateAPIView):
    queryset = CameraInteraction.objects.all()
    serializer_class = CameraInteractionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return CameraInteraction.objects.all()
        elif hasattr(self.request.user, 'teacher'):
            return CameraInteraction.objects.filter(teacher__user=self.request.user)
        else:
            return CameraInteraction.objects.filter(students__user=self.request.user)

class CameraInteractionDetailView(RetrieveUpdateDestroyAPIView):
    queryset = CameraInteraction.objects.all()
    serializer_class = CameraInteractionSerializer
    permission_classes = [IsAuthenticated]

class CameraJoinView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        session = get_object_or_404(CameraInteraction, pk=pk)
        student = get_object_or_404(Student, user=request.user)
        
        if not session.is_active:
            return Response({"detail": "Session is not active"}, status=status.HTTP_400_BAD_REQUEST)
        
        session.students.add(student)
        return Response({"detail": "Successfully joined camera session"})


# ==================== ANALYTICS AND REPORTS APIs ====================

class StudentProgressAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_staff and not hasattr(request.user, 'teacher'):
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        # Get progress statistics
        total_students = Student.objects.count()
        students_with_progress = Progress.objects.values('student').distinct().count()
        
        avg_progress = Progress.objects.aggregate(
            avg_progress=Avg('modules_completed')
        )['avg_progress'] or 0
        
        progress_distribution = Progress.objects.extra(
            select={
                'progress_range': "CASE "
                "WHEN modules_completed = 0 THEN 'Not Started' "
                "WHEN modules_completed < total_modules * 0.25 THEN '0-25%' "
                "WHEN modules_completed < total_modules * 0.5 THEN '25-50%' "
                "WHEN modules_completed < total_modules * 0.75 THEN '50-75%' "
                "ELSE '75-100%' END"
            }
        ).values('progress_range').annotate(count=Count('id'))
        
        return Response({
            'total_students': total_students,
            'students_with_progress': students_with_progress,
            'average_progress': avg_progress,
            'progress_distribution': list(progress_distribution)
        })

class TeacherPerformanceAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        # Get teacher performance metrics
        teachers = Teacher.objects.annotate(
            total_courses=Count('course'),
            total_students=Count('enrollment__student', distinct=True),
            avg_salary=Avg('payment_rate')
        )
        
        teacher_data = []
        for teacher in teachers:
            teacher_data.append({
                'teacher_id': teacher.id,
                'teacher_name': teacher.full_name,
                'total_courses': teacher.total_courses,
                'total_students': teacher.total_students,
                'average_salary': float(teacher.avg_salary) if teacher.avg_salary else 0
            })
        
        return Response(teacher_data)

class CourseStatisticsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        # Get course statistics
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()
        total_revenue = Payment.objects.aggregate(
            total=Sum('amount_paid')
        )['total'] or 0
        
        courses_by_level = Course.objects.values('level').annotate(count=Count('id'))
        courses_by_subject = Course.objects.values('subjects__name').annotate(count=Count('id'))
        
        return Response({
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'total_revenue': float(total_revenue),
            'courses_by_level': list(courses_by_level),
            'courses_by_subject': list(courses_by_subject)
        })


# ==================== ADMIN APIs ====================

class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get dashboard statistics
        total_users = User.objects.count()
        total_students = Student.objects.count()
        total_teachers = Teacher.objects.count()
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()
        total_revenue = Payment.objects.aggregate(
            total=Sum('amount_paid')
        )['total'] or 0
        
        recent_enrollments = Enrollment.objects.order_by('-enrollment_date')[:5]
        recent_payments = Payment.objects.order_by('-id')[:5]
        
        return Response({
            'total_users': total_users,
            'total_students': total_students,
            'total_teachers': total_teachers,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'total_revenue': float(total_revenue),
            'recent_enrollments': EnrollmentSerializer(recent_enrollments, many=True).data,
            'recent_payments': PaymentSerializer(recent_payments, many=True).data
        })

class AdminUserManagementView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        # Create new user
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminReportsView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        report_type = request.query_params.get('type', 'overview')
        
        if report_type == 'overview':
            return self.get_overview_report()
        elif report_type == 'financial':
            return self.get_financial_report()
        elif report_type == 'academic':
            return self.get_academic_report()
        else:
            return Response({"detail": "Invalid report type"}, status=status.HTTP_400_BAD_REQUEST)
    
    def get_overview_report(self):
        return Response({
            'total_users': User.objects.count(),
            'total_students': Student.objects.count(),
            'total_teachers': Teacher.objects.count(),
            'total_courses': Course.objects.count(),
            'active_enrollments': Enrollment.objects.filter(payment_status=True).count()
        })
    
    def get_financial_report(self):
        total_revenue = Payment.objects.aggregate(total=Sum('amount_paid'))['total'] or 0
        payments_by_method = Payment.objects.values('payment_method').annotate(
            count=Count('id'), total=Sum('amount_paid')
        )
        
        return Response({
            'total_revenue': float(total_revenue),
            'payments_by_method': list(payments_by_method)
        })
    
    def get_academic_report(self):
        avg_progress = Progress.objects.aggregate(avg=Avg('modules_completed'))['avg'] or 0
        completion_rate = Progress.objects.filter(
            modules_completed__gte=F('total_modules')
        ).count() / Progress.objects.count() * 100 if Progress.objects.count() > 0 else 0
        
        return Response({
            'average_progress': avg_progress,
            'completion_rate': completion_rate
        })


# ==================== FILE UPLOAD APIs ====================

class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        file_type = request.data.get('file_type')  # 'profile_picture', 'certification', 'assignment'
        file = request.FILES.get('file')
        
        if not file or not file_type:
            return Response({"detail": "File and file_type are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type
        allowed_types = ['profile_picture', 'certification', 'assignment']
        if file_type not in allowed_types:
            return Response({"detail": "Invalid file type"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (5MB limit)
        if file.size > 5 * 1024 * 1024:
            return Response({"detail": "File size too large. Maximum 5MB allowed."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.name)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Determine upload path based on file type
        if file_type == 'profile_picture':
            upload_path = f"profile_pictures/{unique_filename}"
        elif file_type == 'certification':
            upload_path = f"certifications/{unique_filename}"
        elif file_type == 'assignment':
            upload_path = f"assignments/{unique_filename}"
        
        # Save file
        file_path = default_storage.save(upload_path, ContentFile(file.read()))
        file_url = default_storage.url(file_path)
        
        return Response({
            "file_url": file_url,
            "file_path": file_path,
            "file_name": file.name,
            "file_size": file.size,
            "file_type": file_type
        }, status=status.HTTP_201_CREATED)

class AssignmentFileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        assignment = get_object_or_404(Assignment, pk=pk)
        
        # Check if user is enrolled in the course
        if hasattr(request.user, 'student'):
            if not Enrollment.objects.filter(student__user=request.user, course=assignment.course).exists():
                return Response({"detail": "Not enrolled in this course"}, status=status.HTTP_403_FORBIDDEN)
        
        file = request.FILES.get('file')
        if not file:
            return Response({"detail": "File is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (10MB limit for assignments)
        if file.size > 10 * 1024 * 1024:
            return Response({"detail": "File size too large. Maximum 10MB allowed."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.name)[1]
        unique_filename = f"assignment_{assignment.id}_{uuid.uuid4()}{file_extension}"
        upload_path = f"assignments/{unique_filename}"
        
        # Save file
        file_path = default_storage.save(upload_path, ContentFile(file.read()))
        file_url = default_storage.url(file_path)
        
        # Update assignment with file submission
        assignment.submission_text = f"File submitted: {file.name}"
        assignment.submission_date = timezone.now()
        assignment.save()
        
        return Response({
            "file_url": file_url,
            "file_path": file_path,
            "file_name": file.name,
            "assignment_id": assignment.id,
            "submission_date": assignment.submission_date
        }, status=status.HTTP_201_CREATED)

class TeacherCertificationUploadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        teacher = get_object_or_404(Teacher, id=pk)
        
        # Check if user is the teacher or admin
        if teacher.user != request.user and not request.user.is_staff:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
        
        file = request.FILES.get('file')
        if not file:
            return Response({"detail": "File is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (5MB limit for certifications)
        if file.size > 5 * 1024 * 1024:
            return Response({"detail": "File size too large. Maximum 5MB allowed."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.name)[1]
        unique_filename = f"certification_{teacher.id}_{uuid.uuid4()}{file_extension}"
        upload_path = f"certifications/{unique_filename}"
        
        # Save file
        file_path = default_storage.save(upload_path, ContentFile(file.read()))
        file_url = default_storage.url(file_path)
        
        # Update teacher's certification file
        teacher.certifications = file_path
        teacher.save()
        
        return Response({
            "file_url": file_url,
            "file_path": file_path,
            "file_name": file.name,
            "teacher_id": teacher.id
        }, status=status.HTTP_201_CREATED)

class ProfilePictureUploadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({"detail": "File is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (2MB limit for profile pictures)
        if file.size > 2 * 1024 * 1024:
            return Response({"detail": "File size too large. Maximum 2MB allowed."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.name)[1]
        unique_filename = f"profile_{request.user.id}_{uuid.uuid4()}{file_extension}"
        upload_path = f"profile_pictures/{unique_filename}"
        
        # Save file
        file_path = default_storage.save(upload_path, ContentFile(file.read()))
        file_url = default_storage.url(file_path)
        
        # Update user's profile picture based on their role
        if hasattr(request.user, 'student'):
            request.user.student.profile_picture = file_path
            request.user.student.save()
        elif hasattr(request.user, 'teacher'):
            request.user.teacher.profile_picture = file_path
            request.user.teacher.save()
        
        return Response({
            "file_url": file_url,
            "file_path": file_path,
            "file_name": file.name,
            "user_id": request.user.id
        }, status=status.HTTP_201_CREATED)

class FileDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, file_path):
        try:
            # Check if file exists
            if not default_storage.exists(file_path):
                return Response({"detail": "File not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Check permissions (basic check - in production, add more specific checks)
            if not request.user.is_staff:
                # Only allow users to delete their own files
                if not (file_path.startswith(f"profile_pictures/profile_{request.user.id}_") or 
                       file_path.startswith(f"certifications/certification_") or
                       file_path.startswith(f"assignments/assignment_")):
                    return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
            
            # Delete file
            default_storage.delete(file_path)
            
            return Response({"detail": "File deleted successfully"})
        except Exception as e:
            return Response({"detail": f"Error deleting file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)