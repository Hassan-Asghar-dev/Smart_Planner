from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve

print("Loading backend/urls.py at startup")

try:
    api_urls = include('api.urls')
    print("Successfully loaded api.urls:", api_urls)
except Exception as e:
    print("Failed to load api.urls:", str(e))

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('test/', TemplateView.as_view(template_name='test_profile.html')),
    path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

print("backend/urls.py patterns:", [str(pattern) for pattern in urlpatterns])

# Debug URL resolver
from django.urls import get_resolver
resolver = get_resolver()
print("Resolved URL patterns:")
for pattern, view in resolver.reverse_dict.items():
    if isinstance(pattern, str):
        print(f"Pattern: {pattern}, View: {view}")