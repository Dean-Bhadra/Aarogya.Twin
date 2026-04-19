# Aarogya Twin | Null Pointers

🚀 **Live Demo:** : [Aarogya.Twin](https://aarogya-twin.vercel.app/?test)

**Aarogya Twin** is a premium, serverless clinical decision support system built entirely during our Hackathon by **Team Null Pointers**. 

Traditional risk assessment tools are often fragmented, highly technical, and rely on heavy backend architecture. Aarogya Twin bridges this gap through a standalone, privacy-first **Digital Twin** strategy. It utilizes 6 concurrent Machine Learning models operating entirely client-side using pre-calculated weights to predict physiological cardiovascular risks with high clinical accuracy.

> **Hackathon Project** · Multi-model ML system for real-time cardiovascular disease risk prediction, comorbidity screening, and what-if clinical simulation.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)](https://vitejs.dev)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![XGBoost](https://img.shields.io/badge/XGBoost-ML%20Model-green)](https://xgboost.readthedocs.io)
[![Digital Twin](https://img.shields.io/badge/Digital%20Twin-Health%20Model-blueviolet)]()
[![Simulation](https://img.shields.io/badge/What--If-Simulation-orange)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
---

## 🤖 Models Overview

| Model | Algorithm | Target | Dataset | Accuracy | AUC-ROC | Key Feature |
|-------|-----------|--------|---------|----------|---------|-------------|
| **CVD Risk** | GBM | `has_cvd` | cvd_health_7500 | 95.47% | 0.9877 | SpO₂, Resp Rate |
| **Diabetes** | GBM | `has_diabetes` | cvd_health_7500 | 95.30% | 0.9856 | HbA1c |
| **Hypertension** | GBM | `has_hypertension` | cvd_health_7500 | 91.80% | 0.9747 | Systolic BP |
| **Stress/Anxiety** | GBM | `has_stress_anxiety` | cvd_health_7500 | 87.00% | 0.9033 | PHQ-2 Score |
| **Obesity** | GBM | `has_obesity` | cvd_health_7500 | 78.50% | 0.8169 | Weight, BMI |
| **Sleep Disorder** | XGBoost | `sleep_disorder` | sleep_health_data | 94.7% | 0.988 | Stress Level, Wakeups |
| **Heart2020 CVD** | GBM | `HeartDisease` | CDC BRFSS 2020 | 94.66% | 0.9876 | BMI, Physical Health |

---

## 📊 Datasets

### 1. `cvd_health_7500` (Synthetic Clinical Dataset)
- **7,500 patients × 27 features**
- **CVD prevalence: 49.5%** (balanced for training)
- Features: demographics, vitals (BP, HR, SpO₂, resp rate), labs (HbA1c, BMI), comorbidity flags
- Schema aligns with CDC BRFSS + Framingham Heart Study formats

### 2. `heart_2020_rebalanced` (CDC BRFSS 2020)
- **319,795 patients × 26 features**
- **CVD prevalence: 42.5%** (rebalanced)
- Source: [CDC Behavioral Risk Factor Surveillance System](https://www.kaggle.com/datasets/kamilpytlak/personal-key-indicators-of-heart-disease)
- All features pre-normalized to [0,1]

### 3. Sleep Health Dataset (XGBoost Model)
- Features: wakeups, snoring, stress_level_num, age, gender, BMI, health_score, etc.
- 14 features · XGBClassifier (n_estimators=300, eval_metric=auc)

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info + endpoint list |
| GET | `/health` | Health check + models loaded count |
| GET | `/meta` | Full model metadata, feature lists, AUC scores |
| POST | `/predict/all` | Run all 5 CVD-family models simultaneously |
| POST | `/predict/cvd` | CVD risk only + feature importance |
| POST | `/predict/heart2020` | CDC Heart 2020 model prediction |
| POST | `/predict/sleep` | Sleep disorder risk (XGBoost) |
| POST | `/predict/whatif` | Before/after simulation with interventions |

---

## 🏗️ System Architecture — AarogyaTwin

```
Browser (Client) ─────────────────────────────────────────────────────────────
│  React + Vite Frontend                                                      │
│  ┌─ Pages ───────────────────────────────────────────────────────────────┐  │
│  │ Landing · Assessment · Dashboard · Results · WhatIfLab · Login        │  │
│  │ DoctorDashboard · PatientDashboard · Workflow · About · Pricing       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│
│  ┌─ Core Features ───────────────────────────────────────────────────────┐  │
│  │ • Health Assessment Form (user inputs)                               │  │
│  │ • Results Dashboard (charts, risk scores, insights)                  │  │
│  │ • What-If Simulation Lab (real-time sliders)                         │  │
│  │ • Role-based Dashboards (Doctor / Patient)                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│
│  ┌─ Frontend Logic ──────────────────────────────────────────────────────┐  │
│  │ • mlEngine.js (in-browser simulation)                                │  │
│  │ • Instant predictions (fast UI feedback)                             │  │
│  │ • Chart rendering (graphs, comparisons)                              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────
                │
                │ REST API Calls (JSON)
                │ POST /predict | /whatif | /sleep
                ▼
Backend (FastAPI) ────────────────────────────────────────────────────────────
│  FastAPI Server                                                           │
│
│  ┌─ API Endpoints ───────────────────────────────────────────────────────┐ │
│  │ /predict/all        → Multi-risk prediction                           │ │
│  │ /predict/cvd        → Cardiovascular risk                             │ │
│  │ /predict/sleep      → Sleep disorder prediction                       │ │
│  │ /predict/whatif     → Intervention simulation                         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│
│  ┌─ Backend Logic ───────────────────────────────────────────────────────┐ │
│  │ • Input validation (Pydantic)                                         │ │
│  │ • Feature preprocessing (scaling, encoding)                           │ │
│  │ • Model inference                                                     │ │
│  │ • Response formatting (JSON output)                                   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────
                │
                ▼
ML Layer ─────────────────────────────────────────────────────────────────────
│
│  ┌─ Models ──────────────────────────────────────────────────────────────┐ │
│  │ • XGBoost → CVD Risk Prediction                                      │ │
│  │ • XGBoost → Sleep Disorder Prediction                                │ │
│  │ • Additional ML Models (extensible)                                  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│
│  ┌─ Preprocessing ───────────────────────────────────────────────────────┐ │
│  │ • MinMaxScaler / StandardScaler                                      │ │
│  │ • Feature selection                                                  │ │
│  │ • Metadata (feature importance, configs)                             │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────
                │
                ▼
Deployment ───────────────────────────────────────────────────────────────────
│
│  • Frontend → Vercel (React App)                                          │
│  • Backend → Render / Railway (FastAPI API)                               │
│  • Communication → HTTPS (REST APIs)                                      │
│
└────────────────────────────────────────────────────────────────────────────
```

---

## 🔥 Flow Summary

1. User enters health data in **Assessment Page**
2. Frontend:
   * Shows instant result using **mlEngine.js (simulation)**
   * Sends request to backend for **accurate prediction**
3. FastAPI:
   * Processes input
   * Runs **XGBoost models**
   * Returns risk scores
4. Frontend:
   * Displays **charts, insights, recommendations**
5. What-If Lab:
   * Simulates lifestyle changes
   * Compares before vs after predictions


## 👥 Powered by Team Null Pointers

* **Ayan Banerjee**
* **Debanjan Bhadra** 
* **Anurag Ghosh**
* **Debmalya Gupta** 
* **Zainab Rahman**

---

## ⚠️ Disclaimer

This tool is built for a Hackathon and is **for educational and research purposes only**. It is **not** a medical device and must **not** be used for actual clinical diagnosis or treatment decisions. Always consult a qualified healthcare professional.

---

## 🏁 Team & License

MIT License · Built with ❤️ by Team Null Pointers · 2026
