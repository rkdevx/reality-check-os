import os
import hashlib
import joblib
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_ratelimit.decorators import ratelimit
from .ml.nlp_score import heuristic_nlp_score
from .models import RealityCheckLog, Feedback
from .serializers import LogSerializer, FeedbackSerializer
from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings


# Load models once
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
vec_path = os.path.join(BASE_DIR, "ml/vectorizer.pkl")
model_path = os.path.join(BASE_DIR, "ml/veracity_model.pkl")

vectorizer = joblib.load(vec_path)
model = joblib.load(model_path)

class ClaimPagination(PageNumberPagination):
    page_size = 10  # Har page pe 10 record

# ✅ Already existing function (keep it as is)
@ratelimit(key='ip', rate='10/m', block=True)
@api_view(['POST'])
def analyze_text(request):
    text = request.data.get("text", "")
    fingerprint = hashlib.sha256(text.encode()).hexdigest()[:10]

    X = vectorizer.transform([text])
    ml_score = model.predict_proba(X)[0][1]
    nlp_boosted, reasons = heuristic_nlp_score(text)

    final_score = round(0.7 * ml_score + 0.3 * nlp_boosted, 3)

    # Save to log
    RealityCheckLog.objects.create(text=text, score=final_score, verdict="Factual" if final_score > 0.6 else "Possibly Manipulative")

    return Response({
        "text": text,
        "score": final_score,
        "verdict": "Factual" if final_score > 0.6 else "Possibly Manipulative",
        "ml_score": round(ml_score, 3),
        "nlp_adjustment": round(nlp_boosted, 3),
        "reasons": reasons,
        "fingerprint": fingerprint
    })

# ✅ Bulk analyze
@ratelimit(key='ip', rate='50/m', block=True)
@api_view(['POST'])
def analyze_bulk(request):
    texts = request.data.get("texts", [])
    results = []

    for text in texts:
        if not text.strip():
            continue
        fingerprint = hashlib.sha256(text.encode()).hexdigest()[:10]

        X = vectorizer.transform([text])
        ml_score = model.predict_proba(X)[0][1]
        nlp_boosted, reasons = heuristic_nlp_score(text)

        final_score = round(0.7 * ml_score + 0.3 * nlp_boosted, 3)

        # Save to log
        RealityCheckLog.objects.create(text=text, score=final_score, verdict="Factual" if final_score > 0.6 else "Possibly Manipulative")

        results.append({
            "text": text,
            "score": final_score,
            "verdict": "Factual" if final_score > 0.6 else "Possibly Manipulative",
            "ml_score": round(ml_score, 3),
            "nlp_adjustment": round(nlp_boosted, 3),
            "reasons": reasons,
            "fingerprint": fingerprint
        })

    return Response({"results": results})



@ratelimit(key='ip', rate='50/m', block=True)
@api_view(['GET'])
def get_history(request):
    logs = RealityCheckLog.objects.all().order_by('-timestamp')
    paginator = ClaimPagination()
    result_page = paginator.paginate_queryset(logs, request)
    serializer = LogSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)


@ratelimit(key='ip', rate='50/m', block=True)
@api_view(['GET','POST'])
def feedback(request):
    if request.method == 'GET':
        feedbacks = Feedback.objects.all().order_by('-created_at')[:50]
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)
    else:
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"msg": "Thanks for your feedback!"})
        return Response(serializer.errors, status=400)
    

@api_view(['POST'])
def google_login(request):
    token = request.data.get("token")
    if not token:
        return Response({"error": "No token provided"}, status=400)

    try:
        # Verify token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)

        email = idinfo['email']
        username = email.split("@")[0]

        # Check if user exists, else create
        user, created = User.objects.get_or_create(email=email, defaults={"username": username})

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })

    except ValueError:
        return Response({"error": "Invalid token"}, status=400)



@ratelimit(key='ip', rate='50/m', block=True)
@api_view(['GET'])
def health_check(request):
    return Response({"status": "OK"})

