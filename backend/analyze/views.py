from rest_framework.decorators import api_view
from rest_framework.response import Response
import hashlib
import joblib
import os
from .ml.nlp_score import heuristic_nlp_score
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import RealityCheckLog, Feedback
from .serializers import LogSerializer, FeedbackSerializer
from django_ratelimit.decorators import ratelimit


# Load models once
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
vec_path = os.path.join(BASE_DIR, "ml/vectorizer.pkl")
model_path = os.path.join(BASE_DIR, "ml/veracity_model.pkl")

vectorizer = joblib.load(vec_path)
model = joblib.load(model_path)



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
@ratelimit(key='ip', rate='5/m', block=True)
@api_view(['POST'])
def analyze_bulk(request):
    texts = request.data.get("texts", [])
    results = []

    for text in texts:
        score = 0.42  # run your model
        verdict = "Possibly Manipulative"
        reasons = ["Clickbait", "Sensational"]

        RealityCheckLog.objects.create(text=text, score=score, verdict=verdict)

        results.append({
            "text": text,
            "score": score,
            "verdict": verdict,
            "reasons": reasons
        })

    return Response({"results": results})

# ✅ Fetch latest history
@ratelimit(key='ip', rate='5/m', block=True)
@api_view(['GET'])
def get_history(request):
    logs = RealityCheckLog.objects.all().order_by('-timestamp')[:50]
    serializer = LogSerializer(logs, many=True)
    return Response(serializer.data)

# ✅ User feedback
@ratelimit(key='ip', rate='5/m', block=True)
@api_view(['POST'])
def submit_feedback(request):
    serializer = FeedbackSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"msg": "Thanks for your feedback!"})
    return Response(serializer.errors, status=400)

# ✅ Health check
@ratelimit(key='ip', rate='5/m', block=True)
@api_view(['GET'])
def health_check(request):
    return Response({"status": "OK"})

