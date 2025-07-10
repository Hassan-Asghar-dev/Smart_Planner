from django.urls import path
from . import views

urlpatterns = [
    path('generate-custom-curriculum/', views.generate_custom_curriculum, name='generate-custom-curriculum'),
    path('generate-standard-curriculum/', views.generate_standard_curriculum, name='generate-standard-curriculum'),
    path('get-user-curriculums/<str:uid>/', views.get_user_curriculums, name='get-user-curriculums'),
    path('generate-lesson-plan/', views.generate_lesson_plan, name='generate-lesson-plan'),
    path('get-user-lesson-plans/<str:uid>/', views.get_user_lesson_plans, name='get-user-lesson-plans'),
    path('get-profile/<str:uid>/', views.get_profile, name='get-profile'),
    path('save-profile/', views.save_profile, name='save-profile'),
    path('quizzes/', views.QuizListCreateView.as_view(), name='quiz-list-create'),
    path('quizzes/<int:pk>/', views.QuizRetrieveUpdateView.as_view(), name='quiz-retrieve-update'),
    path('files/', views.FileListCreateView.as_view(), name='file-list-create'),
    path('files/<int:file_id>/', views.FileRetrieveUpdateView.as_view(), name='file-retrieve-update'),
    path('files/<int:file_id>/delete/', views.delete_file, name='delete-file'),
    path('files/<int:file_id>/permissions/', views.update_permissions, name='update-permissions'),
    path('files/<int:file_id>/share/', views.generate_share_link, name='generate-share-link'),
    path('files/<int:file_id>/share/<str:link_id>/access/', views.access_share_link, name='access-share-link'),
    path('files/<int:file_id>/rollback/', views.rollback_file, name='rollback-file'),
]