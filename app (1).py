#!/usr/bin/env python3
"""
CardioRisk AI — Backend API
Flask REST API serving 7 ML models for cardiovascular risk prediction.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import xgboost
import json
import os

app = Flask(__name__)
CORS(app)

# ── Model Registry ────────────────────────────────────────────────────────────
BASE = os.path.dirname(__file__)
MODELS_DIR = os.path.join(BASE, "models")
DATA_DIR   = os.path.join(BASE, "data", "processed")

def load(name):
    return joblib.load(os.path.join(MODELS_DIR, name))

print("Loading models...")
try:
    M = {
        "cvd":          load("model_cvd.pkl"),
        "diabetes":     load("model_diabetes.pkl"),
        "hypertension": load("model_hypertension.pkl"),
        "stress":       load("model_stress.pkl"),
        "obesity":      load("model_obesity.pkl"),
        "sleep":        load("model_sleep.pkl"),
        "heart2020":    load("model_heart2020.pkl"),
    }
    SCALER    = load("cvd_scaler.pkl")
    FEATURES  = load("cvd_features.pkl")
    MEDIANS   = load("cvd_raw_medians.pkl")

    with open(os.path.join(MODELS_DIR, "all_models_meta.json")) as f:
        META = json.load(f)
    with open(os.path.join(MODELS_DIR, "heart2020_meta.json")) as f:
        H2020_META = json.load(f)
    print("All models loaded.")
except Exception as e:
    print(f"Warning: Could not load all models: {e}")
    M = {}; SCALER = None; FEATURES = []; MEDIANS = {}; META = {}; H2020_META = {}

CONTINUOUS = ["age","income","height_cm","weight_kg","diastolic_bp",
              "systolic_bp","heart_rate","hba1c","spo2","phq2_score",
              "resp_rate","alcohol_score","bmi"]

SLEEP_FEATURES = ["wakeups","snoring","stress_level_num","age","gender_enc",
                  "bmi","Muscle_Mass","health_score","anomaly_flag","smoker_enc",
                  "alcohol_enc","Skin_Temperature","Calories_Intake","Water_Intake"]

HEART2020_FEATURES = [
    "BMI","Smoking","AlcoholDrinking","Stroke","PhysicalHealth","MentalHealth",
    "DiffWalking","Sex","AgeCategory","PhysicalActivity","GenHealth","SleepTime",
    "Asthma","KidneyDisease","SkinCancer","Diabetic_No",
    "Diabetic_No, borderline diabetes","Diabetic_Yes",
    "Diabetic_Yes (during pregnancy)","Race_American Indian/Alaskan Native",
    "Race_Asian","Race_Black","Race_Hispanic","Race_Other","Race_White"
]


def prepare_cvd_input(data: dict) -> pd.DataFrame:
    """Prepare and scale input for CVD-family models."""
    med = MEDIANS.copy()
    med.update({k: v for k, v in data.items() if k in med})
    bmi_h = med.get("height_cm", 166) / 100
    bmi_w = med.get("weight_kg", 78)
    med["bmi"] = round(bmi_w / (bmi_h ** 2), 2)
    df = pd.DataFrame([med])
    df[CONTINUOUS] = SCALER.transform(df[CONTINUOUS])
    return df


def safe_predict(model, X_df, feature_list):
    X = X_df[feature_list] if feature_list else X_df
    prob = float(model.predict_proba(X)[0][1])
    pred = int(prob >= 0.5)
    return round(prob, 4), pred


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "name": "CardioRisk AI API",
        "version": "2.0",
        "models": list(M.keys()),
        "endpoints": ["/predict/all", "/predict/cvd", "/predict/heart2020",
                      "/predict/sleep", "/health", "/meta"]
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "models_loaded": len(M)})


@app.route("/meta", methods=["GET"])
def meta():
    """Return model metadata, feature lists, and performance stats."""
    return jsonify({
        "cvd_family": META,
        "heart2020": H2020_META,
        "sleep_features": SLEEP_FEATURES,
        "heart2020_features": HEART2020_FEATURES,
    })


@app.route("/predict/all", methods=["POST"])
def predict_all():
    """
    Run all CVD-family models simultaneously.
    Body (JSON):
      age, gender_enc, is_married, race_white, race_black, race_asian,
      race_hispanic, income, has_diabetes, has_hypertension, has_sleep_disorder,
      has_stress_anxiety, has_obesity, has_high_cholesterol, height_cm, weight_kg,
      diastolic_bp, heart_rate, hba1c, spo2, phq2_score, resp_rate, systolic_bp,
      alcohol_score
    """
    data = request.get_json(force=True)
    X = prepare_cvd_input(data)

    results = {}
    for key in ["cvd", "diabetes", "hypertension", "stress", "obesity"]:
        feats = META["models"][key]["features"]
        prob, pred = safe_predict(M[key], X, feats)
        results[key] = {
            "probability": prob,
            "prediction": pred,
            "risk_level": (
                "low" if prob < 0.3 else
                "moderate" if prob < 0.5 else
                "elevated" if prob < 0.7 else "high"
            )
        }

    # Composite burden score
    probs = [v["probability"] for v in results.values()]
    results["composite_burden"] = round(float(np.mean(probs)), 4)
    results["high_risk_count"]  = sum(1 for p in probs if p >= 0.5)

    return jsonify({"status": "ok", "predictions": results, "input_echo": data})


@app.route("/predict/cvd", methods=["POST"])
def predict_cvd():
    data = request.get_json(force=True)
    X = prepare_cvd_input(data)
    feats = META["models"]["cvd"]["features"]
    prob, pred = safe_predict(M["cvd"], X, feats)
    fi = META["models"]["cvd"]["feature_importance"]
    top_drivers = sorted(fi.items(), key=lambda x: -x[1])[:5]
    return jsonify({
        "model": "CVD (GBM)",
        "probability": prob,
        "prediction": pred,
        "risk_level": "low" if prob<0.3 else "moderate" if prob<0.5 else "elevated" if prob<0.7 else "high",
        "top_drivers": [{"feature": f, "importance": round(v, 4)} for f, v in top_drivers],
        "model_auc": 0.9877,
        "model_accuracy": 0.9547
    })


@app.route("/predict/heart2020", methods=["POST"])
def predict_heart2020():
    """
    Predict using the real CDC heart_2020 dataset model.
    Body: all 25 heart2020 features (already normalized 0-1).
    """
    data = request.get_json(force=True)
    row = {f: float(data.get(f, 0.0)) for f in HEART2020_FEATURES}
    X = pd.DataFrame([row])
    prob, pred = safe_predict(M["heart2020"], X, HEART2020_FEATURES)
    fi = H2020_META["feature_importance"]
    top_drivers = sorted(fi.items(), key=lambda x: -x[1])[:5]
    return jsonify({
        "model": "Heart2020 CDC (GBM, n=319,795)",
        "probability": prob,
        "prediction": pred,
        "risk_level": "low" if prob<0.3 else "moderate" if prob<0.5 else "elevated" if prob<0.7 else "high",
        "top_drivers": [{"feature": f, "importance": round(v, 4)} for f, v in top_drivers],
        "model_auc": H2020_META.get("gbm_auc", 0.9876),
        "model_accuracy": H2020_META.get("gbm_acc", 0.9466),
        "dataset_prevalence": "42.5%",
        "n_training": 319795
    })


@app.route("/predict/sleep", methods=["POST"])
def predict_sleep():
    """
    Predict sleep disorder using XGBoost model.
    Body: wakeups, snoring, stress_level_num, age, gender_enc, bmi,
          Muscle_Mass, health_score, anomaly_flag, smoker_enc,
          alcohol_enc, Skin_Temperature, Calories_Intake, Water_Intake
    """
    data = request.get_json(force=True)
    defaults = {
        "wakeups": 2, "snoring": 0, "stress_level_num": 5,
        "age": 35, "gender_enc": 0, "bmi": 25.0,
        "Muscle_Mass": 45.0, "health_score": 7.0, "anomaly_flag": 0,
        "smoker_enc": 0, "alcohol_enc": 0,
        "Skin_Temperature": 36.5, "Calories_Intake": 2000, "Water_Intake": 2.0
    }
    defaults.update({k: float(v) for k, v in data.items() if k in defaults})
    X = pd.DataFrame([defaults])[SLEEP_FEATURES]
    prob, pred = safe_predict(M["sleep"], X, None)
    fi = dict(zip(M["sleep"].feature_names_in_,
                  [float(v) for v in M["sleep"].feature_importances_]))
    top_drivers = sorted(fi.items(), key=lambda x: -x[1])[:5]
    return jsonify({
        "model": "Sleep Disorder (XGBoost)",
        "probability": prob,
        "prediction": pred,
        "risk_level": "low" if prob<0.3 else "moderate" if prob<0.5 else "elevated" if prob<0.7 else "high",
        "top_drivers": [{"feature": f, "importance": round(v, 4)} for f, v in top_drivers],
        "model_type": "XGBClassifier",
        "eval_metric": "auc"
    })


@app.route("/predict/whatif", methods=["POST"])
def predict_whatif():
    """
    What-if simulation: accepts base patient + list of interventions.
    Returns before/after probabilities for all models.
    """
    data = request.get_json(force=True)
    base   = data.get("base", {})
    interv = data.get("interventions", {})

    X_base = prepare_cvd_input(base)
    modified = base.copy(); modified.update(interv)
    X_mod  = prepare_cvd_input(modified)

    out = {}
    for key in ["cvd", "diabetes", "hypertension", "stress", "obesity"]:
        feats = META["models"][key]["features"]
        p_b, _ = safe_predict(M[key], X_base, feats)
        p_m, _ = safe_predict(M[key], X_mod,  feats)
        out[key] = {
            "before": p_b,
            "after": p_m,
            "delta": round(p_m - p_b, 4),
            "delta_pct": round((p_m - p_b) * 100, 2)
        }
    return jsonify({"status": "ok", "whatif": out, "interventions_applied": interv})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
