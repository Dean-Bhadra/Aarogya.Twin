import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ArrowLeft, Beaker, Save, RefreshCw, XCircle, Droplets, Activity, Moon, Brain, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const LABELS = {
  gender_enc: 'Gender Profile',
  age: 'Patient Age',
  bmi: 'Body Mass Index',
  systolic_bp: 'Systolic BP',
  diastolic_bp: 'Diastolic BP',
  heart_rate: 'Resting Heart Rate',
  spo2: 'Blood Oxygen',
  hba1c: 'HbA1c Blood Glucose',
  phq2_score: 'PHQ-2 Stress Metric',
  sleep_hours: 'Sleep Duration',
  wakeups: 'Nightly Wakeups',
  snoring: 'Snoring Frequency',
  has_obesity: 'Obesity Diagnosis',
  cholesterol: 'Cholesterol Levels',
  alcohol_score: 'Alcohol Consumption'
};

const DEFAULTS = {
  age: 58, gender_enc: 1, is_married: 0, race_white: 1, race_black: 0, race_asian: 0, race_hispanic: 0, income: 50000,
  has_diabetes: 0, has_hypertension: 0, has_sleep_disorder: 0, has_stress_anxiety: 0, has_obesity: 0, has_high_cholesterol: 0,
  height_cm: 166, weight_kg: 78, systolic_bp: 130, diastolic_bp: 83, heart_rate: 78,
  spo2: 96, resp_rate: 19, hba1c: 5.6, phq2_score: 2, alcohol_score: 3.5,
  sleep_hours: 7.5, wakeups: 1, snoring: 0, physical_activity: 3, stress_level_num: 4
};

export default function WhatIfLab() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const savedInputs = JSON.parse(localStorage.getItem('aarogya_latest_assessment') || 'null');
  const savedResults = JSON.parse(localStorage.getItem('aarogya_latest_results') || 'null');

  const initData = location.state?.initialData || savedInputs || DEFAULTS;
  const baselineRaw = location.state?.baselineProbs || savedResults || {};

  const parseP = (v) => v ? (typeof v === 'object' ? (v.probability||0)/100 : v) : 0.05;
  
  const [data, setData] = useState(initData);
  const [baselineProbs] = useState({
    cvd: parseP(baselineRaw.cvd),
    diabetes_A: parseP(baselineRaw.diabetes_A || baselineRaw.diabetes),
    hypertension: parseP(baselineRaw.hypertension),
    sleep: parseP(baselineRaw.sleep),
    stress: parseP(baselineRaw.stress)
  });

  const [bmi, setBmi] = useState(28.3);
  
  const [serverProbs, setServerProbs] = useState({});
  const [targetModel, setTargetModel] = useState("cvd");
  const [explanation, setExplanation] = useState("");
  const [contributions, setContributions] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    const calculatedBmi = Number((data.weight_kg / Math.pow(data.height_cm / 100, 2)).toFixed(1));
    setBmi(calculatedBmi);
    
    const mapped = { 
        ...data, 
        bmi: calculatedBmi,
        stress_level: data.stress_level_num || data.phq2_score || 3,
        alcohol: (data.alcohol_score || 0) > 0 ? 1 : 0,
        cholesterol: data.has_high_cholesterol === 1 ? 240 : 180,
        blood_glucose: data.hba1c ? (data.hba1c * 28.7) - 46.7 : 100,
    };
    
    setIsCalculating(true);
    
    const timeoutId = setTimeout(async () => {
       try {
         const [resAll, resExplain] = await Promise.all([
           api.predictAll(mapped),
           api.explain(targetModel, mapped)
         ]);
         
         if (resAll && resAll.results) {
           setServerProbs(resAll.results);
         }
         
         if (resExplain && resExplain.top_features) {
            setContributions(resExplain.top_features.map(f => ({ 
              name: f.feature, 
              contrib: f.shap_value, 
              pct: f.importance, 
              direction: f.direction 
            })));
            setExplanation(resExplain.explanation);
         }
       } catch (e) {
          console.error("FastAPI simulation error:", e);
       } finally {
          setIsCalculating(false);
       }
    }, 600);
    
    return () => clearTimeout(timeoutId);
  }, [data, targetModel]);

  const hc = (field, val) => setData(prev => ({ ...prev, [field]: Number(val) }));
  const tog = (field) => setData(prev => ({ ...prev, [field]: prev[field] === 1 ? 0 : 1 }));

  const saveSnapshot = () => {
    const activeProb = serverProbs[targetModel]?.probability || 0;
    setSnapshots(prev => [...prev, { 
      label: `Scenario ${prev.length + 1} (${LABELS[targetModel] || targetModel.toUpperCase()})`, 
      prob: activeProb / 100, 
      modelId: targetModel,
      savedData: { ...data }
    }]);
  };

  const getProb = (dict, key) => dict[key] ? (dict[key].probability/100) : 0;
  
  const cvdProb = getProb(serverProbs, 'cvd');
  const cvdPct = (cvdProb * 100).toFixed(1);
  const cvdColor = cvdProb < 0.3 ? 'var(--green)' : cvdProb < 0.6 ? 'var(--amber)' : 'var(--red)';

  return (
    <div className="content-wrap grid-sidebar" style={{ padding: '24px', maxWidth: '1400px' }}>
      
      <div className="form-card" style={{ padding: '20px', height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          Intervention Parameters
        </h2>

        <ControlGroup title="Demographics">
          <Slider label="Age" val={data.age} min="18" max="88" onChange={v => hc('age', v)} />
        </ControlGroup>

        <ControlGroup title="Conditions">
          <div className="grid-2" style={{ gap: '8px' }}>
            <MiniTog label="Diabetes" checked={data.has_diabetes === 1} onClick={() => tog('has_diabetes')} />
            <MiniTog label="Hypertension" checked={data.has_hypertension === 1} onClick={() => tog('has_hypertension')} />
            <MiniTog label="Sleep Disorder" checked={data.has_sleep_disorder === 1} onClick={() => tog('has_sleep_disorder')} />
            <MiniTog label="Obesity" checked={data.has_obesity === 1} onClick={() => tog('has_obesity')} />
            <MiniTog label="Stress" checked={data.has_stress_anxiety === 1} onClick={() => tog('has_stress_anxiety')} />
            <MiniTog label="High Chol." checked={data.has_high_cholesterol === 1} onClick={() => tog('has_high_cholesterol')} />
          </div>
        </ControlGroup>

        <ControlGroup title="Vitals & Labs">
          <Slider label="Weight (kg)" val={data.weight_kg} min="44" max="140" onChange={v => hc('weight_kg', v)} />
          <div style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'right', marginBottom: '12px' }}>BMI: {bmi}</div>
          
          <Slider label="Systolic BP" val={data.systolic_bp} min="85" max="195" onChange={v => hc('systolic_bp', v)} />
          <Slider label="Diastolic BP" val={data.diastolic_bp} min="45" max="120" onChange={v => hc('diastolic_bp', v)} />
          <Slider label="Heart Rate" val={data.heart_rate} min="42" max="124" onChange={v => hc('heart_rate', v)} />
          <Slider label="SpO2 (%)" val={data.spo2} min="85" max="100" step="0.1" onChange={v => hc('spo2', v)} />
          <Slider label="HbA1c (%)" val={data.hba1c} min="3.5" max="12" step="0.1" onChange={v => hc('hba1c', v)} />
          <Slider label="PHQ-2 Score" val={data.phq2_score} min="0" max="6" onChange={v => hc('phq2_score', v)} />
        </ControlGroup>

        <ControlGroup title="Lifestyle & Behavior">
          <Slider label="Sleep Hours" val={data.sleep_hours} min="3" max="12" step="0.5" onChange={v => hc('sleep_hours', v)} />
          <Slider label="Wakeups" val={data.wakeups} min="0" max="10" onChange={v => hc('wakeups', v)} />
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Snoring Frequency</label>
            <select style={{ width: '100%', padding: '8px', background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '6px' }} value={data.snoring} onChange={e => hc('snoring', e.target.value)}>
              <option value={0}>None / Rare</option>
              <option value={1}>Frequent / Heavy</option>
            </select>
          </div>
          <Slider label="Activity (days/wk)" val={data.physical_activity} min="0" max="7" onChange={v => hc('physical_activity', v)} />
          <Slider label="Stress (1-10)" val={data.stress_level_num} min="1" max="10" onChange={v => hc('stress_level_num', v)} />
        </ControlGroup>
        
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'var(--s3)', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={() => setData(initData)}>
          <RefreshCw size={14} /> Reset to Baseline
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Beaker color="var(--blue)" /> Digital Twin Simulator
            </h1>
            <p style={{ color: 'var(--muted)' }}>Causal Engine adjusting multiple outcome vectors simultaneously.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/assess')} style={{ background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <ArrowLeft size={16} /> Exit Lab
          </button>
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="form-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px', marginBottom: 0, opacity: isCalculating ? 0.6 : 1, transition: '0.3s' }}>
            <svg width="220" height="130" viewBox="0 0 220 130" style={{ marginBottom: '16px' }}>
              <path d="M 30 115 A 80 80 0 0 1 190 115" fill="none" stroke="#1a2035" strokeWidth="18" strokeLinecap="round" />
              <path d="M 30 115 A 80 80 0 0 1 190 115" fill="none" stroke={cvdColor} strokeWidth="18" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 - (cvdProb * 251.2)} style={{ transition: '1s ease-out' }} />
              <line x1="110" y1="115" x2="110" y2="35" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ transformOrigin: '110px 115px', transform: `rotate(${-90 + cvdProb * 180}deg)`, transition: '1s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
              <circle cx="110" cy="115" r="5" fill="white" />
            </svg>
            <div style={{ fontSize: '56px', fontWeight: '700', fontFamily: 'var(--mono)', lineHeight: 1, color: cvdColor }}>{cvdPct}%</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CVD / Heart Disease</div>
            
            <SparkLine baseline={baselineProbs.cvd} projected={cvdProb} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <RiskTile title="CVD" prob={getProb(serverProbs, 'cvd')} modelKey="cvd" active={targetModel==="cvd"} onClick={setTargetModel} color="var(--blue)" icon={Heart} isCalc={isCalculating} cohort={100 - Math.round(getProb(serverProbs, 'cvd')*100)} />
            <RiskTile title="Diabetes" prob={getProb(serverProbs, 'diabetes_A')} modelKey="diabetes_A" active={targetModel==="diabetes_A"} onClick={setTargetModel} color="var(--amber)" icon={Droplets} isCalc={isCalculating} cohort={100 - Math.round(getProb(serverProbs, 'diabetes_A')*100)} />
            <RiskTile title="Hypertension" prob={getProb(serverProbs, 'hypertension')} modelKey="hypertension" active={targetModel==="hypertension"} onClick={setTargetModel} color="var(--red)" icon={Activity} isCalc={isCalculating} cohort={100 - Math.round(getProb(serverProbs, 'hypertension')*100)} />
            <RiskTile title="Sleep Disorder" prob={getProb(serverProbs, 'sleep')} modelKey="sleep" active={targetModel==="sleep"} onClick={setTargetModel} color="var(--indigo)" icon={Moon} isCalc={isCalculating} cohort={100 - Math.round(getProb(serverProbs, 'sleep')*100)} />
            <RiskTile title="Stress/Anx" prob={serverProbs.stress ? getProb(serverProbs, 'stress') : null} modelKey="stress" active={targetModel==="stress"} onClick={setTargetModel} color="var(--purple)" icon={Brain} isCalc={isCalculating} cohort={100 - Math.round(getProb(serverProbs, 'stress')*100)} />
          </div>
        </div>

        <div className="grid-2">
          
          {/* Feature Importance via SHAP */}
          <div className="form-card" style={{ marginBottom: 0, opacity: isCalculating ? 0.6 : 1, transition: '0.3s', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--blue)', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '13px', color: 'var(--muted)', textTransform: 'uppercase' }}>Intervention Vector ({LABELS[targetModel] || targetModel.toUpperCase()})</h3>
              <div style={{ fontSize: '10px', background: 'var(--blue)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>SHAP ENGINE</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {contributions.map((c, i) => {
                const maxPct = Math.max(...contributions.map(x => x.pct || 0), 1);
                const color = c.direction.includes('increases') ? 'var(--red)' : 'var(--green)';
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 50px', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text)', textAlign: 'right', fontWeight: '500' }}>{LABELS[c.name] || c.name}</div>
                    <div style={{ background: 'var(--s3)', height: '6px', borderRadius: '3px' }}>
                      <div style={{ width: `${(c.pct / maxPct) * 100}%`, background: color, height: '100%', borderRadius: '3px', transition: '0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                    </div>
                    <div style={{ fontSize: '11px', color, fontFamily: 'var(--mono)', textAlign: 'right' }}>{c.pct.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>

            {contributions.length > 0 && (
              <div style={{ marginTop: '24px', padding: '16px', background: 'var(--s3)', borderLeft: '3px solid var(--amber)', borderRadius: '6px', fontSize: '12px', lineHeight: '1.6', color: 'var(--text)' }}>
                <strong>Impact Summary:</strong> If you reduce <strong>{LABELS[contributions[0].name] || contributions[0].name}</strong>, your {LABELS[targetModel] || targetModel} risk drops by a weighted portion of {contributions[0].pct.toFixed(0)}%.
              </div>
            )}
          </div>

          {/* Snapshots */}
          <div className="form-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', color: 'var(--muted)', textTransform: 'uppercase' }}>Model Snapshots</h3>
              <button 
                onClick={saveSnapshot}
                style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid var(--blue)', color: 'var(--blue)', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '500' }}
              >
                <Save size={14} /> Save Target State
              </button>
            </div>
            
            {snapshots.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '12px', padding: '32px 0' }}>Save snapshots to compare interventions vs baseline during presentation.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {snapshots.map((s, i) => {
                  const baseP = baselineProbs[s.modelId] || 0;
                  const diff = (s.prob - baseP) * 100;
                  const sign = diff > 0 ? '+' : '';
                  const diffColor = diff > 0 ? 'var(--red)' : diff < 0 ? 'var(--green)' : 'var(--muted)';
                  
                  return (
                    <div key={i} onClick={() => s.savedData && setData(s.savedData)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', transition: '0.2s', position: 'relative' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--blue)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <div style={{ flex: 1, fontSize: '12px', fontWeight: '500' }}>{s.label}</div>
                      
                      {/* Delta Chip */}
                      <div style={{ padding: '2px 6px', background: `${diffColor}22`, color: diffColor, borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                        {sign}{diff.toFixed(1)}%
                      </div>

                      <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '600', color: s.prob < 0.3 ? 'var(--green)' : s.prob < 0.6 ? 'var(--amber)' : 'var(--red)' }}>{(s.prob * 100).toFixed(1)}%</div>
                      <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '4px' }} onClick={(e) => { e.stopPropagation(); setSnapshots(snapshots.filter((_, idx) => idx !== i)); }}><XCircle size={14} /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ---------------------- Helper Components ------------------------

function SparkLine({ baseline, projected }) {
  const startY = 40 - (baseline * 40); 
  const endY = 40 - (projected * 40);
  const path = `M 6 ${startY} C 40 ${startY}, 60 ${endY}, 94 ${endY}`;
  const isBetter = projected < baseline;
  
  return (
    <div style={{ padding: '16px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: '8px', marginTop: '24px', width: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>
         <span>Baseline</span>
         <span>Risk Trajectory</span>
         <span style={{ color: isBetter ? 'var(--green)' : 'var(--red)' }}>6mo Forecast</span>
      </div>
      <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
         <line x1="6" y1={startY} x2="94" y2={startY} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
         <path d={path} fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" />
         <circle cx="6" cy={startY} r="3" fill="var(--muted)" />
         <circle cx="94" cy={endY} r="4" fill={isBetter ? 'var(--green)' : 'var(--red)'} />
      </svg>
    </div>
  );
}

function RiskTile({ title, prob, modelKey, active, onClick, color, icon: Icon, isCalc, cohort }) {
  if (prob === undefined || prob === null) return null;
  const isHigh = prob > 0.65;
  const pCohort = Math.max(1, cohort || 50);

  return (
    <div 
      onClick={() => onClick(modelKey)} 
      style={{ 
        padding: '16px', 
        background: active ? 'rgba(255,255,255,0.05)' : 'var(--s2)', 
        border: `1px solid ${isHigh ? 'var(--red)' : active ? color : 'var(--border)'}`, 
        borderRadius: '8px', 
        cursor: 'pointer', 
        transition: '0.2s', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        opacity: isCalc && active ? 0.6 : 1,
        boxShadow: isHigh ? '0 0 15px rgba(239, 68, 68, 0.1)' : 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isHigh && <div style={{ position: 'absolute', top: '12px', right: '12px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 8px var(--red)' }} />}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: active ? 'white' : 'var(--muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
        <Icon size={14} color={isHigh ? 'var(--red)' : color}/> {title}
      </div>
      <div style={{ fontSize: '26px', fontWeight: '700', fontFamily: 'var(--mono)', color: isHigh ? 'var(--red)' : color }}>
        {(prob*100).toFixed(1)}%
      </div>
      <div style={{ fontSize: '9px', background: 'var(--s3)', alignSelf: 'flex-start', padding: '2px 6px', borderRadius: '4px', color: 'var(--muted)' }}>
        Top {pCohort}% Risk Profiling
      </div>
    </div>
  );
}

function ControlGroup({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
      {children}
    </div>
  );
}

function Slider({ label, val, min, max, step = 1, onChange }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: '4px' }}>
        {label} <span style={{ float: 'right', color: 'var(--text)' }}>{val}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={val} onChange={e => onChange(e.target.value)} style={{ width: '100%', accentColor: 'var(--blue)' }} />
    </div>
  );
}

function MiniTog({ label, checked, onClick }) {
  return (
    <div onClick={onClick} style={{ padding: '6px 8px', background: checked ? 'rgba(79,142,247,0.1)' : 'var(--s3)', border: `1px solid ${checked ? 'var(--blue)' : 'var(--border)'}`, borderRadius: '6px', fontSize: '10px', fontFamily: 'var(--mono)', color: checked ? 'var(--text)' : 'var(--muted)', cursor: 'pointer', textAlign: 'center', userSelect: 'none' }}>
      {label}
    </div>
  );
}
