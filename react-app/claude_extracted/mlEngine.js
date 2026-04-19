/**
 * Aarogya Twin — mlEngine.js  (client-side, browser inference)
 *
 * Matches your exact 6 risk models:
 *   CVD, Diabetes (A+B), Hypertension, Obesity, Sleep, Stress
 *
 * REPLACE your existing src/utils/mlEngine.js with this file.
 * All existing function signatures are preserved.
 */

// ── Lightweight LR coefficients (fast browser approximation) ────────────────
// Used ONLY for slider/what-if real-time preview.
// Full XGBoost predictions always come from FastAPI (/predict/all).

const LR_MODELS = {
  cvd: {
    label:     "CVD / Heart Disease",
    intercept: -4.2,
    coef: {
      age: 0.045, bmi: 0.038, systolic_bp: 0.022, diastolic_bp: 0.015,
      heart_rate: 0.008, spo2: -0.12, cholesterol: 0.009,
      blood_glucose: 0.007, hba1c: 0.18, smoking: 0.55,
      alcohol: 0.18, physical_activity: -0.14,
      sleep_hours: -0.06, stress_level: 0.09, has_diabetes: 0.62,
    },
  },
  diabetes_A: {
    label:     "Diabetes (HbA1c model)",
    intercept: -5.1,
    coef: {
      age: 0.028, bmi: 0.062, blood_glucose: 0.021, hba1c: 0.44,
      systolic_bp: 0.011, diastolic_bp: 0.008,
      physical_activity: -0.17, smoking: 0.22, alcohol: 0.14,
    },
  },
  diabetes_B: {
    label:     "Diabetes (Lifestyle model)",
    intercept: -4.8,
    coef: {
      age: 0.031, bmi: 0.058, blood_glucose: 0.018, hba1c: 0.38,
      heart_rate: 0.009, physical_activity: -0.20,
      smoking: 0.28, sleep_hours: -0.07,
    },
  },
  hypertension: {
    label:     "Hypertension",
    intercept: -3.8,
    coef: {
      age: 0.038, bmi: 0.055, systolic_bp: 0.031, diastolic_bp: 0.028,
      smoking: 0.42, physical_activity: -0.19,
      blood_glucose: 0.006, heart_rate: 0.012, alcohol: 0.21,
    },
  },
  obesity: {
    label:     "Obesity / Bio-Age Risk",
    intercept: -2.6,
    coef: {
      age: 0.018, bmi: 0.095, heart_rate: 0.022, spo2: -0.07,
      systolic_bp: 0.011, diastolic_bp: 0.008,
      sleep_hours: -0.12, physical_activity: -0.28,
    },
  },
  sleep: {
    label:     "Sleep Disorder",
    intercept: -2.1,
    coef: {
      age: 0.022, bmi: 0.041, sleep_hours: -0.31, stress_level: 0.28,
      physical_activity: -0.16, heart_rate: 0.018,
      systolic_bp: 0.012, occupation_num: 0.08,
    },
  },
  stress: {
    label:     "Stress / Anxiety",
    intercept: -2.9,
    coef: {
      age: 0.012, bmi: 0.028, heart_rate: 0.031, spo2: -0.08,
      sleep_hours: -0.22, physical_activity: -0.25,
      systolic_bp: 0.014, diastolic_bp: 0.009,
    },
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

function predictOne(modelKey, features) {
  const m = LR_MODELS[modelKey];
  if (!m) return null;
  let logit = m.intercept;
  for (const [feat, coef] of Object.entries(m.coef)) {
    logit += (features[feat] ?? 0) * coef;
  }
  const prob = sigmoid(logit);
  return {
    model:       modelKey,
    label:       m.label,
    probability: Math.round(prob * 1000) / 10,
    risk_level:  prob >= 0.65 ? "High Risk" : prob >= 0.35 ? "Medium Risk" : "Low Risk",
    source:      "client-side",
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Predict all 7 models instantly in the browser */
export function predictAll(features) {
  return Object.fromEntries(
    Object.keys(LR_MODELS).map((k) => [k, predictOne(k, features)])
  );
}

/** Top N feature contributions for a given model (pseudo-SHAP from LR coef) */
export function explainTop(modelKey, features, topN = 5) {
  const m = LR_MODELS[modelKey];
  if (!m) return [];
  return Object.entries(m.coef)
    .map(([feat, coef]) => ({
      feature:      feat,
      value:        features[feat] ?? 0,
      contribution: coef * (features[feat] ?? 0),
      direction:    coef > 0 ? "increases risk" : "decreases risk",
    }))
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, topN);
}

/** What-If: returns { before, after, deltas } for all models */
export function whatIf(baseFeatures, interventions) {
  const modified = { ...baseFeatures, ...interventions };
  const before   = predictAll(baseFeatures);
  const after    = predictAll(modified);
  const deltas   = Object.fromEntries(
    Object.keys(LR_MODELS).map((k) => [k, {
      delta:       Math.round((after[k].probability - before[k].probability) * 10) / 10,
      before_risk: before[k].risk_level,
      after_risk:  after[k].risk_level,
    }])
  );
  return { before, after, deltas, interventions };
}

/** Biological age estimate (runs fully client-side) */
export function estimateBioAge(features) {
  const {
    age = 45, bmi = 25, systolic_bp = 120, heart_rate = 75,
    spo2 = 98, smoking = 0, physical_activity = 3,
    sleep_hours = 7, stress_level = 5,
  } = features;
  const delta =
    (bmi - 22)            *  0.5 +
    (systolic_bp - 115)   *  0.1 +
    (heart_rate - 70)     *  0.2 +
    (98 - spo2)           *  2.0 +
    smoking               *  5.0 +
    (3 - physical_activity) * 1.2 +
    (7 - sleep_hours)     *  0.8 +
    (stress_level - 3)    *  0.6;
  const bioAge = Math.max(18, Math.round(age + delta));
  return {
    chronological_age: age,
    biological_age:    bioAge,
    delta:             bioAge - age,
    label: bioAge > age
      ? `${bioAge - age}y older than chronological`
      : bioAge < age
      ? `${age - bioAge}y younger than chronological`
      : "Biological age matches chronological age",
  };
}

export { LR_MODELS };
