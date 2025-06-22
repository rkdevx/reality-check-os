from django.contrib import admin
from django.urls import path
from analyze.views import analyze_claim

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/analyze/', analyze_claim),
]