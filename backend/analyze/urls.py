from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('api/analyze/', views.analyze_text),
    path('api/analyze/bulk/', views.analyze_bulk),
    path('api/history/', views.get_history),
    path('api/feedback/', views.feedback),
    path('api/health/', views.health_check),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenObtainPairView.as_view(), name='token_refresh'),
    path('api/google-login/', views.google_login),
]
