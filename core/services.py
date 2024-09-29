from .models import Student, Teacher

def process_payment(student: Student, amount: float):
    """Processes payment for the student and sends notifications."""
    student.fees_paid += amount
    student.save()

    
    student.send_payment_notification(amount)

    
    try:
        teacher = Teacher.objects.get(user=student.user) 
        teacher.send_payment_notification(amount)
    except Teacher.DoesNotExist:
        print(f"No associated teacher found for student: {student.full_name}")

    
    student.send_sms_notification(amount)
    try:
        teacher.send_sms_notification(amount)
    except Teacher.DoesNotExist:
        print(f"No associated teacher found for student: {student.full_name}")
