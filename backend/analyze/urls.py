from django.urls import path
from . import views

urlpatterns = [
    path('api/analyze/', views.analyze_text),
    path('api/analyze/bulk/', views.analyze_bulk),
    path('api/history/', views.get_history),
    path('api/feedback/', views.submit_feedback),
    path('api/health/', views.health_check),
]
