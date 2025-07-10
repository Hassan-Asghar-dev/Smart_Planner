import logging
import base64
from django.core.files.base import ContentFile
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from .models import Profile, Curriculum, LessonPlan, Quiz, File, ShareLink
from .serializers import ProfileSerializer, CurriculumSerializer, LessonPlanSerializer, QuizSerializer, FileSerializer
from django.db import IntegrityError
import openai
from openai import AuthenticationError, OpenAIError
from decouple import config
from django.utils import timezone
import uuid
from datetime import datetime

# Configure OpenAI API client
openai.api_key = config('OPENAI_API_KEY')

logger = logging.getLogger(__name__)

@api_view(['POST'])
def generate_custom_curriculum(request):
    logger.info("Received request for generate_custom_curriculum")
    logger.info(f"Request data: {request.data}")
    try:
        uid = request.data.get('uid')
        if not uid:
            logger.error("UID is required")
            return Response({
                'status': 'error',
                'message': 'UID is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = Profile.objects.get(uid=uid)
        except Profile.DoesNotExist:
            logger.error("Profile not found")
            return Response({
                'status': 'error',
                'message': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

        degree = request.data.get('degree')
        subject = request.data.get('subject')
        topics = request.data.get('topics')

        if not all([degree, subject, topics]):
            logger.error("Degree, subject, and topics are required")
            return Response({
                'status': 'error',
                'message': 'Degree, subject, and topics are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        prompt = (
            f"Generate a detailed curriculum for a {degree} degree focusing on the subject {subject}. "
            f"Include the following topics: {topics}. "
            f"Structure the curriculum with the following sections:\n"
            f"- Course Title\n"
            f"- Degree Overview\n"
            f"- Learning Objectives\n"
            f"- Course Modules (with detailed topics and subtopics)\n"
            f"- Assessments\n"
            f"- Resources\n"
            f"Ensure the curriculum is comprehensive and suitable for academic use."
        )

        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert curriculum designer."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7,
            )
            generated_content = response.choices[0].message.content.strip()
        except AuthenticationError as e:
            logger.error(f"OpenAI API Authentication error: {str(e)}")
            generated_content = (
                f"Course Title\n"
                f"{subject} Curriculum for {degree}\n\n"
                f"Degree Overview\n"
                f"This curriculum introduces key concepts for {degree} students...\n\n"
                f"Learning Objectives\n"
                f"- Understand the basics of {topics}\n"
                f"- Apply {topics} in practical scenarios\n\n"
                f"Course Modules\n"
                f"- Module 1: Introduction to {subject}\n"
                f"- Module 2: {topics}\n\n"
                f"Assessments\n"
                f"- Midterm exam\n"
                f"- Final project\n\n"
                f"Resources\n"
                f"- Textbook: '{subject} Fundamentals'\n"
                f"- Website: www.{subject.lower()}-education.com"
            )
            logger.warning("Using mock response due to OpenAI API key issue.")
        except OpenAIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to generate curriculum with OpenAI',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        curriculum = Curriculum.objects.create(
            user=profile,
            degree=degree,
            subject=subject,
            topics=topics,
            generated_content=generated_content,
            curriculum_type='custom'
        )

        # Save to File model for file manager
        file_data = {
            'user': profile.uid,
            'name': f"{subject}_{degree}_curriculum.txt",
            'title': f"Curriculum for {subject} - {degree}",
            'author': profile.role,
            'uploaded_by': profile.role,
            'type': 'txt',
            'content': generated_content,
            'category': 'Curriculum',
        }
        file_serializer = FileSerializer(data=file_data)
        if file_serializer.is_valid():
            file_serializer.save()
            logger.info("Successfully saved curriculum to file manager")
        else:
            logger.error(f"Failed to save curriculum to file manager: {file_serializer.errors}")

        logger.info("Successfully generated custom curriculum")
        return Response({
            'curriculum': {
                'id': curriculum.id,
                'generated_content': generated_content,
                'file_id': file_serializer.instance.id if file_serializer.is_valid() else None
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Unexpected error generating curriculum: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def generate_standard_curriculum(request):
    logger.info("Received request for generate_standard_curriculum")
    logger.info(f"Request data: {request.data}")
    try:
        uid = request.data.get('uid')
        if not uid:
            logger.error("UID is required")
            return Response({
                'status': 'error',
                'message': 'UID is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = Profile.objects.get(uid=uid)
        except Profile.DoesNotExist:
            logger.error("Profile not found")
            return Response({
                'status': 'error',
                'message': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

        degree = request.data.get('degree')
        subject = request.data.get('subject')

        if not all([degree, subject]):
            logger.error("Degree and subject are required")
            return Response({
                'status': 'error',
                'message': 'Degree and subject are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        prompt = (
            f"Generate a standard curriculum for a {degree} degree in the subject {subject}. "
            f"Base the curriculum on widely accepted academic standards. "
            f"Structure the curriculum with the following sections:\n"
            f"- Course Title\n"
            f"- Degree Overview\n"
            f"- Learning Objectives\n"
            f"- Course Modules (with detailed topics and subtopics)\n"
            f"- Assessments\n"
            f"- Resources\n"
            f"Ensure the curriculum is comprehensive, aligned with academic standards, and suitable for university use."
        )

        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert curriculum designer specializing in standard academic curricula."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7,
            )
            generated_content = response.choices[0].message.content.strip()
        except AuthenticationError as e:
            logger.error(f"OpenAI API Authentication error: {str(e)}")
            generated_content = (
                f"Course Title\n"
                f"Standard {subject} Curriculum for {degree}\n\n"
                f"Degree Overview\n"
                f"This curriculum aligns with academic standards for {degree} students...\n\n"
                f"Learning Objectives\n"
                f"- Master core concepts of {subject}\n"
                f"- Develop critical thinking skills\n\n"
                f"Course Modules\n"
                f"- Module 1: Foundations of {subject}\n"
                f"- Module 2: Advanced {subject} Topics\n\n"
                f"Assessments\n"
                f"- Midterm exam\n"
                f"- Final project\n\n"
                f"Resources\n"
                f"- Textbook: '{subject} Essentials'\n"
                f"- Website: www.{subject.lower()}-standards.org"
            )
            logger.warning("Using mock response due to OpenAI API key issue.")
        except OpenAIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to generate curriculum with OpenAI',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        curriculum = Curriculum.objects.create(
            user=profile,
            degree=degree,
            subject=subject,
            topics=f"Standard {subject} topics",
            generated_content=generated_content,
            curriculum_type='standard'
        )

        # Save to File model for file manager
        file_data = {
            'user': profile.uid,
            'name': f"{subject}_{degree}_standard_curriculum.txt",
            'title': f"Standard Curriculum for {subject} - {degree}",
            'author': profile.role,
            'uploaded_by': profile.role,
            'type': 'txt',
            'content': generated_content,
            'category': 'Curriculum',
        }
        file_serializer = FileSerializer(data=file_data)
        if file_serializer.is_valid():
            file_serializer.save()
            logger.info("Successfully saved standard curriculum to file manager")
        else:
            logger.error(f"Failed to save standard curriculum to file manager: {file_serializer.errors}")

        logger.info("Successfully generated standard curriculum")
        return Response({
            'curriculum': {
                'id': curriculum.id,
                'generated_content': generated_content,
                'file_id': file_serializer.instance.id if file_serializer.is_valid() else None
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Unexpected error generating standard curriculum: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_user_curriculums(request, uid):
    logger.info(f"Received request for get_user_curriculums with uid: {uid}")
    try:
        try:
            profile = Profile.objects.get(uid=uid)
        except Profile.DoesNotExist:
            logger.error("Profile not found")
            return Response({
                'status': 'error',
                'message': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

        curriculums = Curriculum.objects.filter(user=profile)
        serializer = CurriculumSerializer(curriculums, many=True)
        logger.info("Successfully fetched curriculums")
        return Response({
            'status': 'success',
            'curriculums': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Unexpected error fetching curriculums: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def generate_lesson_plan(request):
    logger.info("Received request for generate_lesson_plan")
    logger.info(f"Request data: {request.data}")
    try:
        uid = request.data.get('uid')
        if not uid:
            logger.error("UID is required")
            return Response({
                'status': 'error',
                'message': 'UID is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = Profile.objects.get(uid=uid)
        except Profile.DoesNotExist:
            logger.error("Profile not found")
            return Response({
                'status': 'error',
                'message': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

        subject = request.data.get('subject')
        topics = request.data.get('topics')
        grade_level = request.data.get('grade_level')
        duration = request.data.get('duration', '1 hour')

        if not all([subject, topics, grade_level]):
            logger.error("Subject, topics, and grade level are required")
            return Response({
                'status': 'error',
                'message': 'Subject, topics, and grade level are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        prompt = (
            f"Generate a detailed lesson plan for a {grade_level} class focusing on the subject {subject}. "
            f"Include the following topics: {topics}. The lesson should last approximately {duration}. "
            f"Structure the lesson plan with the following sections:\n"
            f"- Lesson Title\n"
            f"- Subject Overview\n"
            f"- Learning Objectives\n"
            f"- Materials Needed\n"
            f"- Lesson Procedure (with time allocations for each activity)\n"
            f"- Assessments\n"
            f"- Resources (e.g., books, websites, worksheets)\n"
            f"Ensure the lesson plan is engaging, age-appropriate, and suitable for classroom use."
        )

        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert lesson plan designer."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7,
            )
            generated_content = response.choices[0].message.content.strip()
        except AuthenticationError as e:
            logger.error(f"OpenAI API Authentication error: {str(e)}")
            generated_content = (
                f"Lesson Title\n"
                f"Lesson Plan for {subject} - {grade_level}\n\n"
                f"Subject Overview\n"
                f"{subject} introduces key concepts for {grade_level} students...\n\n"
                f"Learning Objectives\n"
                f"- Understand the basics of {topics}\n"
                f"- Apply {topics} in classroom activities\n\n"
                f"Materials Needed\n"
                f"- Textbooks, worksheets, whiteboard\n\n"
                f"Lesson Procedure\n"
                f"0-10 min: Introduction to {subject}\n"
                f"10-40 min: Interactive activity on {topics}\n"
                f"40-60 min: Group discussion and wrap-up\n\n"
                f"Assessments\n"
                f"- Class participation\n"
                f"- Short quiz on {topics}\n\n"
                f"Resources\n"
                f"- Book: '{subject} for Beginners'\n"
                f"- Website: www.{subject.lower()}-education.com"
            )
            logger.warning("Using mock response due to OpenAI API key issue.")
        except OpenAIError as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to generate lesson plan with OpenAI',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        lesson_plan = LessonPlan.objects.create(
            user=profile,
            subject=subject,
            topics=topics,
            grade_level=grade_level,
            duration=duration,
            generated_content=generated_content,
            lesson_type='custom'
        )

        # Save to File model for file manager
        file_data = {
            'user': profile.uid,
            'name': f"{subject}_{grade_level}_lesson_plan.txt",
            'title': f"Lesson Plan for {subject} - {grade_level}",
            'author': profile.role,
            'uploaded_by': profile.role,
            'type': 'txt',
            'content': generated_content,
            'category': 'Lesson Plan',
        }
        file_serializer = FileSerializer(data=file_data)
        if file_serializer.is_valid():
            file_serializer.save()
            logger.info("Successfully saved lesson plan to file manager")
        else:
            logger.error(f"Failed to save lesson plan to file manager: {file_serializer.errors}")

        logger.info("Successfully generated lesson plan")
        return Response({
            'lesson_plan': {
                'id': lesson_plan.id,
                'generated_content': generated_content,
                'file_id': file_serializer.instance.id if file_serializer.is_valid() else None
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Unexpected error generating lesson plan: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_user_lesson_plans(request, uid):
    logger.info(f"Received request for get_user_lesson_plans with uid: {uid}")
    try:
        try:
            profile = Profile.objects.get(uid=uid)
        except Profile.DoesNotExist:
            logger.error("Profile not found")
            return Response({
                'status': 'error',
                'message': 'Profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

        lesson_plans = LessonPlan.objects.filter(user=profile)
        serializer = LessonPlanSerializer(lesson_plans, many=True)
        logger.info("Successfully fetched lesson plans")
        return Response({
            'status': 'success',
            'lesson_plans': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Unexpected error fetching lesson plans: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_profile(request, uid):
    logger.info(f"Received request for get_profile with uid: {uid}")
    try:
        profile = Profile.objects.get(uid=uid)
        serializer = ProfileSerializer(profile)
        logger.info("Successfully fetched profile")
        return Response({
            'status': 'success',
            'profile': serializer.data
        }, status=status.HTTP_200_OK)
    except Profile.DoesNotExist:
        logger.error("Profile not found")
        return Response({
            'status': 'error',
            'message': 'Profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Unexpected error getting profile: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def save_profile(request):
    logger.info(f"Received request for save_profile")
    logger.info(f"Request data (raw): {request.data}")
    logger.info(f"Request headers: {dict(request.headers)}")
    try:
        # Sanitize request.data to handle tuples or lists
        data_dict = {}
        for key, value in request.data.items():
            if isinstance(value, (list, tuple)) and len(value) > 0:
                data_dict[key] = value[0]  # Take first item if list/tuple
                logger.info(f"Converted {key} from {type(value)} to {data_dict[key]}")
            elif isinstance(value, (list, tuple)) and len(value) == 0:
                data_dict[key] = None  # Handle empty lists/tuples
                logger.info(f"Converted empty {key} to None")
            else:
                data_dict[key] = value

        # Handle uid specifically
        uid = data_dict.get('uid')
        if not uid:
            logger.error("UID is required")
            return Response({
                'status': 'error',
                'message': 'UID is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Handle profile_image
        profile_image = data_dict.get('profile_image', '')
        if profile_image and isinstance(profile_image, str) and profile_image.startswith('data:image'):
            format, imgstr = profile_image.split(';base64,')
            ext = format.split('/')[-1]
            filename = f'profile_{uid}.{ext}'
            data = ContentFile(base64.b64decode(imgstr), name=filename)
            data_dict['profile_image'] = data
            logger.info("Processed base64 profile image")
        elif profile_image and isinstance(profile_image, str) and profile_image.startswith('/media/'):
            logger.info("Profile image is a URL, excluding from update")
            data_dict.pop('profile_image', None)
        elif 'profile_image' in request.FILES:
            logger.info("Profile image is a file upload")
            data_dict['profile_image'] = request.FILES['profile_image']
        else:
            logger.info("No profile image provided or invalid format, excluding")
            data_dict.pop('profile_image', None)

        logger.info(f"Sanitized data_dict: {data_dict}")

        try:
            profile = Profile.objects.get(uid=uid)
            logger.info(f"Profile exists for UID {uid}, updating")
            serializer = ProfileSerializer(profile, data=data_dict, partial=True)
        except Profile.DoesNotExist:
            logger.info(f"Profile does not exist for UID {uid}, creating")
            serializer = ProfileSerializer(data=data_dict)

        if serializer.is_valid():
            try:
                profile = serializer.save()
                logger.info(f"Profile saved successfully for UID: {uid}")
                return Response({
                    'status': 'success',
                    'message': 'Profile saved successfully',
                    'profile': serializer.data
                }, status=status.HTTP_200_OK)
            except IntegrityError as e:
                logger.error(f"Database integrity error: {str(e)}")
                return Response({
                    'status': 'error',
                    'message': 'Database integrity error',
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            logger.error(f"Validation errors: {serializer.errors}")
            return Response({
                'status': 'error',
                'message': 'Profile validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"Unexpected error saving profile: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class QuizListCreateView(generics.ListCreateAPIView):
    logger.info("Initializing QuizListCreateView")
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        logger.info("Fetching quiz queryset")
        uid = self.request.query_params.get('uid')
        if uid:
            try:
                profile = Profile.objects.get(uid=uid)
                return Quiz.objects.filter(user=profile)
            except Profile.DoesNotExist:
                return Quiz.objects.none()
        return Quiz.objects.filter(user__isnull=True)

    def perform_create(self, serializer):
        logger.info("Performing quiz creation")
        uid = self.request.data.get('uid')
        if uid:
            try:
                profile = Profile.objects.get(uid=uid)
                serializer.save(user=profile)
            except Profile.DoesNotExist:
                serializer.save()
        else:
            serializer.save()

class QuizRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    logger.info("Initializing QuizRetrieveUpdateView")
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        logger.info("Fetching quiz queryset for retrieve/update")
        uid = self.request.query_params.get('uid')
        if uid:
            try:
                profile = Profile.objects.get(uid=uid)
                return Quiz.objects.filter(user=profile)
            except Profile.DoesNotExist:
                return Quiz.objects.none()
        return Quiz.objects.filter(user__isnull=True)

class FileListCreateView(generics.ListCreateAPIView):
    logger.info("Initializing FileListCreateView")
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        logger.info("Fetching file queryset")
        uid = self.request.query_params.get('uid')
        user_role = self.request.query_params.get('user_role', 'Student')
        filters = {}
        for key in ['type', 'uploaded_by', 'course', 'department', 'semester', 'subject', 'class_name', 'category']:
            value = self.request.query_params.get(key)
            if value:
                filters[f'{key}__iexact'] = value
        date_range = self.request.query_params.get('date_range')
        if date_range:
            if date_range == '7days':
                filters['date__gte'] = timezone.now().date() - timezone.timedelta(days=7)
            elif date_range == '30days':
                filters['date__gte'] = timezone.now().date() - timezone.timedelta(days=30)
        if 'tag' in self.request.query_params:
            filters['tags__contains'] = self.request.query_params.get('tag')

        queryset = File.objects.filter(**filters)
        # Apply permission-based filtering
        if user_role == 'Admin':
            return queryset
        return queryset.filter(permissions__contains={user_role: {'read': True}})

    def perform_create(self, serializer):
        logger.info("Performing file creation")
        uid = self.request.data.get('uid')
        user_role = self.request.data.get('user_role', 'Student')
        if user_role not in ['Admin', 'Teacher']:
            logger.error("Permission denied for file upload")
            return Response({
                'status': 'error',
                'message': 'Permission denied: Only Admin and Teacher can upload files'
            }, status=status.HTTP_403_FORBIDDEN)

        tags = self.request.data.get('tags', '')
        if isinstance(tags, str):
            tags = [tag.strip() for tag in tags.split(',')] if tags else []

        history_entry = {
            'version': 1,
            'date': timezone.now().date().isoformat(),
            'changes': 'Initial upload',
            'state': {
                'name': self.request.data.get('name'),
                'title': self.request.data.get('title'),
                'type': self.request.data.get('name', '').split('.')[-1].lower(),
                'content': self.request.data.get('content', f"Mock content for {self.request.data.get('name')}")
            }
        }

        audit_log = {
            'timestamp': timezone.now().isoformat(),
            'user': user_role,
            'action': 'uploaded'
        }

        if uid:
            try:
                profile = Profile.objects.get(uid=uid)
                serializer.save(
                    user=profile,
                    uploaded_by=user_role,
                    author=user_role,
                    tags=tags,
                    history=[history_entry],
                    audit_logs=[audit_log],
                    type=self.request.data.get('name', '').split('.')[-1].lower()
                )
            except Profile.DoesNotExist:
                logger.error("Profile not found for UID")
                return Response({
                    'status': 'error',
                    'message': 'Profile not found'
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            serializer.save(
                uploaded_by=user_role,
                author=user_role,
                tags=tags,
                history=[history_entry],
                audit_logs=[audit_log],
                type=self.request.data.get('name', '').split('.')[-1].lower()
            )

class FileRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    logger.info("Initializing FileRetrieveUpdateView")
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        logger.info("Fetching file queryset for retrieve/update")
        uid = self.request.query_params.get('uid')
        user_role = self.request.query_params.get('user_role', 'Student')
        if uid:
            try:
                profile = Profile.objects.get(uid=uid)
                queryset = File.objects.filter(user=profile)
            except Profile.DoesNotExist:
                queryset = File.objects.none()
        else:
            queryset = File.objects.all()

        if user_role == 'Admin':
            return queryset
        return queryset.filter(permissions__contains={user_role: {'read': True}})

    def perform_update(self, serializer):
        logger.info("Performing file update")
        user_role = self.request.data.get('user_role', 'Student')
        instance = self.get_object()
        if not instance.permissions.get(user_role, {}).get('write', False):
            logger.error("Permission denied for file update")
            return Response({
                'status': 'error',
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)

        # Update history
        new_version = len(instance.history) + 1
        history_entry = {
            'version': new_version,
            'date': timezone.now().date().isoformat(),
            'changes': f'Updated to version {new_version}',
            'state': {
                'name': instance.name,
                'title': instance.title,
                'type': instance.type,
                'content': instance.content
            }
        }
        instance.history.append(history_entry)

        # Update audit logs
        audit_log = {
            'timestamp': timezone.now().isoformat(),
            'user': user_role,
            'action': 'edited'
        }
        instance.audit_logs.append(audit_log)

        # Handle tags
        tags = self.request.data.get('tags', instance.tags)
        if isinstance(tags, str):
            tags = [tag.strip() for tag in tags.split(',')] if tags else instance.tags

        serializer.save(tags=tags, history=instance.history, audit_logs=instance.audit_logs)

@api_view(['DELETE'])
def delete_file(request, file_id):
    logger.info(f"Received request to delete file with id: {file_id}")
    try:
        file = File.objects.get(id=file_id)
        user_role = request.query_params.get('user_role', 'Student')
        if user_role != 'Admin' and not file.permissions.get(user_role, {}).get('delete', False):
            logger.error("Permission denied for deletion")
            return Response({
                'status': 'error',
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Log deletion in audit logs before deleting
        audit_log = {
            'timestamp': timezone.now().isoformat(),
            'user': user_role,
            'action': 'deleted'
        }
        file.audit_logs.append(audit_log)
        file.save()
        
        file.delete()
        logger.info(f"Successfully deleted file with id: {file_id}")
        return Response({
            'status': 'success',
            'message': 'File deleted successfully'
        }, status=status.HTTP_200_OK)
    except File.DoesNotExist:
        logger.error(f"File with id {file_id} not found")
        return Response({
            'status': 'error',
            'message': 'File not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Unexpected error deleting file: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def update_permissions(request, file_id):
    logger.info(f"Received request to update permissions for file with id: {file_id}")
    try:
        file = File.objects.get(id=file_id)
        user_role = request.query_params.get('user_role', 'Student')
        if user_role != 'Admin':
            logger.error("Permission denied for updating permissions")
            return Response({
                'status': 'error',
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        new_permissions = request.data.get('permissions', {})
        file.permissions = new_permissions
        
        # Update audit logs
        audit_log = {
            'timestamp': timezone.now().isoformat(),
            'user': user_role,
            'action': 'updated permissions'
        }
        file.audit_logs.append(audit_log)
        
        file.save()
        logger.info(f"Successfully updated permissions for file with id: {file_id}")
        return Response({
            'status': 'success',
            'message': 'Permissions updated successfully',
            'permissions': file.permissions
        }, status=status.HTTP_200_OK)
    except File.DoesNotExist:
        logger.error(f"File with id {file_id} not found")
        return Response({
            'status': 'error',
            'message': 'File not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Unexpected error updating permissions: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def generate_share_link(request, file_id):
    logger.info(f"Received request to generate share link for file with id: {file_id}")
    try:
        file = File.objects.get(id=file_id)
        user_role = request.query_params.get('user_role', 'Student')
        if not file.permissions.get(user_role, {}).get('read', False):
            logger.error("Permission denied for generating share link")
            return Response({
                'status': 'error',
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        link_id = str(uuid.uuid4())
        expires_at = timezone.now() + timezone.timedelta(days=7)  # 7 days expiration
        share_link = file.share_links.create(
            link_id=link_id,
            expires_at=expires_at,
            created_by=user_role
        )
        
        # Update audit logs
        audit_log = {
            'timestamp': timezone.now().isoformat(),
            'user': user_role,
            'action': 'generated share link'
        }
        file.audit_logs.append(audit_log)
        file.save()
        
        logger.info(f"Successfully generated share link for file with id: {file_id}")
        return Response({
            'status': 'success',
            'message': 'Share link generated successfully',
            'url': f'https://example.com/share/{link_id}',  # Update with actual domain
            'expires_at': expires_at.isoformat()
        }, status=status.HTTP_200_OK)
    except File.DoesNotExist:
        logger.error(f"File with id {file_id} not found")
        return Response({
            'status': 'error',
            'message': 'File not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Unexpected error generating share link: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def access_share_link(request, file_id, link_id):
    logger.info(f"Received request to access share link {link_id} for file with id: {file_id}")
    try:
        file = File.objects.get(id=file_id)
        user_role = request.query_params.get('user_role', 'Student')
        try:
            share_link = file.share_links.get(link_id=link_id)
        except ShareLink.DoesNotExist:
            logger.error(f"Share link {link_id} not found")
            return Response({
                'status': 'error',
                'message': 'Share link not found'
            }, status=status.HTTP_404_NOT_FOUND)

        if share_link.expires_at < timezone.now():
            logger.error(f"Share link {link_id} has expired")
            return Response({
                'status': 'error',
                'message': 'Share link has expired'
            }, status=status.HTTP_410_GONE)

        # Update audit logs
        audit_log = {
            'timestamp': timezone.now().isoformat(),
            'user': user_role,
            'action': f'accessed share link {link_id}'
        }
        file.audit_logs.append(audit_log)
        file.save()

        serializer = FileSerializer(file)
        logger.info(f"Successfully accessed share link {link_id} for file with id: {file_id}")
        return Response({
            'status': 'success',
            'message': 'Share link accessed successfully',
            'file': serializer.data
        }, status=status.HTTP_200_OK)
    except File.DoesNotExist:
        logger.error(f"File with id {file_id} not found")
        return Response({
            'status': 'error',
            'message': 'File not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Unexpected error accessing share link: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def rollback_file(request, file_id):
    logger.info(f"Received request to rollback file with id: {file_id}")
    try:
        file = File.objects.get(id=file_id)
        user_role = request.query_params.get('user_role', 'Student')
        if not file.permissions.get(user_role, {}).get('write', False):
            logger.error("Permission denied for rollback")
            return Response({
                'status': 'error',
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)

        version = request.data.get('version')
        if not version:
            logger.error("Version is required for rollback")
            return Response({
                'status': 'error',
                'message': 'Version is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        version_entry = next((entry for entry in file.history if entry['version'] == int(version)), None)
        if not version_entry or not version_entry.get('state'):
            logger.error(f"Version {version} not found or invalid")
            return Response({
                'status': 'error',
                'message': 'Version not found or invalid'
            }, status=status.HTTP_404_NOT_FOUND)

        state = version_entry['state']
        new_version = len(file.history) + 1
        history_entry = {
            'version': new_version,
            'date': timezone.now().date().isoformat(),
            'changes': f'Rolled back to version {version}',
            'state': state
        }
        file.history.append(history_entry)

        # Update audit logs
        audit_log = {
            'timestamp': timezone.now().isoformat(),
            'user': user_role,
            'action': 'rolled back'
        }
        file.audit_logs.append(audit_log)

        # Update file fields
        file.name = state.get('name', file.name)
        file.title = state.get('title', file.title)
        file.type = state.get('type', file.type)
        file.content = state.get('content', file.content)
        file.save()

        serializer = FileSerializer(file)
        logger.info(f"Successfully rolled back file with id: {file_id} to version {version}")
        return Response({
            'status': 'success',
            'message': f'Successfully rolled back to version {version}',
            'file': serializer.data
        }, status=status.HTTP_200_OK)
    except File.DoesNotExist:
        logger.error(f"File with id {file_id} not found")
        return Response({
            'status': 'error',
            'message': 'File not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Unexpected error rolling back file: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)