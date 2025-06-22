
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

# Sample training data
texts = [
    "Water boils at 100 degrees Celsius.",
    "The moon has no atmosphere.",
    "Click here to become rich instantly!",
    "You won’t believe what happened next!",
    "Humans need oxygen to survive.",
    "This one weird trick will change your life!",
]

labels = [1, 1, 0, 0, 1, 0]  # 1 = factual, 0 = manipulative/emotional

# TF-IDF + model training
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

model = LogisticRegression()
model.fit(X, labels)

# Save vectorizer and model
joblib.dump(vectorizer, "vectorizer.pkl")
joblib.dump(model, "veracity_model.pkl")
print("✅ Model trained and saved.")
