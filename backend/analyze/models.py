from django.db import models

class RealityCheckLog(models.Model):
    text = models.TextField()
    score = models.FloatField()
    verdict = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

class Feedback(models.Model):
    text = models.TextField()
    user_score = models.FloatField()
    verdict = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
