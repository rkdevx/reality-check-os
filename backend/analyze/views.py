from rest_framework.decorators import api_view
from rest_framework.response import Response
import hashlib
import joblib
import os
from .ml.nlp_score import heuristic_nlp_score

# Load models once
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
vec_path = os.path.join(BASE_DIR, "ml/vectorizer.pkl")
model_path = os.path.join(BASE_DIR, "ml/veracity_model.pkl")

vectorizer = joblib.load(vec_path)
model = joblib.load(model_path)


@api_view(['POST'])
def analyze_claim(request):
    text = request.data.get("text", "")
    fingerprint = hashlib.sha256(text.encode()).hexdigest()[:10]

    X = vectorizer.transform([text])
    ml_score = model.predict_proba(X)[0][1]
    nlp_boosted, reasons = heuristic_nlp_score(text)

    final_score = round(0.7 * ml_score + 0.3 * nlp_boosted, 3)

    return Response({
        "text": text,
        "score": final_score,
        "verdict": "Factual" if final_score > 0.6 else "Possibly Manipulative",
        "ml_score": round(ml_score, 3),
        "nlp_adjustment": round(nlp_boosted, 3),
        "reasons": reasons,
        "fingerprint": fingerprint
    })

