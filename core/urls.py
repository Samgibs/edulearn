from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for ViewSets (if we decide to use them later)
router = DefaultRouter()

urlpatterns = [
    # Authentication endpoints
    path('auth/signup/', views.SignupView.as_view(), name='signup'),
    path('auth/signin/', views.SigninView.as_view(), name='signin'),
    path('auth/signout/', views.SignoutView.as_view(), name='signout'),
    path('auth/role-selection/', views.RoleSelectionView.as_view(), name='role-selection'),
    
    # User Management
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/profile/', views.UserProfileView.as_view(), name='user-profile'),
    
    # Student APIs
    path('students/', views.StudentListCreateView.as_view(), name='student-list'),
    path('students/<str:pk>/', views.StudentDetailView.as_view(), name='student-detail'),
    path('students/<str:pk>/courses/', views.StudentCoursesView.as_view(), name='student-courses'),
    path('students/<str:pk>/progress/', views.StudentProgressView.as_view(), name='student-progress'),
    path('students/<str:pk>/payments/', views.StudentPaymentsView.as_view(), name='student-payments'),
    
    # Teacher APIs
    path('teachers/', views.TeacherListCreateView.as_view(), name='teacher-list'),
    path('teachers/<str:pk>/', views.TeacherDetailView.as_view(), name='teacher-detail'),
    path('teachers/<str:pk>/courses/', views.TeacherCoursesView.as_view(), name='teacher-courses'),
    path('teachers/<str:pk>/students/', views.TeacherStudentsView.as_view(), name='teacher-students'),
    path('teachers/<str:pk>/salary/', views.TeacherSalaryView.as_view(), name='teacher-salary'),
    
    # Course APIs
    path('courses/', views.CourseListCreateView.as_view(), name='course-list'),
    path('courses/<str:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('courses/<str:pk>/enroll/', views.CourseEnrollmentView.as_view(), name='course-enroll'),
    path('courses/<str:pk>/students/', views.CourseStudentsView.as_view(), name='course-students'),
    path('courses/<str:pk>/syllabus/', views.CourseSyllabusView.as_view(), name='course-syllabus'),
    
    # Classroom APIs
    path('classrooms/', views.ClassroomListCreateView.as_view(), name='classroom-list'),
    path('classrooms/<int:pk>/', views.ClassroomDetailView.as_view(), name='classroom-detail'),
    path('classrooms/<int:pk>/students/', views.ClassroomStudentsView.as_view(), name='classroom-students'),
    
    # Subject APIs
    path('subjects/', views.SubjectListCreateView.as_view(), name='subject-list'),
    path('subjects/<int:pk>/', views.SubjectDetailView.as_view(), name='subject-detail'),
    
    # Assessment APIs
    path('assessments/', views.AssessmentListCreateView.as_view(), name='assessment-list'),
    path('assessments/<int:pk>/', views.AssessmentDetailView.as_view(), name='assessment-detail'),
    path('assessments/<int:pk>/submit/', views.AssessmentSubmissionView.as_view(), name='assessment-submit'),
    path('assessments/<int:pk>/results/', views.AssessmentResultsView.as_view(), name='assessment-results'),
    
    # Progress APIs
    path('progress/', views.ProgressListCreateView.as_view(), name='progress-list'),
    path('progress/<int:pk>/', views.ProgressDetailView.as_view(), name='progress-detail'),
    path('progress/<int:pk>/update/', views.ProgressUpdateView.as_view(), name='progress-update'),
    
    # Payment APIs
    path('payments/', views.PaymentListCreateView.as_view(), name='payment-list'),
    path('payments/<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    path('payments/process/', views.PaymentProcessView.as_view(), name='payment-process'),
    path('payments/verify/', views.PaymentVerificationView.as_view(), name='payment-verify'),
    
    # Assignment APIs
    path('assignments/', views.AssignmentListCreateView.as_view(), name='assignment-list'),
    path('assignments/<int:pk>/', views.AssignmentDetailView.as_view(), name='assignment-detail'),
    path('assignments/<int:pk>/submit/', views.AssignmentSubmissionView.as_view(), name='assignment-submit'),
    path('assignments/<int:pk>/grade/', views.AssignmentGradingView.as_view(), name='assignment-grade'),
    
    # Messaging APIs
    path('messages/', views.MessageListCreateView.as_view(), name='message-list'),
    path('messages/<int:pk>/', views.MessageDetailView.as_view(), name='message-detail'),
    path('messages/conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('messages/conversations/<int:user_id>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    
    # Discussion Forum APIs
    path('forum/posts/', views.DiscussionForumPostListCreateView.as_view(), name='forum-post-list'),
    path('forum/posts/<int:pk>/', views.DiscussionForumPostDetailView.as_view(), name='forum-post-detail'),
    path('forum/posts/<int:pk>/replies/', views.ReplyListCreateView.as_view(), name='reply-list'),
    path('forum/replies/<int:pk>/', views.ReplyDetailView.as_view(), name='reply-detail'),
    
    # Notification APIs
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('notifications/mark-read/', views.NotificationMarkReadView.as_view(), name='notification-mark-read'),
    
    # Code Editor APIs
    path('code-editor/', views.CodeEditorListCreateView.as_view(), name='code-editor-list'),
    path('code-editor/<int:pk>/', views.CodeEditorDetailView.as_view(), name='code-editor-detail'),
    path('code-editor/<int:pk>/execute/', views.CodeExecutionView.as_view(), name='code-execute'),
    
    # Teacher Board APIs
    path('teacher-board/', views.TeacherBoardListCreateView.as_view(), name='teacher-board-list'),
    path('teacher-board/<int:pk>/', views.TeacherBoardDetailView.as_view(), name='teacher-board-detail'),
    
    # Camera Interaction APIs
    path('camera-sessions/', views.CameraInteractionListCreateView.as_view(), name='camera-session-list'),
    path('camera-sessions/<int:pk>/', views.CameraInteractionDetailView.as_view(), name='camera-session-detail'),
    path('camera-sessions/<int:pk>/join/', views.CameraJoinView.as_view(), name='camera-join'),
    
    # Analytics and Reports
    path('analytics/student-progress/', views.StudentProgressAnalyticsView.as_view(), name='student-progress-analytics'),
    path('analytics/teacher-performance/', views.TeacherPerformanceAnalyticsView.as_view(), name='teacher-performance-analytics'),
    path('analytics/course-statistics/', views.CourseStatisticsView.as_view(), name='course-statistics'),
    
    # Admin APIs
    path('admin/dashboard/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/users/', views.AdminUserManagementView.as_view(), name='admin-user-management'),
    path('admin/reports/', views.AdminReportsView.as_view(), name='admin-reports'),
    
    # File Upload APIs
    path('files/upload/', views.FileUploadView.as_view(), name='file-upload'),
    path('files/upload/profile-picture/', views.ProfilePictureUploadView.as_view(), name='profile-picture-upload'),
    path('files/upload/teacher-certification/<str:pk>/', views.TeacherCertificationUploadView.as_view(), name='teacher-certification-upload'),
    path('files/upload/assignment/<int:pk>/', views.AssignmentFileUploadView.as_view(), name='assignment-file-upload'),
    path('files/delete/<path:file_path>/', views.FileDeleteView.as_view(), name='file-delete'),
]

# Include router URLs if we add ViewSets later
urlpatterns += router.urls
