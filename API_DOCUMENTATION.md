# EduLearn API Documentation

## Overview
This is a comprehensive e-learning platform API built with Django REST Framework. The API supports multiple user roles (Admin, Teacher, Student) and provides full CRUD operations for all educational resources.

## Base URL
```
http://localhost:8000/api/
```

## Authentication
The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

## User Roles
- **Admin**: Full system access
- **Teacher**: Course management, student interaction, grading
- **Student**: Course enrollment, assignment submission, progress tracking

---

## Authentication Endpoints

### 1. User Registration
**POST** `/auth/signup/`
```json
{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
}
```

### 2. User Login
**POST** `/auth/signin/`
```json
{
    "username": "johndoe",
    "password": "securepassword123"
}
```

### 3. Role Selection
**POST** `/auth/role-selection/`
```json
{
    "role": "student"  // or "teacher"
}
```

### 4. Logout
**POST** `/auth/signout/`
```json
{
    "token": "refresh_token_here"
}
```

---

## User Management

### 1. Get All Users (Admin Only)
**GET** `/users/`

### 2. Get User Details
**GET** `/users/{user_id}/`

### 3. Update User Profile
**PUT** `/users/{user_id}/`

### 4. Get Current User Profile
**GET** `/users/profile/`

---

## Student APIs

### 1. List/Create Students
**GET/POST** `/students/`

### 2. Student Details
**GET/PUT/DELETE** `/students/{student_id}/`

### 3. Get Student Courses
**GET** `/students/{student_id}/courses/`

### 4. Get Student Progress
**GET** `/students/{student_id}/progress/`

### 5. Get Student Payments
**GET** `/students/{student_id}/payments/`

---

## Teacher APIs

### 1. List/Create Teachers
**GET/POST** `/teachers/`

### 2. Teacher Details
**GET/PUT/DELETE** `/teachers/{teacher_id}/`

### 3. Get Teacher Courses
**GET** `/teachers/{teacher_id}/courses/`

### 4. Get Teacher Students
**GET** `/teachers/{teacher_id}/students/`

### 5. Get Teacher Salary Info
**GET** `/teachers/{teacher_id}/salary/`

---

## Course Management

### 1. List/Create Courses
**GET/POST** `/courses/`

### 2. Course Details
**GET/PUT/DELETE** `/courses/{course_title}/`

### 3. Enroll in Course
**POST** `/courses/{course_title}/enroll/`

### 4. Get Course Students
**GET** `/courses/{course_title}/students/`

### 5. Course Syllabus Management
**GET/PUT** `/courses/{course_title}/syllabus/`

---

## Assessment System

### 1. List/Create Assessments
**GET/POST** `/assessments/`

### 2. Assessment Details
**GET/PUT/DELETE** `/assessments/{assessment_id}/`

### 3. Submit Assessment
**POST** `/assessments/{assessment_id}/submit/`
```json
{
    "score": 85
}
```

### 4. Get Assessment Results (Teacher/Admin)
**GET** `/assessments/{assessment_id}/results/`

---

## Assignment Management

### 1. List/Create Assignments
**GET/POST** `/assignments/`

### 2. Assignment Details
**GET/PUT/DELETE** `/assignments/{assignment_id}/`

### 3. Submit Assignment
**POST** `/assignments/{assignment_id}/submit/`
```json
{
    "submission_text": "Assignment submission content"
}
```

### 4. Grade Assignment (Teacher/Admin)
**POST** `/assignments/{assignment_id}/grade/`
```json
{
    "feedback": "Great work!",
    "ai_assist_used": false,
    "ai_assist_details": ""
}
```

---

## Progress Tracking

### 1. List/Create Progress Records
**GET/POST** `/progress/`

### 2. Progress Details
**GET/PUT/DELETE** `/progress/{progress_id}/`

### 3. Update Progress
**POST** `/progress/{progress_id}/update/`
```json
{
    "completed_modules": 5
}
```

---

## Payment System

### 1. List/Create Payments
**GET/POST** `/payments/`

### 2. Payment Details
**GET/PUT/DELETE** `/payments/{payment_id}/`

### 3. Process Payment
**POST** `/payments/process/`
```json
{
    "course_title": "Mathematics 101",
    "amount": 100.00,
    "payment_method": "mpesa",
    "mpesa_phone_number": "254712345678"
}
```

### 4. Verify Payment
**POST** `/payments/verify/`
```json
{
    "payment_id": 1,
    "verification_code": "VERIFIED"
}
```

---

## Messaging System

### 1. List/Create Messages
**GET/POST** `/messages/`

### 2. Message Details
**GET/PUT/DELETE** `/messages/{message_id}/`

### 3. Get Conversations
**GET** `/messages/conversations/`

### 4. Get/Post Conversation with User
**GET/POST** `/messages/conversations/{user_id}/`

---

## Discussion Forum

### 1. List/Create Forum Posts
**GET/POST** `/forum/posts/`
Query params: `?course_id=course_title`

### 2. Forum Post Details
**GET/PUT/DELETE** `/forum/posts/{post_id}/`

### 3. List/Create Replies
**GET/POST** `/forum/posts/{post_id}/replies/`

### 4. Reply Details
**GET/PUT/DELETE** `/forum/replies/{reply_id}/`

---

## Notifications

### 1. List Notifications
**GET** `/notifications/`

### 2. Notification Details
**GET/PUT/DELETE** `/notifications/{notification_id}/`

### 3. Mark Notifications as Read
**POST** `/notifications/mark-read/`
```json
{
    "notification_ids": [1, 2, 3]  // Optional: mark all if empty
}
```

---

## Code Editor

### 1. List/Create Code Sessions
**GET/POST** `/code-editor/`

### 2. Code Session Details
**GET/PUT/DELETE** `/code-editor/{session_id}/`

### 3. Execute Code
**POST** `/code-editor/{session_id}/execute/`
```json
{
    "code": "print('Hello World')",
    "language": "python"
}
```

---

## File Upload

### 1. General File Upload
**POST** `/files/upload/`
```json
{
    "file_type": "profile_picture",  // or "certification", "assignment"
    "file": <file_data>
}
```

### 2. Profile Picture Upload
**POST** `/files/upload/profile-picture/`

### 3. Teacher Certification Upload
**POST** `/files/upload/teacher-certification/{teacher_id}/`

### 4. Assignment File Upload
**POST** `/files/upload/assignment/{assignment_id}/`

### 5. Delete File
**DELETE** `/files/delete/{file_path}/`

---

## Analytics & Reports

### 1. Student Progress Analytics
**GET** `/analytics/student-progress/`

### 2. Teacher Performance Analytics
**GET** `/analytics/teacher-performance/`

### 3. Course Statistics
**GET** `/analytics/course-statistics/`

---

## Admin APIs

### 1. Admin Dashboard
**GET** `/admin/dashboard/`

### 2. User Management
**GET/POST** `/admin/users/`

### 3. Reports
**GET** `/admin/reports/`
Query params: `?type=overview|financial|academic`

---

## Error Responses

### 400 Bad Request
```json
{
    "detail": "Error message describing the issue"
}
```

### 401 Unauthorized
```json
{
    "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
    "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
    "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
    "detail": "A server error occurred."
}
```

---

## File Upload Limits

- **Profile Pictures**: 2MB maximum
- **Certifications**: 5MB maximum
- **Assignments**: 10MB maximum
- **General Files**: 5MB maximum

## Supported File Types

- Images: JPG, PNG, GIF
- Documents: PDF, DOC, DOCX
- Archives: ZIP, RAR

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **File uploads**: 10 requests per minute
- **General API**: 100 requests per minute

---

## WebSocket Endpoints (Future)

- `/ws/notifications/` - Real-time notifications
- `/ws/chat/{conversation_id}/` - Real-time messaging
- `/ws/camera/{session_id}/` - Video interaction

---

## Testing the API

### Using curl
```bash
# Register a new user
curl -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "testpass123"}'

# Login
curl -X POST http://localhost:8000/api/auth/signin/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'

# Get courses (with token)
curl -X GET http://localhost:8000/api/courses/ \
  -H "Authorization: Bearer <your_access_token>"
```

### Using Postman
1. Import the collection (if available)
2. Set the base URL to `http://localhost:8000/api/`
3. Add the JWT token to the Authorization header
4. Test the endpoints

---

## Database Schema

The API uses the following main models:
- **User**: Django's built-in user model
- **Student**: Student-specific information
- **Teacher**: Teacher-specific information
- **Course**: Course information and metadata
- **Enrollment**: Student-course relationships
- **Progress**: Student progress tracking
- **Assessment**: Quizzes and exams
- **Assignment**: Course assignments
- **Payment**: Payment records
- **Message**: User messaging
- **Notification**: System notifications

---

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Role-based Access Control**: Different permissions for different user types
3. **File Upload Validation**: Size and type restrictions
4. **Input Validation**: Comprehensive data validation
5. **SQL Injection Protection**: Django ORM protection
6. **CORS Support**: Cross-origin resource sharing
7. **Rate Limiting**: API abuse prevention

---

## Deployment Notes

1. Set up environment variables for database credentials
2. Configure media file storage (local or cloud)
3. Set up Redis for caching (optional)
4. Configure email settings for notifications
5. Set up M-Pesa integration for payments
6. Configure CORS settings for frontend integration

---

## Support

For API support and questions, please contact the development team or refer to the project documentation.
