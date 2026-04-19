/**
 * Aarogya Twin — useAarogyaAPI.js
 * React hook that auto-routes:
 *   Sliders/what-if   → mlEngine.js  (instant, client-side, no network)
 *   Full assessment   → FastAPI       (accurate XGBoost predictions)
 *   SHAP explain      → FastAPI       (/explain)
 *   Simulation submit → FastAPI       (/simulate)
 *
 * DROP-IN for your existing pages — just replace direct mlEngine calls.
 *
 * USAGE:
 *   import useAarogyaAPI from '../utils/useAarogyaAPI'
 *
 *   const { quickPredict, fullPredict, explain, simulate, loading, error } = useAarogyaAPI()
 */

import { useState, useCallback } from "react";
import { predictAll as mlPredictAll, whatIf as mlWhatIf, estimateBioAge } from "./mlEngine.js";
import api from "./api.js";

export default function useAarogyaAPI() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── FAST: client-side LR preview (used by sliders) ──────────────────────
  const quickPredict = useCallback((features) => {
    try {
      const preds  = mlPredictAll(features);
      const bioAge = estimateBioAge(features);
      return { predictions: preds, bioAge, source: "client" };
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, []);

  // ── FAST: client-side what-if (no server, instant delta) ────────────────
  const quickWhatIf = useCallback((features, interventions) => {
    try {
      return mlWhatIf(features, interventions);
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, []);

  // ── ACCURATE: full XGBoost prediction via FastAPI ────────────────────────
  const fullPredict = useCallback(async (features) => {
    setLoading(true);
    setError(null);
    try {
      // Map React UI state to expected backend PatientFeatures schema
      const mappedFeatures = {
        ...features,
        stress_level: features.stress_level || features.phq2_score || 3,
        alcohol: (features.alcohol_score || 0) > 0 ? 1 : 0,
        cholesterol: features.has_high_cholesterol === 1 ? 240 : 180,
        blood_glucose: features.hba1c ? (features.hba1c * 28.7) - 46.7 : 100,
        // The rest are now seamlessly provided by the UI:
        // sleep_hours, physical_activity, wakeups, snoring, stress_level_num
      };

      const serverResult = await api.predictAll(mappedFeatures);
      const clientFast = quickPredict(features);
      
      // Hybrid architecture: start with instant client estimations
      const mergedPredictions = { ...clientFast.predictions };
      const serverPayload = serverResult.results || {};
      
      // Override client estimations with XGBoost where available
      for (const k of Object.keys(serverPayload)) {
        if (!serverPayload[k].error && serverPayload[k].probability !== undefined) {
          mergedPredictions[k] = serverPayload[k]; 
        }
      }

      return { 
        predictions: mergedPredictions, 
        source: "hybrid", 
        recommendations: serverResult.recommendations 
      };
    } catch (e) {
      setError(e.message);
      // Graceful fallback to client-side if API is down
      console.warn("FastAPI unavailable, falling back to mlEngine.js");
      return { ...quickPredict(features), source: "client-fallback" };
    } finally {
      setLoading(false);
    }
  }, [quickPredict]);

  // ── SHAP explanations via FastAPI ────────────────────────────────────────
  const explain = useCallback(async (model, features) => {
    setLoading(true);
    setError(null);
    try {
      return await api.explain(model, features);
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Simulate intervention via FastAPI ────────────────────────────────────
  const simulate = useCallback(async (features, intervention) => {
    setLoading(true);
    setError(null);
    try {
      return await api.simulate(features, intervention);
    } catch (e) {
      setError(e.message);
      // Graceful fallback
      return quickWhatIf(features, intervention);
    } finally {
      setLoading(false);
    }
  }, [quickWhatIf]);

  return { quickPredict, quickWhatIf, fullPredict, explain, simulate, loading, error };
}
