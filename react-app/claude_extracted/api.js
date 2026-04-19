/**
 * Aarogya Twin — api.js
 * Central API client for your React pages.
 * 
 * USAGE in any React page:
 *   import api from '../utils/api.js'
 *   const result = await api.predictAll(patientData)
 *   const shap   = await api.explain('cvd', patientData)
 *   const sim    = await api.simulate(patientData, { bmi: 22, smoking: 0 })
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Helper ───────────────────────────────────────────────────────────────────
async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── API surface ──────────────────────────────────────────────────────────────
const api = {
  // GET /health — check if backend is running
  health: () => get("/health"),

  // GET /models — list all models and their status
  models: () => get("/models"),

  // POST /predict/all — all 6 models in one call
  // patientData: { age, bmi, systolic_bp, ... }
  predictAll: (patientData) => post("/predict/all", patientData),

  // POST /predict/{model} — single model
  // model: "cvd" | "diabetes" | "hypertension" | "stress" | "sleep" | "lstm"
  predict: (model, patientData) => post(`/predict/${model}`, patientData),

  // POST /explain/{model} — SHAP attributions
  explain: (model, patientData) => post(`/explain/${model}`, patientData),

  // POST /simulate — What-If scenario
  // intervention: { bmi: 22.5, smoking: 0, physical_activity: 5 }
  simulate: (patientData, intervention) =>
    post("/simulate", { patient: patientData, intervention }),
};

export default api;
