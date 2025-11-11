# backend/ml/predict_reason.py
import sys, os, joblib

# Always load relative to current script
model_path = os.path.join(os.path.dirname(__file__), "reason_classifier.pkl")

vectorizer, model = joblib.load(model_path)

reason = sys.argv[1]
X = vectorizer.transform([reason])
prediction = model.predict(X)[0]

print(prediction)
