from rest_framework import serializers
from .models import RealityCheckLog, Feedback

class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = RealityCheckLog
        fields = '__all__'

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'
