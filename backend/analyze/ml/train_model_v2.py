from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

# Sample dataset (factual = 1, manipulative = 0)
texts = [
    "Water freezes at 0 degrees Celsius.", 1,
    "Scientists discovered gravitational waves in 2016.", 1,
    "Click this link to make $500 instantly!", 0,
    "You won't believe what she did next!", 0,
    "The COVID-19 virus was first identified in Wuhan, China.", 1,
    "Unlock your true potential with this one secret!", 0,
    "The Great Wall of China is over 13,000 miles long.", 1,
    "Lose belly fat fast with this drink!", 0,
    "The capital of France is Paris.", 1,
    "Doctors hate this man for discovering this cure!", 0,
    # Add ~40 more like these
]

X_raw = texts[::2]
y = texts[1::2]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(X_raw)

model = LogisticRegression()
model.fit(X, y)

joblib.dump(vectorizer, "vectorizer.pkl")
joblib.dump(model, "veracity_model.pkl")
print("✅ ML model (v2) trained.")
