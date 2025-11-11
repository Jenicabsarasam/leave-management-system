import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

# 🧾 Expanded training dataset
data = {
    "reason": [
        # 🩺 Medical
        "fever and cold", "headache", "sick leave", "medical emergency", "doctor appointment",
        "hospital visit", "flu and body pain", "covid symptoms", "illness", "health issue",
        "stomach ache", "back pain", "tooth pain", "eye infection", "fatigue",

        # 👨‍👩‍👧 Family
        "going home for family function", "family marriage", "sister wedding", "family event",
        "attending funeral", "parents anniversary", "taking care of family member",
        "relative hospitalised", "home ceremony", "grandmother birthday",

        # ✈️ Travel
        "vacation travel", "trip with friends", "out of station", "visiting hometown",
        "train delay", "bus issue", "traveling to another city", "returning from trip",
        "flight cancellation", "journey to home",

        # 🧍‍♀️ Personal
        "personal reason", "urgent work at home", "personal issues", "need rest",
        "taking break", "self care", "mental health", "personal matter",

        # 🎓 Academic
        "college event", "seminar participation", "hackathon", "project work",
        "competition outside campus", "internship orientation", "exam preparation",
        "lab work", "technical fest", "presentation day",

        # 🌞 Holiday / Weekend
        "holiday", "weekend leave", "going out on sunday", "public holiday", "extended weekend",
        "taking off for diwali", "christmas break", "new year celebration",
        "pongal vacation", "eid celebration",

        # 🚨 Emergency
        "accident in family", "urgent medical help", "house emergency", "sudden illness",
        "flood in area", "fire accident", "road accident", "emergency leave",
        "critical situation", "unexpected issue"
    ],

    "category": [
        # Medical
        "Medical", "Medical", "Medical", "Medical", "Medical",
        "Medical", "Medical", "Medical", "Medical", "Medical",
        "Medical", "Medical", "Medical", "Medical", "Medical",

        # Family
        "Family", "Family", "Family", "Family",
        "Family", "Family", "Family",
        "Family", "Family", "Family",

        # Travel
        "Travel", "Travel", "Travel", "Travel",
        "Travel", "Travel", "Travel", "Travel",
        "Travel", "Travel",

        # Personal
        "Personal", "Personal", "Personal", "Personal",
        "Personal", "Personal", "Personal", "Personal",

        # Academic
        "Academic", "Academic", "Academic", "Academic",
        "Academic", "Academic", "Academic", "Academic",
        "Academic", "Academic",

        # Holiday / Weekend
        "Holiday", "Holiday", "Holiday", "Holiday", "Holiday",
        "Holiday", "Holiday", "Holiday",
        "Holiday", "Holiday",

        # Emergency
        "Emergency", "Emergency", "Emergency", "Emergency",
        "Emergency", "Emergency", "Emergency", "Emergency",
        "Emergency", "Emergency"
    ]
}

# Create DataFrame
df = pd.DataFrame(data)

# ✅ Train model
vectorizer = TfidfVectorizer(stop_words="english")
X = vectorizer.fit_transform(df["reason"])
y = df["category"]

model = LogisticRegression(max_iter=1000)
model.fit(X, y)

# ✅ Save model
joblib.dump((vectorizer, model), "reason_classifier.pkl")
print("✅ Reason classifier trained successfully with extended dataset!")
