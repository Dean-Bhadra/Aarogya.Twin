"""
Run from inside your backend/ folder:
    python check_models.py

Tells you exactly what each pkl contains and whether main.py will handle it.
"""
import os, pickle, traceback
import numpy as np

FILES = [
    ("Models_New/CVD_RIsk/cvd_health_2_model.pkl",                         "model"),
    ("Models_New/Diabetes/model_diabetes_A.pkl",                           "model"),
    ("Models_New/Diabetes/model_diabetes_B.pkl",                           "model"),
    ("Models_New/Diabetes/diabetes_features_A.pkl",                        "features"),
    ("Models_New/Diabetes/diabetes_features_B.pkl",                        "features"),
    ("Models_New/Diabetes/diabetes_medians.pkl",                           "medians"),
    ("Models_New/Diabetes/explainer_diabetes.pkl",                         "explainer"),
    ("Models_New/Hypertension/Hypertension_risk_prediction_new_model.pkl", "model"),
    ("Models_New/Obesity/lstm_model.pkl",                                  "model"),
    ("Models_New/Sleep_Disorder/model_sleep.pkl",                          "model"),
    ("Models_New/Sleep_Disorder/sleep_features.pkl",                       "features"),
    ("Models_New/Sleep_Disorder/sleep_medians.pkl",                        "medians"),
    ("Models_New/Sleep_Disorder/explainer_sleep.pkl",                      "explainer"),
    ("Models_New/Stress_Risk/final_stress_model.pkl",                      "model"),
]

print("=" * 65)
print("  Aarogya Twin — Model Checker")
print("=" * 65)

for fpath, kind in FILES:
    exists = os.path.exists(fpath)
    status = "✅ FOUND" if exists else "❌ MISSING"
    print(f"\n  {status}  {fpath}  [{kind}]")
    if not exists:
        continue
    try:
        with open(fpath, "rb") as f:
            obj = pickle.load(f)
        print(f"         Python type : {type(obj).__name__}")

        if kind == "model":
            print(f"         predict_proba: {'✅' if hasattr(obj,'predict_proba') else '❌ — will use predict() as regressor'}")
            print(f"         feature_imp  : {'✅' if hasattr(obj,'feature_importances_') else '—'}")
            if hasattr(obj, "steps"):
                print(f"         Pipeline steps: {[s[0] for s in obj.steps]}")
            # probe feature count
            for n in [6,7,8,9,10,14,15,20,25]:
                try:
                    obj.predict(np.zeros((1,n)))
                    print(f"         Expects n_features: {n}  ✅")
                    break
                except Exception:
                    continue

        elif kind == "features":
            if isinstance(obj, list):
                print(f"         Feature list ({len(obj)}): {obj}")
            elif hasattr(obj, "tolist"):
                print(f"         Feature array ({len(obj)}): {obj.tolist()}")
            else:
                print(f"         Content: {obj}")

        elif kind == "medians":
            if isinstance(obj, dict):
                print(f"         Medians dict ({len(obj)} keys): {list(obj.keys())[:8]}...")
            elif hasattr(obj, "to_dict"):
                d = obj.to_dict()
                print(f"         Medians Series ({len(d)} keys): {list(d.keys())[:8]}...")
            else:
                print(f"         Content type: {type(obj)}")

        elif kind == "explainer":
            print(f"         Has shap_values method: {'✅' if hasattr(obj,'shap_values') else '❌'}")
            print(f"         Expected features: {getattr(obj,'feature_names',None) or getattr(obj,'data_feature_names',None) or '—'}")

    except Exception as e:
        print(f"         ❌ Load error: {e}")

print("\n" + "=" * 65)
print("  ✅ = good   ❌ = needs attention")
print("  Send the output of this script if anything shows ❌.")
print("=" * 65)
