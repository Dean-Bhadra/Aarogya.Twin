import React, { useState, useEffect } from 'react';
import { predictAll, featureContributions } from '../utils/mlEngine';
import { ArrowLeft, Beaker, Play, Save, RefreshCw, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WhatIfLab() {
  const navigate = useNavigate();
  
  const [data, setData] = useState({
    age: 58, gender_enc: 1, is_married: 0, race_white: 1, race_black: 0, race_asian: 0, race_hispanic: 0, income: 50000,
    has_diabetes: 0, has_hypertension: 0, has_sleep_disorder: 0, has_stress_anxiety: 0, has_obesity: 0, has_high_cholesterol: 0,
    height_cm: 166, weight_kg: 78, systolic_bp: 130, diastolic_bp: 83, heart_rate: 78,
    spo2: 96, resp_rate: 19, hba1c: 5.6, phq2_score: 2, alcohol_score: 3.5
  });

  const [bmi, setBmi] = useState(28.3);
  const [prob, setProb] = useState(0);
  const [contributions, setContributions] = useState([]);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    const calculatedBmi = Number((data.weight_kg / Math.pow(data.height_cm / 100, 2)).toFixed(1));
    setBmi(calculatedBmi);
    const processed = { ...data, bmi: calculatedBmi };
    
    // Simulate real-time
    const res = predictAll(processed);
    setProb(res.cvd);
    setContributions(featureContributions(processed).slice(0, 10));
  }, [data]);

  const hc = (field, val) => setData(prev => ({ ...prev, [field]: Number(val) }));
  const tog = (field) => setData(prev => ({ ...prev, [field]: prev[field] === 1 ? 0 : 1 }));

  const loadScenario = (updates) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const saveSnapshot = () => {
    setSnapshots(prev => [...prev, { label: `Snap ${prev.length + 1}`, prob, data }]);
  };

  const cvdPct = (prob * 100).toFixed(1);
  const cvdColor = prob < 0.3 ? 'var(--green)' : prob < 0.6 ? 'var(--amber)' : 'var(--red)';

  return (
    <div className="content-wrap" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', padding: '24px', maxWidth: '1400px' }}>
      
      {/* Sidebar Controls */}
      <div className="form-card" style={{ padding: '20px', height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          Intervention Parameters
        </h2>

        <ControlGroup title="Demographics">
          <Slider label="Age" val={data.age} min="28" max="88" onChange={v => hc('age', v)} />
          <Slider label="Income ($)" val={data.income} min="12000" max="200000" step="1000" onChange={v => hc('income', v)} />
        </ControlGroup>

        <ControlGroup title="Conditions">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
          <Slider label="Alcohol Score" val={data.alcohol_score} min="0" max="10" step="0.1" onChange={v => hc('alcohol_score', v)} />
        </ControlGroup>
        
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'var(--s3)', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={() => window.location.reload()}>
          <RefreshCw size={14} /> Reset to Baseline
        </button>
      </div>

      {/* Main View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Beaker color="var(--blue)" /> What-If Simulation Engine
            </h1>
            <p style={{ color: 'var(--muted)' }}>Adjust parameters on the left to see real-time impact on risk.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/assess')} style={{ background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <ArrowLeft size={16} /> Exit Lab
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Gauge */}
          <div className="form-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px', marginBottom: 0 }}>
            <svg width="180" height="110" viewBox="0 0 180 110" style={{ marginBottom: '16px' }}>
              <path d="M 20 100 A 70 70 0 0 1 160 100" fill="none" stroke="#1c2030" strokeWidth="14" strokeLinecap="round" />
              <path d="M 20 100 A 70 70 0 0 1 160 100" fill="none" stroke={cvdColor} strokeWidth="14" strokeLinecap="round" strokeDasharray="220" strokeDashoffset={220 - (prob * 220)} style={{ transition: '0.4s ease-out' }} />
              <line x1="90" y1="100" x2="90" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ transformOrigin: '90px 100px', transform: `rotate(${-90 + prob * 180}deg)`, transition: '0.4s ease-out' }} />
              <circle cx="90" cy="100" r="5" fill="white" />
            </svg>
            <div style={{ fontSize: '42px', fontWeight: '700', fontFamily: 'var(--mono)', color: cvdColor }}>{cvdPct}%</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' }}>Real-Time CVD Probability</div>
          </div>

          {/* Quick Interventions */}
          <div className="form-card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '13px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Quick Clinical Scenarios</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <InterventionBtn label="Treat Blood Pressure" sub="Sys→120, Dia→78" onClick={() => loadScenario({ systolic_bp: 120, diastolic_bp: 78, has_hypertension: 0 })} />
              <InterventionBtn label="Weight Management" sub="Lose 10kg" onClick={() => loadScenario({ weight_kg: Math.max(44, data.weight_kg - 10) })} />
              <InterventionBtn label="Glycaemic Control" sub="HbA1c → 5.5" onClick={() => loadScenario({ hba1c: 5.5 })} />
              <InterventionBtn label="Stress Reduction" sub="PHQ-2 → 0" onClick={() => loadScenario({ phq2_score: 0, has_stress_anxiety: 0 })} />
              <InterventionBtn label="Full Optimization" sub="All vital targets met" onClick={() => loadScenario({ systolic_bp: 118, diastolic_bp: 74, alcohol_score: 0, spo2: 98.5, resp_rate: 14, phq2_score: 0, hba1c: 5.4, weight_kg: Math.max(44, data.weight_kg - 10), has_hypertension: 0, has_stress_anxiety: 0, has_high_cholesterol: 0 })} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Feature Importance */}
          <div className="form-card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '13px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Feature Contributions (Current)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {contributions.map((c, i) => {
                const max = Math.max(...contributions.map(x => Math.abs(x.contrib)));
                const pct = (Math.abs(c.contrib) / max * 100).toFixed(1);
                const color = c.contrib > 0 ? 'var(--red)' : 'var(--green)';
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 40px', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', textAlign: 'right', fontFamily: 'var(--mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                    <div style={{ background: 'var(--s3)', height: '6px', borderRadius: '3px' }}>
                      <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: '3px', transition: '0.3s' }} />
                    </div>
                    <div style={{ fontSize: '10px', color, fontFamily: 'var(--mono)' }}>{c.contrib > 0 ? '+' : ''}{c.contrib.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Snapshots */}
          <div className="form-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', color: 'var(--muted)', textTransform: 'uppercase' }}>Snapshots</h3>
              <button 
                onClick={saveSnapshot}
                style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid var(--blue)', color: 'var(--blue)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <Save size={12} /> Save Current
              </button>
            </div>
            
            {snapshots.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '12px', padding: '32px 0' }}>Save snapshots to compare interventions side-by-side.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {snapshots.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--s3)', borderRadius: '8px' }}>
                    <div style={{ flex: 1, fontSize: '13px', fontWeight: '500' }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '600', color: s.prob < 0.3 ? 'var(--green)' : s.prob < 0.6 ? 'var(--amber)' : 'var(--red)' }}>{(s.prob * 100).toFixed(1)}%</div>
                    <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }} onClick={() => setSnapshots(snapshots.filter((_, idx) => idx !== i))}><XCircle size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function ControlGroup({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: '600', marginBottom: '12px' }}>{title}</div>
      {children}
    </div>
  );
}

function Slider({ label, val, min, max, step = 1, onChange }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: '4px' }}>
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

function InterventionBtn({ label, sub, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '10px', background: 'var(--s3)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', transition: '0.2s', color: 'var(--text)' }}>
      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{sub}</div>
    </button>
  );
}
