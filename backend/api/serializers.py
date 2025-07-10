from rest_framework import serializers
from .models import Profile, Curriculum, LessonPlan, Quiz, Question, File, ShareLink
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class ShareLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShareLink
        fields = ['link_id', 'expires_at', 'created_by', 'created_at']
        read_only_fields = ['created_at']

class FileSerializer(serializers.ModelSerializer):
    share_links = ShareLinkSerializer(many=True, read_only=True)
    user = serializers.SlugRelatedField(
        slug_field='uid',
        queryset=Profile.objects.all(),
        required=False,
        allow_null=True
    )  # Use uid for user field

    class Meta:
        model = File
        fields = ['id', 'user', 'name', 'title', 'author', 'uploaded_by', 'date', 'file', 'permissions', 
                  'history', 'type', 'tags', 'content', 'course', 'department', 'semester', 'subject', 
                  'class_name', 'category', 'audit_logs', 'share_links']
        read_only_fields = ['date', 'history', 'audit_logs']
        extra_kwargs = {
            'file': {'required': False, 'allow_null': True},
            'name': {'required': True},
            'title': {'required': False},
            'uploaded_by': {'required': True},
            'type': {'required': True},
        }

    def create(self, validated_data):
        logger.info(f"Creating File with data: {validated_data}")
        
        # Handle tags
        tags = validated_data.pop('tags', [])
        if isinstance(tags, str):
            tags = [tag.strip() for tag in tags.split(',')] if tags else []
        validated_data['tags'] = tags

        # Create history entry
        history_entry = {
            'version': 1,
            'date': timezone.now().date().isoformat(),
            'changes': 'Initial upload',
            'state': {
                'name': validated_data.get('name'),
                'title': validated_data.get('title', ''),
                'type': validated_data.get('type'),
                'content': validated_data.get('content', f"Mock content for {validated_data.get('name')}")
            }
        }
        validated_data['history'] = [history_entry]

        # Create audit log
        audit_log = {
            'timestamp': timezone.now().isoformat(),
            'user': validated_data.get('uploaded_by', 'Unknown'),
            'action': 'uploaded'
        }
        validated_data['audit_logs'] = [audit_log]

        try:
            file_instance = File.objects.create(**validated_data)
            logger.info(f"File created with ID: {file_instance.id}")
            return file_instance
        except Exception as e:
            logger.error(f"Failed to create File: {str(e)}")
            raise serializers.ValidationError(f"Failed to create file: {str(e)}")

    def update(self, instance, validated_data):
        logger.info(f"Updating File ID {instance.id} with data: {validated_data}")
        
        # Handle tags
        tags = validated_data.pop('tags', instance.tags)
        if isinstance(tags, str):
            tags = [tag.strip() for tag in tags.split(',')] if tags else instance.tags
        validated_data['tags'] = tags

        # Track changes for history and audit logs
        changed_fields = [k for k in ['name', 'title', 'content', 'type'] if k in validated_data and validated_data[k] != getattr(instance, k)]
        if changed_fields:
            new_version = len(instance.history) + 1
            history_entry = {
                'version': new_version,
                'date': timezone.now().date().isoformat(),
                'changes': f'Updated to version {new_version}: {", ".join(changed_fields)}',
                'state': {
                    'name': instance.name,
                    'title': instance.title,
                    'type': instance.type,
                    'content': instance.content
                }
            }
            instance.history.append(history_entry)

        # Create audit log for any changes
        if changed_fields or validated_data.get('uploaded_by') != instance.uploaded_by or 'permissions' in validated_data:
            audit_log = {
                'timestamp': timezone.now().isoformat(),
                'user': validated_data.get('uploaded_by', instance.uploaded_by),
                'action': 'edited',
                'changed_fields': changed_fields or ['permissions'] if 'permissions' in validated_data else []
            }
            instance.audit_logs.append(audit_log)

        # Update instance fields
        instance.name = validated_data.get('name', instance.name)
        instance.title = validated_data.get('title', instance.title)
        instance.author = validated_data.get('author', instance.author)
        instance.uploaded_by = validated_data.get('uploaded_by', instance.uploaded_by)
        instance.type = validated_data.get('type', instance.type)
        instance.tags = validated_data.get('tags', instance.tags)
        instance.content = validated_data.get('content', instance.content)
        instance.course = validated_data.get('course', instance.course)
        instance.department = validated_data.get('department', instance.department)
        instance.semester = validated_data.get('semester', instance.semester)
        instance.subject = validated_data.get('subject', instance.subject)
        instance.class_name = validated_data.get('class_name', instance.class_name)
        instance.category = validated_data.get('category', instance.category)
        instance.permissions = validated_data.get('permissions', instance.permissions)
        if 'file' in validated_data:
            instance.file = validated_data.get('file')

        try:
            instance.save()
            logger.info(f"File ID {instance.id} updated successfully")
            return instance
        except Exception as e:
            logger.error(f"Failed to update File ID {instance.id}: {str(e)}")
            raise serializers.ValidationError(f"Failed to update file: {str(e)}")
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['uid', 'first_name', 'last_name', 'email', 'phone_number', 'dob', 'qualification', 'address', 'bio', 'role', 'profile_image']
        read_only_fields = ['created_at']
        extra_kwargs = {
            'first_name': {'required': True},
            'email': {'required': True},
            'uid': {'required': True},
        }

    def create(self, validated_data):
        uid = validated_data.get('uid')
        try:
            profile = Profile.objects.get(uid=uid)
            for attr, value in validated_data.items():
                setattr(profile, attr, value)
            profile.save()
            return profile
        except Profile.DoesNotExist:
            return Profile.objects.create(**validated_data)


class CurriculumSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = Curriculum
        fields = ['id', 'user', 'user_email', 'degree', 'subject', 'topics', 'generated_content', 'created_at', 'updated_at', 'curriculum_type']
        read_only_fields = ['created_at', 'updated_at']

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None

class LessonPlanSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = LessonPlan
        fields = ['id', 'user', 'user_email', 'subject', 'topics', 'grade_level', 'duration', 'generated_content', 'created_at', 'updated_at', 'lesson_type']
        read_only_fields = ['created_at', 'updated_at']

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None

class QuestionSerializer(serializers.ModelSerializer):
    correct_answer = serializers.CharField(source='correct_answer')

    class Meta:
        model = Question
        fields = ['id', 'text', 'type', 'options', 'correct_answer', 'explanation']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'mode', 'difficulty', 'created_at', 'questions']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        quiz = Quiz.objects.create(**validated_data)
        for question_data in questions_data:
            Question.objects.create(quiz=quiz, **question_data)
        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions', None)
        instance.title = validated_data.get('title', instance.title)
        instance.mode = validated_data.get('mode', instance.mode)
        instance.difficulty = validated_data.get('difficulty', instance.difficulty)
        instance.save()

        if questions_data is not None:
            instance.questions.all().delete()
            for question_data in questions_data:
                Question.objects.create(quiz=instance, **question_data)

        return instance