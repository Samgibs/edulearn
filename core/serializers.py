from rest_framework import serializers
from .models import (
    Admin, Classroom, ClassStudent, StudentAssessment, Teacher, Student, Course, 
    Payment, Subject, Qualification, Assessment, Progress, Enrollment, Message, 
    DiscussionForumPost, Reply, Notification, Assignment, TeacherBoard, CodeEditor, 
    CameraInteraction
)

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = '__all__'

class ClassroomSerializer(serializers.ModelSerializer):
    course = serializers.StringRelatedField() 
    teacher = serializers.StringRelatedField() 
    students = serializers.StringRelatedField(many=True)
    class Meta:
        model = Classroom
        fields = '__all__'

class ClassStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassStudent
        fields = '__all__'

class StudentAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAssessment
        fields = '__all__'

        def validate_score(self, value):
            if value > self.instance.assessment.max_score:
                raise serializers.ValidationError("Score cannot exceed the maximum score for this assessment.")
            return value

class TeacherSerializer(serializers.ModelSerializer):
    expertise_area = serializers.StringRelatedField(many=True)
    qualifications = serializers.StringRelatedField(many=True)

    class Meta:
        model = Teacher
        fields = '__all__'


class StudentSerializer(serializers.ModelSerializer):
    progress = serializers.StringRelatedField()  
    enrolled_courses = serializers.StringRelatedField(many=True)
    class Meta:
        model = Student
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    subjects = serializers.StringRelatedField(many=True) 
    teacher = serializers.StringRelatedField()
    class Meta:
        model = Course
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField()  
    course = serializers.StringRelatedField()
    class Meta:
        model = Payment
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class QualificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Qualification
        fields = '__all__'

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = '__all__'

class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

class DiscussionForumPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscussionForumPost
        fields = '__all__'

class ReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Reply
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'

class TeacherBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherBoard
        fields = '__all__'

class CodeEditorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeEditor
        fields = '__all__'

class CameraInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CameraInteraction
        fields = '__all__'
