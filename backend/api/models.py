from django.db import models
from django.utils import timezone
import uuid

def profile_image_path(instance, filename):
    ext = filename.split('.')[-1]
    return f'profile_images/profile_{instance.uid}.{ext}'

class Profile(models.Model):
    uid = models.CharField(max_length=255, unique=True, db_index=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    dob = models.DateField(null=True, blank=True)
    qualification = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=20, default='teacher')
    profile_image = models.ImageField(upload_to=profile_image_path, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name or ''} ({self.email})"

    def save(self, *args, **kwargs):
        if self.pk:
            try:
                old_instance = Profile.objects.get(pk=self.pk)
                if old_instance.profile_image and self.profile_image != old_instance.profile_image:
                    old_instance.profile_image.delete(save=False)
            except Profile.DoesNotExist:
                pass
        super().save(*args, **kwargs)

class Curriculum(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='curriculums')
    degree = models.CharField(max_length=100)
    subject = models.CharField(max_length=100)
    topics = models.TextField()
    generated_content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    curriculum_type = models.CharField(max_length=50, choices=[('custom', 'Custom'), ('standard', 'Standard')], default='custom')

    def __str__(self):
        return f"{self.degree} - {self.subject} ({self.user.email}) - {self.curriculum_type}"

    class Meta:
        ordering = ['-created_at']

class LessonPlan(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='lesson_plans')
    subject = models.CharField(max_length=100)
    topics = models.TextField()
    grade_level = models.CharField(max_length=50)
    duration = models.CharField(max_length=50, default='1 hour')
    generated_content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    lesson_type = models.CharField(max_length=50, choices=[('custom', 'Custom'), ('standard', 'Standard')], default='custom')

    def __str__(self):
        return f"{self.subject} - {self.grade_level} ({self.user.email}) - {self.lesson_type}"

    class Meta:
        ordering = ['-created_at']

class Quiz(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='quizzes', null=True, blank=True)
    title = models.CharField(max_length=255)
    mode = models.CharField(max_length=20, choices=[('quiz', 'Quiz'), ('assessment', 'Assessment')])
    difficulty = models.CharField(max_length=20, default='Medium')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.mode})"

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    type = models.CharField(max_length=20, choices=[
        ('mcq', 'Multiple Choice'),
        ('truefalse', 'True/False'),
        ('shortanswer', 'Short Answer'),
        ('essay', 'Essay')
    ])
    options = models.JSONField(default=list)
    correct_answer = models.TextField()
    explanation = models.TextField()

    def __str__(self):
        return f"{self.text} ({self.type})"

def get_default_permissions():
    return {
        'Admin': {'read': True, 'write': True, 'delete': True},
        'Teacher': {'read': True, 'write': True, 'delete': False},
        'Student': {'read': True, 'write': False, 'delete': False}
    }

class File(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='files', null=True, blank=True)
    name = models.CharField(max_length=255)
    title = models.CharField(max_length=255, blank=True)
    author = models.CharField(max_length=100, default='Unknown')
    uploaded_by = models.CharField(max_length=100)
    date = models.DateField(auto_now_add=True)
    file = models.FileField(upload_to='files/', null=True, blank=True)  # Make file optional
    permissions = models.JSONField(default=get_default_permissions)
    history = models.JSONField(default=list)
    type = models.CharField(max_length=50)
    tags = models.JSONField(default=list)
    content = models.TextField(blank=True)
    course = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    semester = models.CharField(max_length=100, blank=True)
    subject = models.CharField(max_length=100, blank=True)
    class_name = models.CharField(max_length=100, blank=True, db_column='class')
    category = models.CharField(max_length=100, default='Curriculum')
    audit_logs = models.JSONField(default=list)

    def __str__(self):
        return self.name
class ShareLink(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='share_links')
    link_id = models.CharField(max_length=36, unique=True)
    expires_at = models.DateTimeField()
    created_by = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ShareLink for {self.file.name} (Expires: {self.expires_at})"