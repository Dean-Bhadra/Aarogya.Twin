# Exact folder structure for your backend/

Copy your Drive folders as-is next to main.py:

```
backend/
│
├── main.py                   ← FastAPI app (this file)
├── requirements.txt
├── check_models.py           ← run this first to verify all pkls load
│
├── CVD_Risk/
│   └── cvd_health_2_model.pkl
│
├── Diabetes/
│   ├── model_diabetes_A.pkl
│   ├── model_diabetes_B.pkl
│   ├── diabetes_features_A.pkl
│   ├── diabetes_features_B.pkl
│   ├── diabetes_medians.pkl
│   └── explainer_diabetes.pkl
│
├── Hypertension/
│   └── Hypertension_risk_prediction_new_model.pkl
│
├── Obesity/
│   └── lstm_model.pkl
│
├── Sleep_Disorder/
│   ├── model_sleep.pkl
│   ├── sleep_features.pkl
│   ├── sleep_medians.pkl
│   └── explainer_sleep.pkl
│
└── Stress_Risk/
    └── final_stress_model.pkl
```

# Steps to run

1. Download the 6 Drive folders into backend/ keeping folder names
2. pip install -r requirements.txt
3. python check_models.py        ← verify everything loads correctly
4. uvicorn main:app --reload --port 8000
5. Open http://localhost:8000/docs to test all endpoints live

# React-side

Copy into react-app/src/utils/:
- mlEngine.js      (replaces existing)
- api.js           (new)
- useAarogyaAPI.js (new)

Add react-app/.env:
VITE_API_URL=http://localhost:8000
