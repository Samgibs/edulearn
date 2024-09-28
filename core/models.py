from django.db import models
from django.contrib.auth.models import User, Group, Permission
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
from django.contrib.auth import get_user_model
User = get_user_model()


def create_admin_group():
    
    if not Group.objects.filter(name='Admin').exists():
        admin_group = Group.objects.create(name='Admin')
        my_model_content_type = ContentType.objects.get(app_label='core', model='course')
        permissions = [
            Permission.objects.get(codename='add_course', content_type=my_model_content_type),
            Permission.objects.get(codename='change_course', content_type=my_model_content_type),
            Permission.objects.get(codename='delete_course', content_type=my_model_content_type),
        ]
        admin_group.permissions.add(*permissions)

@receiver(post_save, sender=User)
def assign_admin_group(sender, instance, created, **kwargs):
    if created:
        if instance.is_superuser:
            admin_group = Group.objects.get(name='Admin')
            instance.groups.add(admin_group)

def remove_admins_group():
    try:
        admins_group = Group.objects.get(name='Admins')  
        admins_group.delete()  
    except Group.DoesNotExist:
        pass

class Admin(models.Model):
    id = models.CharField(max_length=10, primary_key=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)

    def __str__(self):
        return self.full_name

class Teacher(models.Model):
    id = models.CharField(max_length=10, primary_key=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=False, null=False)
    social_link = models.URLField(max_length=500, blank=False)
    expertise_area = models.ManyToManyField('Subject', blank=False)
    qualifications = models.ManyToManyField('Qualification', blank=False)
    teaching_level = models.CharField(max_length=50, choices=[
        ('Kindergarten', 'Kindergarten'),
        ('Primary', 'Primary'),
        ('High School', 'High School'),
        ('University', 'University'),
    ], blank=False)
    experience_years = models.PositiveIntegerField()
    certifications = models.FileField(upload_to='Certifications/', blank=False, null=False)
    status = models.BooleanField(default=True)
    payment_rate = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.full_name
    
class Student(models.Model):
    id = models.CharField(max_length=10, primary_key=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=False, null=False)
    education_level = models.CharField(max_length=50, choices=[
        ('Kindergarten', 'Kindergarten'),
        ('Primary', 'Primary'),
        ('High School', 'High School'),
        ('University', 'University'),
    ], blank=False)
    fees_paid = models.DecimalField(max_digits=10, decimal_places=2)
    total_fees = models.DecimalField(max_digits=10, decimal_places=2)
    fee_status = models.BooleanField(default=False)
    progress = models.ForeignKey('Progress', on_delete=models.CASCADE, related_name='student_progress')
    results = models.ManyToManyField('Assessment')  # Fixed typo from 'Assesment' to 'Assessment'
    enrolled_courses = models.ManyToManyField('Course', through='Enrollment')
    remaining_fee = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.full_name

class Course(models.Model):
    title = models.CharField(max_length=100, primary_key=True)
    description = models.TextField(max_length=500)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    level = models.CharField(
        max_length=50,
        choices=[
            ('Kindergarten', 'Kindergarten'),
            ('Primary', 'Primary'),
            ('High School', 'High School'),
            ('University', 'University'),
        ],
        blank=False
    )
    syllabus_structure = models.CharField(max_length=20, choices=[
        ('full', 'Full Syllabus'),
        ('unit', 'Unit-Wise'),
        ('topic', 'Topic-Based'),
        ('customizable', 'Customizable'),
    ], default='full')
    syllabus_content = models.CharField(max_length=20, choices=[
        ('core', 'Core Syllabus'),
        ('resources', 'Additional Resources'),
        ('assignments', 'Assignments and Assessments'),
        ('outcomes', 'Learning Outcomes'),
    ], default='core')
    syllabus_format = models.CharField(max_length=20, choices=[
        ('pdf', 'PDF'),
        ('word', 'Word Document'),
        ('google_doc', 'Google Doc'),
        ('html', 'HTML'),
    ], default='pdf')
    syllabus_availability = models.CharField(max_length=20, choices=[
        ('public', 'Public'),
        ('private', 'Private'),
        ('restricted', 'Restricted'),
    ], default='public')
    syllabus_status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('draft', 'Draft'),
    ], default='draft')
    syllabus_level = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ], default='beginner')
    syllabus_subject = models.CharField(max_length=20, choices=[
        ('math', 'Math'),
        ('science', 'Science'),
        ('english', 'English'),
        ('history', 'History'),
    ], default='math')

    start_date = models.DateField()
    end_date = models.DateField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    requirements = models.TextField()

    def __str__(self):
        return self.title

class Payment(models.Model):
    student = models.ForeignKey(Student, related_name='payments', on_delete=models.CASCADE)  
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    total_fee = models.DecimalField(max_digits=10, decimal_places=2)
    is_fully_paid = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.full_name} - {self.amount_paid}"

   
class Subject(models.Model):
    CATEGORY_CHOICES = (
        ('languages', 'Languages'),
        ('sciences', 'Sciences'),
        ('social_sciences', 'Social Sciences'),
        ('arts', 'Arts'),
        ('technical_vocational', 'Technical & Vocational'),
        ('religious_studies', 'Religious Studies'),
        ('other', 'Other'),
    )

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(blank=False, null=False)

    def __str__(self):
        return self.name
    
class Qualification(models.Model):
    CATEGORY_CHOICES = [
        ('Secondary Education', 'Secondary Education'),
        ('Diploma', 'Diploma'),
        ('Bachelor\'s Degree', 'Bachelor\'s Degree'),
        ('Master\'s Degree', 'Master\'s Degree'),
        ('Doctor of Philosophy (PhD)', 'Doctor of Philosophy (PhD)'),
        ('Certificate', 'Certificate'),
        ('Professional Certificates', 'Professional Certificates'),
    ]

    name = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    institution = models.CharField(max_length=100)
    date_awarded = models.DateField()

    def __str__(self):
        return f"{self.name} from {self.institution}"
    
class Assessment(models.Model):
    ASSESSMENT_TYPES = [
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
        ('exam', 'Exam')
    ]

    title = models.CharField(max_length=100)
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    description = models.TextField(blank=False, null=False)
    type = models.CharField(max_length=20, choices=ASSESSMENT_TYPES)
    max_score = models.IntegerField()
    due_date = models.DateField()

    def __str__(self):
        return self.title
    
class Progress(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE, related_name='progresses')
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    modules_completed = models.IntegerField(default=0)
    total_modules = models.IntegerField(default=0)
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    def __str__(self):
        return f"{self.student} - {self.course} - {self.progress_percentage}%"

class Enrollment(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE)
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    enrollment_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.BooleanField(default=False)
    completion_status = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student} - {self.course}"
    

class Message(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender} to {self.receiver}: {self.content[:20]}"


class DiscussionForumPost(models.Model):
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post_content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.creator} - {self.course}: {self.post_content[:20]}"
    

class Reply(models.Model):
    post = models.ForeignKey('DiscussionForumPost', on_delete=models.CASCADE)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author} - {self.post}: {self.content[:20]}"
    
class Notification(models.Model):
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    link = models.URLField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.recipient}: {self.content[:20]}"
    
class Assignment(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    student = models.ForeignKey('Student', on_delete=models.CASCADE, null=True, blank=True) 
    teacher = models.ForeignKey('Teacher', on_delete=models.CASCADE)
    submission_text = models.TextField(blank=True, null=True)
    submission_date = models.DateTimeField(null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)
    ai_assist_used = models.BooleanField(default=False)
    ai_assist_details = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} - {self.course}"
    

class TeacherBoard(models.Model):
    teacher = models.ForeignKey('Teacher', on_delete=models.CASCADE)
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    content = models.JSONField() 
    session_timestamp = models.DateTimeField()

    def __str__(self):
        return f"{self.teacher} - {self.course}"
    
from django.db import models

class CodeEditor(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE)
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    assignment = models.ForeignKey('Assignment', on_delete=models.CASCADE, null=True, blank=True) 
    code = models.TextField()
    language = models.CharField(max_length=50, choices=(('python', 'Python'), ('java', 'Java'), ('c++', 'C++'), ('javascript', 'JavaScript'), ('other', 'Other')))  # Customize choices based on supported languages
    submission_date = models.DateTimeField(auto_now_add=True)
    output = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.student} - {self.course} - {self.language}"
    
from django.db import models

class CameraInteraction(models.Model):
    session_id = models.CharField(max_length=100, unique=True)
    teacher = models.ForeignKey('Teacher', on_delete=models.CASCADE)
    students = models.ManyToManyField('Student')
    session_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Session ID: {self.session_id}"