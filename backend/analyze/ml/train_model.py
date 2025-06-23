import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

# Step 1: Dataset load karo
df = pd.read_csv(rf"D:\Learning\Project\Truth OS\dataset\combined.csv")  

# Step 2: Features & Labels
X_raw = df['text'].astype(str)
y = df['label']

# Step 3: Vectorization
vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
X = vectorizer.fit_transform(X_raw)

# Step 4: Model Training
model = LogisticRegression(max_iter=1000)
model.fit(X, y)

# Step 5: Save Model & Vectorizer
joblib.dump(vectorizer, "vectorizer.pkl")
joblib.dump(model, "veracity_model.pkl")

print("✅ Model training complete & files saved.")
