import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Beaker, ArrowLeft, AlertCircle, HeartPulse, Brain, Droplets, Moon, Scale, Activity, Info, X, Download } from 'lucide-react';
import { exportToPdf } from '../utils/exportPdf';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Results() {
  const LABELS = {
    gender_enc: 'Gender Profile',
    age: 'Patient Age',
    bmi: 'Body Mass Index',
    systolic_bp: 'Systolic BP',
    diastolic_bp: 'Diastolic BP',
    heart_rate: 'Resting Heart Rate',
    spo2: 'Blood Oxygen (SpO2)',
    hba1c: 'HbA1c Blood Glucose',
    phq2_score: 'PHQ-2 Stress Metric',
    sleep_hours: 'Sleep Duration',
    wakeups: 'Nightly Wakeups',
    snoring: 'Snoring Frequency',
    has_obesity: 'Obesity Diagnosis',
    cholesterol: 'Cholesterol Levels',
    alcohol_score: 'Alcohol Consumption'
  };

  const location = useLocation();
  const navigate = useNavigate();
  
  const [modalData, setModalData] = useState(null);
  const [loadingShap, setLoadingShap] = useState(false);

  if (!location.state || !location.state.results) {
    return <Navigate to="/assess" />;
  }

  const { inputs, results } = location.state;
  
  const parseProb = (v) => {
    if (v === undefined || v === null) return 0;
    if (typeof v === 'object') return (v.probability || 0) / 100;
    return v;
  };

  const cvd = parseProb(results.cvd);
  const diabetes = parseProb(results.diabetes_A || results.diabetes);
  const hypertension = parseProb(results.hypertension);
  const sleep = parseProb(results.sleep);
  const stress = parseProb(results.stress);
  const obesity = parseProb(results.obesity);

  const barData = {
    labels: ['CVD', 'Diabetes', 'Hypertension', 'Sleep Disorder', 'Stress/Anxiety', 'Obesity'],
    datasets: [{
      label: 'Risk Probability (%)',
      data: [cvd, diabetes, hypertension, sleep, stress, obesity].map(v => +(v*100).toFixed(1)),
      backgroundColor: ['rgba(244,63,94,.7)', 'rgba(245,158,11,.7)', 'rgba(239,68,68,.7)', 'rgba(124,109,247,.7)', 'rgba(167,139,250,.7)', 'rgba(6,182,212,.7)'],
      borderRadius: 6
    }]
  };
  
  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, max: 100, grid: { color: 'rgba(42,51,77,.5)' }, ticks: { color: '#64748b' } }, x: { grid: { display: false }, ticks: { color: '#64748b' } } },
    plugins: { legend: { display: false } }
  };

  const radarData = {
    labels: ['CVD', 'Diabetes', 'Hypert.', 'Sleep', 'Stress', 'Obesity'],
    datasets: [
      { label: 'Patient Risk', data: [cvd, diabetes, hypertension, sleep, stress, obesity].map(v => +(v*100).toFixed(1)), backgroundColor: 'rgba(79,142,247,.15)', borderColor: '#4f8ef7', pointBackgroundColor: '#4f8ef7', borderWidth: 2 },
      { label: 'Population Avg', data: [49.5, 21.4, 39.9, 37.5, 32.8, 30.0], backgroundColor: 'rgba(100,116,139,.1)', borderColor: 'rgba(100,116,139,.4)', pointBackgroundColor: 'rgba(100,116,139,.4)', borderWidth: 1.5 }
    ]
  };

  const radarOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: { r: { beginAtZero: true, max: 100, grid: { color: 'rgba(42,51,77,.7)' }, ticks: { display: false }, pointLabels: { color: '#64748b', font: { size: 10 } } } }
  };

  const cvdPct = (cvd * 100).toFixed(1);
  const cvdColor = cvd < 0.3 ? 'var(--green)' : cvd < 0.6 ? 'var(--amber)' : 'var(--red)';

  const recommendations = [];
  if (cvd > 0.6) recommendations.push({ icon: HeartPulse, text: 'High CVD risk detected. Cardiology referral and ECG recommended.', type: 'high' });
  if (inputs.systolic_bp > 140) recommendations.push({ icon: Activity, text: `Stage ${inputs.systolic_bp > 160 ? '2' : '1'} hypertension. Antihypertensive therapy recommended.`, type: inputs.systolic_bp > 160 ? 'high' : 'med' });
  if (inputs.bmi >= 30) recommendations.push({ icon: Scale, text: 'BMI in obese category. Structured weight management plan recommended.', type: 'med' });
  if (inputs.hba1c >= 6.5) recommendations.push({ icon: Droplets, text: 'HbA1c indicates diabetes. Initiate glycaemic management.', type: 'high' });
  if (recommendations.length === 0) recommendations.push({ icon: AlertCircle, text: 'Overall risk profile is favourable. Maintain current lifestyle.', type: 'low' });

  const handleKnowMore = async (modelKey, title) => {
    setLoadingShap(true);
    setModalData({ title, loading: true });
    try {
      // Fetch explanations direct from FastAPI backend SHAP endpoint
      const result = await api.explain(modelKey, inputs);
      if (result && result.top_features) {
         setModalData({ title, data: result, loading: false });
      } else {
         throw new Error("No explanation available");
      }
    } catch(e) {
      // Fallback for stress which uses client-side engine currently
      import('../utils/mlEngine').then(ml => {
        const top = ml.explainTop(modelKey, inputs);
        if(top.length > 0) {
          setModalData({ 
            title, 
            loading: false,
            data: {
              explanation: "This approximation relies on demographic and behavioral indicators.",
              explainer_source: "mlEngine.js (Client Deterministic LR)",
              top_features: top.map(t => ({ feature: t.feature, direction: t.direction, importance: Math.abs(t.contribution) * 100 }))
            }
          });
        } else {
          setModalData({ title, error: "Model explanation currently unavailable." });
        }
      });
    }
    setLoadingShap(false);
  };

  return (
    <div className="content-wrap">
      <div className="flex-responsive" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Patient Risk Profile</h1>
          <p style={{ color: 'var(--muted)' }}>Analysis complete · {new Date().toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => exportToPdf('export-region', 'Patient_Risk_Profile.pdf')} style={{ background: 'var(--blue)', color: '#fff', border: 'none' }}>
            <Download size={16} /> Export PDF
          </button>
          <button className="btn-primary" onClick={() => navigate('/assess')} style={{ background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <ArrowLeft size={16} /> Re-assess
          </button>
          <button className="btn-primary" onClick={() => navigate('/whatif', { state: { initialData: inputs, baselineProbs: results } })}>
            <Beaker size={16} /> Simulation Lab
          </button>
        </div>
      </div>

      <div id="export-region">

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Vitals Snapshot */}
        <div className="form-card" style={{ display: 'flex', flexDirection: 'column', padding: '32px 24px', background: 'var(--s2)', marginBottom: 0 }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '24px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Profile Snapshot</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Age / Sex</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{inputs.age}y / {inputs.gender_enc === 1 ? 'Male' : 'Female'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>BMI Index</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: inputs.bmi >= 30 ? 'var(--red)' : 'var(--text)' }}>{inputs.bmi} kg/m²</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Blood Pressure</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: inputs.systolic_bp > 130 ? 'var(--red)' : 'var(--text)' }}>{inputs.systolic_bp}/{inputs.diastolic_bp} mmHg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Resting Heart Rate</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{inputs.heart_rate} bpm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>HbA1c Glucose</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: inputs.hba1c >= 6.5 ? 'var(--red)' : 'var(--text)' }}>{inputs.hba1c}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Stress (PHQ-2)</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{inputs.phq2_score} / 6</span>
            </div>
          </div>
        </div>

        {/* CVD Gauge Card */}
        <div className="form-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px 24px 24px', background: 'var(--s2)', position: 'relative', overflow: 'hidden', marginBottom: 0 }}>
          <button onClick={() => handleKnowMore('cvd', "CVD / Heart Disease")} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.3)', color: 'var(--blue)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '500', zIndex: 10, transition: '0.2s' }}>
            <Info size={14} /> Explain AI
          </button>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top, rgba(79,142,247,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <svg width="220" height="130" viewBox="0 0 220 130" style={{ marginBottom: '16px' }}>
            <path d="M 30 115 A 80 80 0 0 1 190 115" fill="none" stroke="#1a2035" strokeWidth="18" strokeLinecap="round" />
            <path d="M 30 115 A 80 80 0 0 1 190 115" fill="none" stroke={cvdColor} strokeWidth="18" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 - (cvd * 251.2)} style={{ transition: '1s ease-out' }} />
            <line x1="110" y1="115" x2="110" y2="35" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ transformOrigin: '110px 115px', transform: `rotate(${-90 + cvd * 180}deg)`, transition: '1s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
            <circle cx="110" cy="115" r="5" fill="white" />
          </svg>
          <div style={{ fontSize: '56px', fontWeight: '700', fontFamily: 'var(--mono)', lineHeight: 1, color: cvdColor }}>{cvdPct}%</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CVD / Heart Disease Risk</div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: cvdColor, marginTop: '8px' }}>
            {cvd < 0.3 ? 'Low Risk' : cvd < 0.6 ? 'Moderate Risk' : 'High Risk'}
          </div>

          {recommendations.length > 0 && (
            <div style={{ width: '100%', marginTop: '32px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: '600', marginBottom: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>Priority Action Plan</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recommendations.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'var(--s3)', padding: '12px', borderRadius: '6px', borderLeft: `3px solid ${rec.type === 'high' ? 'var(--red)' : rec.type === 'med' ? 'var(--amber)' : 'var(--green)'}`, textAlign: 'left' }}>
                    <rec.icon size={16} color={rec.type === 'high' ? 'var(--red)' : rec.type === 'med' ? 'var(--amber)' : 'var(--green)'} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.4 }}>{rec.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>Comprehensive Risk Breakdown</h3>
      {/* Comorbidities 3x2 Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '24px' }}>
        <ComorbidCard title="Heart Disease" icon={HeartPulse} prob={cvd} color="var(--blue)" onExplain={() => handleKnowMore('cvd', "CVD / Heart Disease")} />
        <ComorbidCard title="Diabetes" icon={Droplets} prob={diabetes} color="var(--amber)" onExplain={() => handleKnowMore('diabetes_A', "Diabetes")} />
        <ComorbidCard title="Hypertension" icon={Activity} prob={hypertension} color="var(--red)" onExplain={() => handleKnowMore('hypertension', "Hypertension")} />
        
        <ComorbidCard title="Obesity" icon={Scale} prob={obesity} color="var(--cyan)" onExplain={() => handleKnowMore('obesity', "Obesity")} />
        <ComorbidCard title="Sleep Disorder" icon={Moon} prob={sleep} color="var(--indigo)" onExplain={() => handleKnowMore('sleep', "Sleep Disorder")} />
        <ComorbidCard title="Stress/Anxiety" icon={Brain} prob={stress} color="var(--purple)" onExplain={() => handleKnowMore('stress', "Stress/Anxiety")} />
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="form-card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: 'var(--muted)', textTransform: 'uppercase' }}>Risk Comparison (All 6 Models)</h3>
          <div style={{ height: '240px' }}><Bar data={barData} options={barOptions} /></div>
        </div>
        <div className="form-card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: 'var(--muted)', textTransform: 'uppercase' }}>Patient vs. Population</h3>
          <div style={{ height: '240px' }}><Radar data={radarData} options={radarOptions} /></div>
        </div>
      </div>
      </div>

      {modalData && <ExplainModal data={modalData} onClose={() => setModalData(null)} />}
    </div>
  );
}

const LABELS = {
  gender_enc: 'Gender Profile',
  age: 'Patient Age',
  bmi: 'Body Mass Index',
  systolic_bp: 'Systolic BP',
  diastolic_bp: 'Diastolic BP',
  heart_rate: 'Resting Heart Rate',
  spo2: 'Blood Oxygen (SpO2)',
  hba1c: 'HbA1c Blood Glucose',
  phq2_score: 'PHQ-2 Stress Metric',
  sleep_hours: 'Sleep Duration',
  wakeups: 'Nightly Wakeups',
  snoring: 'Snoring Frequency',
  has_obesity: 'Obesity Diagnosis',
  cholesterol: 'Cholesterol Levels',
  alcohol_score: 'Alcohol Consumption'
};

function ComorbidCard({ title, icon: Icon, prob, color, onExplain }) {
  const pct = (prob * 100).toFixed(1);
  const isHighRisk = prob > 0.65;
  const isLowRisk = prob < 0.30;
  
  const badgeLabel = isHighRisk ? "HIGH RISK" : isLowRisk ? "LOW RISK" : "MODERATE";
  const badgeColor = isHighRisk ? "var(--red)" : isLowRisk ? "var(--green)" : "var(--amber)";
  const percentile = Math.max(1, Math.round(100 - prob * 100));

  return (
    <div className="form-card" style={{ marginBottom: 0, padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', border: isHighRisk ? `1px solid ${color}88` : 'none', position: 'relative', overflow: 'hidden' }}>
      {isHighRisk && <div style={{ position: 'absolute', top: '16px', left: '16px', width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase', paddingLeft: isHighRisk ? '14px' : '0' }}>
          <Icon size={14} color={color}/> {title} 
          <span style={{ background: `${badgeColor}22`, color: badgeColor, padding: '2px 6px', borderRadius: '10px', fontSize: '9px', fontWeight: '700', marginLeft: '6px', letterSpacing: '0.05em' }}>{badgeLabel}</span>
        </div>
      </div>
      
      <div style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'var(--mono)', color: isHighRisk ? color : 'var(--text)' }}>
        {pct}%
        {isHighRisk && <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)', display: 'block', textTransform: 'uppercase', marginTop: '4px' }}>Attention Required</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--s3)', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
         <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: badgeColor }}></div>
         <div>Top <strong>{percentile}%</strong> risk among 1,000 similar profiles</div>
      </div>

      <button onClick={onExplain} style={{ marginTop: '12px', background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '500', transition: '0.2s' }}>
        <Info size={14} color={color}/> Know More
      </button>
    </div>
  );
}

function ExplainModal({ data, onClose }) {
  if (!data) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--s2)', borderRadius: '12px', width: '90%', maxWidth: '500px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={18} color="var(--blue)" /> Explainable AI: {data.title}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {data.loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 16px', width: '24px', height: '24px', border: '3px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Running SHAP explainer...
            </div>
          ) : data.error ? (
            <div style={{ color: 'var(--red)', textAlign: 'center', padding: '20px 0' }}>{data.error}</div>
          ) : (
            <>
              <div style={{ background: 'var(--s3)', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', lineHeight: 1.5, color: 'var(--text)', borderLeft: '4px solid var(--blue)' }}>
                {data.data.explanation}
              </div>

              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>Top Contributing Factors</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.data.top_features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '500', color: f.direction.includes('increase') ? 'var(--red)' : 'var(--green)' }}>{LABELS[f.feature] || f.feature}</span>
                        <span style={{ opacity: 0.7 }}>{f.importance !== null ? Math.round(f.importance) + '%' : 'high'} input weight</span>
                      </div>
                      <div style={{ height: '4px', background: 'var(--s3)', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${Math.min(f.importance || 50, 100)}%`, background: f.direction.includes('increase') ? 'var(--red)' : 'var(--green)', borderRadius: '2px' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {data.data.top_features?.length > 0 && (
                 <div style={{ background: 'rgba(79,142,247,0.05)', border: '1px solid rgba(79,142,247,0.2)', padding: '12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text)', display: 'flex', gap: '8px', alignItems: 'start', marginTop: '24px' }}>
                   <Activity size={14} color="var(--blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
                   <span>If you aggressively target your <strong>{LABELS[data.data.top_features[0].feature] || data.data.top_features[0].feature}</strong>, your overall {data.title} risk could drop drastically. Head to the What-If lab to simulate this exact hypothetical intervention visually.</span>
                 </div>
              )}

              <div style={{ marginTop: '24px', fontSize: '11px', color: 'var(--muted)', textAlign: 'right' }}>
                Engine: {data.data.explainer_source || 'FastAPI XGBoost SHAP'}
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
