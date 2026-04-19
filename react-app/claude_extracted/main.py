"""
Aarogya Twin — FastAPI Backend (updated for exact pkl files)
Run: uvicorn main:app --reload --port 8000

Folder structure expected:
backend/
├── main.py
├── CVD_Risk/
│   └── cvd_health_2_model.pkl
├── Diabetes/
│   ├── model_diabetes_A.pkl
│   ├── model_diabetes_B.pkl
│   ├── diabetes_features_A.pkl
│   ├── diabetes_features_B.pkl
│   ├── diabetes_medians.pkl
│   └── explainer_diabetes.pkl
├── Hypertension/
│   └── Hypertension_risk_prediction_new_model.pkl
├── Obesity/
│   └── lstm_model.pkl
├── Sleep_Disorder/
│   ├── model_sleep.pkl
│   ├── sleep_features.pkl
│   ├── sleep_medians.pkl
│   └── explainer_sleep.pkl
└── Stress_Risk/
    └── final_stress_model.pkl
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import numpy as np
import pickle
import os

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

app = FastAPI(
    title="Aarogya Twin API",
    description="AI-powered Digital Health Twin",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE = os.path.dirname(__file__)

# ════════════════════════════════════════════════════════
# LOAD ALL PKL FILES EXACTLY AS THEY EXIST IN YOUR DRIVE
# ════════════════════════════════════════════════════════

def load_pkl(relative_path):
    """Load a pkl file. Returns None if file missing (non-fatal)."""
    full = os.path.join(BASE, relative_path)
    if not os.path.exists(full):
        print(f"  ⚠️  Missing: {relative_path}")
        return None
    try:
        with open(full, "rb") as f:
            obj = pickle.load(f)
        print(f"  ✅ Loaded: {relative_path}  [{type(obj).__name__}]")
        return obj
    except Exception as e:
        print(f"  ❌ Error loading {relative_path}: {e}")
        return None

print("\n── Loading models ──────────────────────────────────")

# CVD
cvd_model       = load_pkl("CVD_Risk/cvd_health_2_model.pkl")

# Diabetes — two sub-models + features + medians + explainer
diabetes_model_A   = load_pkl("Diabetes/model_diabetes_A.pkl")
diabetes_model_B   = load_pkl("Diabetes/model_diabetes_B.pkl")
diabetes_features_A= load_pkl("Diabetes/diabetes_features_A.pkl")   # list of feature names
diabetes_features_B= load_pkl("Diabetes/diabetes_features_B.pkl")
diabetes_medians   = load_pkl("Diabetes/diabetes_medians.pkl")       # dict or Series
explainer_diabetes = load_pkl("Diabetes/explainer_diabetes.pkl")     # pre-built SHAP explainer

# Hypertension
hyp_model       = load_pkl("Hypertension/Hypertension_risk_prediction_new_model.pkl")

# Obesity / Bio-age
obesity_model   = load_pkl("Obesity/lstm_model.pkl")

# Sleep
sleep_model     = load_pkl("Sleep_Disorder/model_sleep.pkl")
sleep_features  = load_pkl("Sleep_Disorder/sleep_features.pkl")      # list of feature names
sleep_medians   = load_pkl("Sleep_Disorder/sleep_medians.pkl")       # dict or Series
explainer_sleep = load_pkl("Sleep_Disorder/explainer_sleep.pkl")     # pre-built SHAP explainer

# Stress
stress_model    = load_pkl("Stress_Risk/final_stress_model.pkl")

print("────────────────────────────────────────────────────\n")

# ════════════════════════════════════════════════════════
# FALLBACK FEATURE LISTS
# Used only if the .pkl feature file didn't load.
# These match the columns used during your training.
# ════════════════════════════════════════════════════════

CVD_FEATURES = [
    "age", "bmi", "systolic_bp", "diastolic_bp", "heart_rate",
    "spo2", "cholesterol", "blood_glucose", "hba1c",
    "smoking", "alcohol", "physical_activity",
    "sleep_hours", "stress_level", "has_diabetes",
]

DIABETES_FEATURES_A_DEFAULT = [
    "age", "bmi", "blood_glucose", "hba1c",
    "systolic_bp", "diastolic_bp",
    "physical_activity", "smoking", "alcohol",
]

DIABETES_FEATURES_B_DEFAULT = [
    "age", "bmi", "blood_glucose", "hba1c",
    "heart_rate", "physical_activity",
    "smoking", "sleep_hours",
]

HYP_FEATURES = [
    "age", "bmi", "systolic_bp", "diastolic_bp",
    "smoking", "physical_activity", "blood_glucose",
    "heart_rate", "alcohol",
]

OBESITY_FEATURES = [
    "age", "bmi", "heart_rate", "spo2",
    "systolic_bp", "diastolic_bp",
    "sleep_hours", "physical_activity",
]

SLEEP_FEATURES_DEFAULT = [
    "age", "bmi", "sleep_hours", "stress_level",
    "physical_activity", "heart_rate",
    "systolic_bp", "occupation_num",
]

STRESS_FEATURES = [
    "age", "bmi", "heart_rate", "spo2",
    "sleep_hours", "physical_activity",
    "systolic_bp", "diastolic_bp",
]

# Resolve actual feature lists (loaded pkl takes priority)
def resolve_features(loaded, default):
    if loaded is not None:
        if isinstance(loaded, list):
            return loaded
        if hasattr(loaded, "tolist"):
            return loaded.tolist()
        if isinstance(loaded, dict):
            return list(loaded.keys())
    return default

FEAT = {
    "cvd":         CVD_FEATURES,
    "diabetes_A":  resolve_features(diabetes_features_A, DIABETES_FEATURES_A_DEFAULT),
    "diabetes_B":  resolve_features(diabetes_features_B, DIABETES_FEATURES_B_DEFAULT),
    "hypertension":HYP_FEATURES,
    "obesity":     OBESITY_FEATURES,
    "sleep":       resolve_features(sleep_features, SLEEP_FEATURES_DEFAULT),
    "stress":      STRESS_FEATURES,
}

# Resolve medians (for imputing missing fields)
def resolve_medians(loaded):
    if loaded is None:
        return {}
    if isinstance(loaded, dict):
        return loaded
    if hasattr(loaded, "to_dict"):      # pandas Series
        return loaded.to_dict()
    return {}

MEDIANS = {
    "diabetes": resolve_medians(diabetes_medians),
    "sleep":    resolve_medians(sleep_medians),
}

# ════════════════════════════════════════════════════════
# INPUT SCHEMA
# All possible fields across all models — all optional
# with sensible clinical defaults.
# ════════════════════════════════════════════════════════

class PatientFeatures(BaseModel):
    age:               float = Field(45,   ge=1,   le=120)
    bmi:               float = Field(25.0, ge=10,  le=70)
    systolic_bp:       float = Field(120,  ge=70,  le=250)
    diastolic_bp:      float = Field(80,   ge=40,  le=150)
    heart_rate:        float = Field(75,   ge=30,  le=220)
    spo2:              float = Field(98.0, ge=50,  le=100)
    cholesterol:       float = Field(200,  ge=50,  le=600)
    blood_glucose:     float = Field(100,  ge=40,  le=600)
    hba1c:             float = Field(5.5,  ge=3,   le=20)
    smoking:           int   = Field(0,    ge=0,   le=1)
    alcohol:           int   = Field(0,    ge=0,   le=1)
    physical_activity: float = Field(3,    ge=0,   le=7)
    sleep_hours:       float = Field(7,    ge=0,   le=24)
    stress_level:      float = Field(3,    ge=1,   le=10)
    has_diabetes:      int   = Field(0,    ge=0,   le=1)
    occupation_num:    int   = Field(1,    ge=0,   le=20)

class SimulationInput(BaseModel):
    patient:      PatientFeatures
    intervention: Dict[str, float]

# ════════════════════════════════════════════════════════
# PREDICTION HELPERS
# ════════════════════════════════════════════════════════

def build_X(patient: PatientFeatures, feature_list: list, medians: dict = {}) -> np.ndarray:
    """Build feature array in correct column order, using medians for missing."""
    data = patient.model_dump()
    row  = []
    for f in feature_list:
        val = data.get(f)
        if val is None:
            val = medians.get(f, 0)
        row.append(float(val))
    return np.array([row])

def safe_predict(model, X):
    """Returns (probability_float, prediction_int). Handles classifiers + regressors."""
    if model is None:
        raise ValueError("Model not loaded")
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X)
        if proba.shape[1] == 2:
            prob = float(proba[0][1])
        else:
            prob = float(proba[0].max())        # multiclass → highest class prob
        pred = int(model.predict(X)[0])
    else:
        # Regressor (lstm_model may be this)
        raw  = float(model.predict(X)[0])
        prob = float(np.clip(raw, 0, 1))
        pred = int(prob >= 0.5)
    return prob, pred

def risk_label(prob: float) -> str:
    if prob >= 0.65: return "High Risk"
    if prob >= 0.35: return "Medium Risk"
    return "Low Risk"

def get_shap_values(model_key, model, explainer_pkl, X, feature_list):
    """
    Use pre-saved explainer pkl if available,
    otherwise build TreeExplainer on the fly.
    Returns list of dicts sorted by importance.
    """
    try:
        # Use pre-built explainer pkl (faster, already fitted)
        if explainer_pkl is not None:
            sv = explainer_pkl.shap_values(X)
        elif SHAP_AVAILABLE:
            exp = shap.TreeExplainer(model)
            sv  = exp.shap_values(X)
        else:
            raise ValueError("SHAP not available")

        if isinstance(sv, list):
            sv = sv[1]          # binary: positive class
        sv = np.array(sv).flatten()

        total = np.abs(sv).sum() or 1
        result = []
        for i in np.argsort(np.abs(sv))[::-1]:
            if i < len(feature_list):
                result.append({
                    "feature":    feature_list[i],
                    "shap_value": round(float(sv[i]), 5),
                    "importance": round(abs(float(sv[i])) / total * 100, 1),
                    "direction":  "increases risk" if sv[i] > 0 else "decreases risk",
                })
        return result

    except Exception:
        # Fallback: use feature_importances_
        try:
            imp   = model.feature_importances_
            total = imp.sum() or 1
            return [
                {
                    "feature":    feature_list[i],
                    "shap_value": None,
                    "importance": round(float(imp[i]) / total * 100, 1),
                    "direction":  "contributes",
                }
                for i in np.argsort(imp)[::-1]
                if i < len(feature_list)
            ]
        except Exception:
            return [{"feature": f, "shap_value": None,
                     "importance": None, "direction": "unknown"}
                    for f in feature_list]

# ════════════════════════════════════════════════════════
# CLINICAL RECOMMENDATIONS
# ════════════════════════════════════════════════════════

def get_recommendations(probs: dict) -> List[str]:
    recs = []
    if probs.get("cvd", 0)          >= 0.65:
        recs.append("⚠️ High CVD risk detected — cardiology referral and ECG recommended.")
    if probs.get("diabetes_A", 0)   >= 0.65:
        recs.append("🩸 HbA1c indicates diabetes — initiate glycaemic management.")
    if probs.get("diabetes_B", 0)   >= 0.65:
        recs.append("🩸 Lifestyle-based diabetes risk elevated — dietary review advised.")
    if probs.get("hypertension", 0) >= 0.65:
        recs.append("💊 Hypertension risk high — BP monitoring and DASH diet advised.")
    if probs.get("obesity", 0)      >= 0.65:
        recs.append("⚖️ Obesity-related risk elevated — structured weight management plan.")
    if probs.get("sleep", 0)        >= 0.50:
        recs.append("😴 Sleep disorder likely — polysomnography study recommended.")
    if probs.get("stress", 0)       >= 0.65:
        recs.append("🧠 Elevated stress/anxiety — mental health assessment advised.")
    if not recs:
        recs.append("✅ No critical risk flags. Maintain current lifestyle habits.")
    return recs

# ════════════════════════════════════════════════════════
# ROUTES
# ════════════════════════════════════════════════════════

@app.get("/")
def root():
    return {
        "service": "Aarogya Twin API v2",
        "models_loaded": {
            "cvd":         cvd_model      is not None,
            "diabetes_A":  diabetes_model_A is not None,
            "diabetes_B":  diabetes_model_B is not None,
            "hypertension":hyp_model      is not None,
            "obesity":     obesity_model  is not None,
            "sleep":       sleep_model    is not None,
            "stress":      stress_model   is not None,
        },
        "shap_available": SHAP_AVAILABLE,
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {
        "cvd":                  "loaded" if cvd_model       else "missing",
        "diabetes_A":           "loaded" if diabetes_model_A else "missing",
        "diabetes_B":           "loaded" if diabetes_model_B else "missing",
        "diabetes_features_A":  "loaded" if diabetes_features_A else "missing",
        "diabetes_features_B":  "loaded" if diabetes_features_B else "missing",
        "diabetes_medians":     "loaded" if diabetes_medians else "missing",
        "explainer_diabetes":   "loaded" if explainer_diabetes else "missing",
        "hypertension":         "loaded" if hyp_model       else "missing",
        "obesity":              "loaded" if obesity_model   else "missing",
        "sleep":                "loaded" if sleep_model     else "missing",
        "sleep_features":       "loaded" if sleep_features  else "missing",
        "sleep_medians":        "loaded" if sleep_medians   else "missing",
        "explainer_sleep":      "loaded" if explainer_sleep else "missing",
        "stress":               "loaded" if stress_model    else "missing",
    }

# ── /predict/all ─────────────────────────────────────────────────────────────
@app.post("/predict/all")
def predict_all(patient: PatientFeatures):
    results = {}
    probs   = {}

    model_map = [
        ("cvd",          cvd_model,        "cvd",         {},
         "CVD / Heart Disease Risk", 0.9914),
        ("diabetes_A",   diabetes_model_A, "diabetes_A",  MEDIANS["diabetes"],
         "Diabetes Risk (HbA1c model)", 0.9837),
        ("diabetes_B",   diabetes_model_B, "diabetes_B",  MEDIANS["diabetes"],
         "Diabetes Risk (Lifestyle model)", 0.9837),
        ("hypertension", hyp_model,        "hypertension",{},
         "Hypertension Risk", 0.9824),
        ("obesity",      obesity_model,    "obesity",     {},
         "Obesity / Bio-Age Risk", 0.8169),
        ("sleep",        sleep_model,      "sleep",       MEDIANS["sleep"],
         "Sleep Disorder Risk", 0.6743),
        ("stress",       stress_model,     "stress",      {},
         "Stress / Anxiety Risk", 0.9084),
    ]

    for key, model, feat_key, medians, label, auc in model_map:
        if model is None:
            results[key] = {"error": "model not loaded", "label": label}
            continue
        try:
            X    = build_X(patient, FEAT[feat_key], medians)
            prob, pred = safe_predict(model, X)
            probs[key] = prob
            results[key] = {
                "label":       label,
                "probability": round(prob * 100, 2),
                "prediction":  pred,
                "risk_level":  risk_label(prob),
                "model_auc":   auc,
            }
        except Exception as e:
            results[key] = {"error": str(e), "label": label}

    return {
        "results":         results,
        "recommendations": get_recommendations(probs),
        "fl_note": (
            "Server: XGBoost/LGB models (AUC 0.97–0.99). "
            "Client: mlEngine.js handles real-time what-if preview "
            "with privacy-first local inference."
        ),
    }

# ── /predict/{model} ─────────────────────────────────────────────────────────
@app.post("/predict/{model_key}")
def predict_single(model_key: str, patient: PatientFeatures):
    model_lookup = {
        "cvd":         (cvd_model,        "cvd",         {},
                        "CVD / Heart Disease Risk", 0.9914),
        "diabetes_A":  (diabetes_model_A, "diabetes_A",  MEDIANS["diabetes"],
                        "Diabetes Risk (HbA1c model)", 0.9837),
        "diabetes_B":  (diabetes_model_B, "diabetes_B",  MEDIANS["diabetes"],
                        "Diabetes Risk (Lifestyle model)", 0.9837),
        "hypertension":(hyp_model,        "hypertension",{},
                        "Hypertension Risk", 0.9824),
        "obesity":     (obesity_model,    "obesity",     {},
                        "Obesity / Bio-Age Risk", 0.8169),
        "sleep":       (sleep_model,      "sleep",       MEDIANS["sleep"],
                        "Sleep Disorder Risk", 0.6743),
        "stress":      (stress_model,     "stress",      {},
                        "Stress / Anxiety Risk", 0.9084),
    }
    if model_key not in model_lookup:
        raise HTTPException(404, f"Unknown model '{model_key}'. Available: {list(model_lookup)}")

    model, feat_key, medians, label, auc = model_lookup[model_key]
    if model is None:
        raise HTTPException(503, f"Model '{model_key}' not loaded — check folder structure.")

    X    = build_X(patient, FEAT[feat_key], medians)
    prob, pred = safe_predict(model, X)

    return {
        "model":       model_key,
        "label":       label,
        "probability": round(prob * 100, 2),
        "prediction":  pred,
        "risk_level":  risk_label(prob),
        "model_auc":   auc,
    }

# ── /explain/{model} — SHAP with pre-saved explainers ────────────────────────
@app.post("/explain/{model_key}")
def explain(model_key: str, patient: PatientFeatures):
    explainer_lookup = {
        "cvd":         (cvd_model,        None,               "cvd",
                        "CVD / Heart Disease Risk"),
        "diabetes_A":  (diabetes_model_A, explainer_diabetes, "diabetes_A",
                        "Diabetes Risk (HbA1c model)"),
        "diabetes_B":  (diabetes_model_B, explainer_diabetes, "diabetes_B",
                        "Diabetes Risk (Lifestyle model)"),
        "hypertension":(hyp_model,        None,               "hypertension",
                        "Hypertension Risk"),
        "obesity":     (obesity_model,    None,               "obesity",
                        "Obesity / Bio-Age Risk"),
        "sleep":       (sleep_model,      explainer_sleep,    "sleep",
                        "Sleep Disorder Risk"),
        "stress":      (stress_model,     None,               "stress",
                        "Stress / Anxiety Risk"),
    }
    if model_key not in explainer_lookup:
        raise HTTPException(404, f"Unknown model: {model_key}")

    model, explainer_pkl, feat_key, label = explainer_lookup[model_key]
    if model is None:
        raise HTTPException(503, f"Model '{model_key}' not loaded.")

    medians = MEDIANS.get("diabetes" if "diabetes" in model_key else
                          "sleep"    if model_key == "sleep"    else "", {})

    X         = build_X(patient, FEAT[feat_key], medians)
    prob, pred= safe_predict(model, X)
    shap_vals = get_shap_values(model_key, model, explainer_pkl, X, FEAT[feat_key])
    top3      = [s["feature"] for s in shap_vals[:3]]

    return {
        "model":        model_key,
        "label":        label,
        "probability":  round(prob * 100, 2),
        "risk_level":   risk_label(prob),
        "top_features": shap_vals[:8],
        "explanation": (
            f"The {label.lower()} prediction of {round(prob*100,1)}% is "
            f"primarily driven by: {', '.join(top3)}."
        ),
        "explainer_source": "pre-saved pkl" if explainer_pkl else "built at runtime",
    }

# ── /simulate — What-If engine ───────────────────────────────────────────────
@app.post("/simulate")
def simulate(data: SimulationInput):
    patient      = data.patient
    intervention = data.intervention

    modified_dict = patient.model_dump()
    modified_dict.update({k: float(v) for k, v in intervention.items()})
    modified = PatientFeatures(**modified_dict)

    keys = ["cvd", "diabetes_A", "hypertension", "sleep", "stress", "obesity"]
    model_map = {
        "cvd":         (cvd_model,        "cvd",         {}),
        "diabetes_A":  (diabetes_model_A, "diabetes_A",  MEDIANS["diabetes"]),
        "hypertension":(hyp_model,        "hypertension",{}),
        "sleep":       (sleep_model,      "sleep",       MEDIANS["sleep"]),
        "stress":      (stress_model,     "stress",      {}),
        "obesity":     (obesity_model,    "obesity",     {}),
    }

    before, after, deltas = {}, {}, {}
    for key in keys:
        model, feat_key, medians = model_map[key]
        if model is None:
            continue
        try:
            pb, _ = safe_predict(model, build_X(patient,  FEAT[feat_key], medians))
            pa, _ = safe_predict(model, build_X(modified, FEAT[feat_key], medians))
            before[key] = {"probability": round(pb * 100, 2), "risk_level": risk_label(pb)}
            after[key]  = {"probability": round(pa * 100, 2), "risk_level": risk_label(pa)}
            deltas[key] = round(pa * 100 - pb * 100, 2)
        except Exception:
            continue

    best = min(deltas, key=lambda k: deltas[k]) if deltas else None
    return {
        "intervention": intervention,
        "before":       before,
        "after":        after,
        "deltas":       deltas,
        "summary": (
            f"Intervention reduces {best} risk by {abs(deltas[best])}%."
            if best and deltas[best] < 0 else
            "Apply the intervention to see risk changes."
        ),
    }
