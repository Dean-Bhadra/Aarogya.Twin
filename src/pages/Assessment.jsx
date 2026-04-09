import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictAll } from '../utils/mlEngine';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Assessment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState({
    age: 58, gender_enc: 1, is_married: 0, race: 'white', income: 50000,
    has_diabetes: 0, has_hypertension: 0, has_sleep_disorder: 0, has_stress_anxiety: 0, has_obesity: 0, has_high_cholesterol: 0,
    height_cm: 166, weight_kg: 78, systolic_bp: 130, diastolic_bp: 83, heart_rate: 78,
    spo2: 96.3, resp_rate: 19, hba1c: 5.6, phq2_score: 2, alcohol_score: 3.5
  });

  // Derived
  const bmi = (data.weight_kg / Math.pow(data.height_cm / 100, 2)).toFixed(1);

  const hc = (field, val) => setData(prev => ({...prev, [field]: val}));
  const hcn = (field, val) => hc(field, Number(val));
  const tog = (field) => hc(field, data[field] === 1 ? 0 : 1);

  const onSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      // transform race to onehot
      const processed = {
        ...data,
        race_white: data.race === 'white' ? 1 : 0,
        race_black: data.race === 'black' ? 1 : 0,
        race_asian: data.race === 'asian' ? 1 : 0,
        race_hispanic: data.race === 'hispanic' ? 1 : 0,
        bmi: Number(bmi)
      };
      
      const results = predictAll(processed);
      navigate('/results', { state: { inputs: processed, results } });
    }, 600);
  };

  return (
    <div className="content-wrap">
      <div style={{maxWidth: '1000px', margin: '0 auto'}}>
        <h1 style={{fontSize: '28px', marginBottom: '8px'}}>Patient Assessment Form</h1>
        <p style={{color: 'var(--muted)', marginBottom: '32px'}}>Enter patient vitals and clinical data. All 6 models run simultaneously on submission.</p>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px'}}>
          
          {/* Demographics */}
          <div className="form-card">
            <h3 style={{fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Demographics</h3>
            <div className="form-group">
              <label>Age <span style={{float: 'right', color: 'var(--blue)'}}>{data.age}</span></label>
              <input type="range" min="28" max="88" value={data.age} onChange={e => hcn('age', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Biological Sex</label>
              <select value={data.gender_enc} onChange={e => hcn('gender_enc', e.target.value)}>
                <option value={0}>Female</option>
                <option value={1}>Male</option>
              </select>
            </div>
            <div className="form-group">
              <label>Marital Status</label>
              <select value={data.is_married} onChange={e => hcn('is_married', e.target.value)}>
                <option value={0}>Single / Other</option>
                <option value={1}>Married</option>
              </select>
            </div>
            <div className="form-group">
              <label>Race / Ethnicity</label>
              <select value={data.race} onChange={e => hc('race', e.target.value)}>
                <option value="white">White</option>
                <option value="black">Black / African American</option>
                <option value="asian">Asian</option>
                <option value="hispanic">Hispanic / Latino</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Annual Income ($) <span style={{float: 'right', color: 'var(--blue)'}}>{data.income.toLocaleString()}</span></label>
              <input type="range" min="12000" max="200000" step="1000" value={data.income} onChange={e => hcn('income', e.target.value)} />
            </div>
          </div>

          {/* Vitals */}
          <div className="form-card">
            <h3 style={{fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Vital Signs</h3>
            <div className="form-group">
              <label>Height (cm) <span style={{float: 'right', color: 'var(--blue)'}}>{data.height_cm}</span></label>
              <input type="range" min="140" max="205" value={data.height_cm} onChange={e => hcn('height_cm', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Weight (kg) <span style={{float: 'right', color: 'var(--blue)'}}>{data.weight_kg}</span></label>
              <input type="range" min="44" max="140" value={data.weight_kg} onChange={e => hcn('weight_kg', e.target.value)} />
            </div>
            <div className="form-group">
              <label>BMI</label>
              <div style={{padding: '12px', background: 'var(--s3)', borderRadius: '8px', fontFamily: 'var(--mono)', fontSize: '14px'}}>{bmi}</div>
            </div>
            <div className="form-group">
              <label>Systolic BP <span style={{float: 'right', color: 'var(--blue)'}}>{data.systolic_bp}</span></label>
              <input type="range" min="85" max="195" value={data.systolic_bp} onChange={e => hcn('systolic_bp', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Diastolic BP <span style={{float: 'right', color: 'var(--blue)'}}>{data.diastolic_bp}</span></label>
              <input type="range" min="45" max="120" value={data.diastolic_bp} onChange={e => hcn('diastolic_bp', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Heart Rate <span style={{float: 'right', color: 'var(--blue)'}}>{data.heart_rate}</span></label>
              <input type="range" min="42" max="124" value={data.heart_rate} onChange={e => hcn('heart_rate', e.target.value)} />
            </div>
          </div>

          {/* Labs & Comorbidities */}
          <div className="form-card">
            <h3 style={{fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Labs & Comorbidities</h3>
            <div className="form-group">
              <label>SpO₂ (%) <span style={{float: 'right', color: 'var(--blue)'}}>{data.spo2}</span></label>
              <input type="range" min="85" max="100" step="0.1" value={data.spo2} onChange={e => hcn('spo2', e.target.value)} />
            </div>
            <div className="form-group">
              <label>HbA1c (%) <span style={{float: 'right', color: 'var(--blue)'}}>{data.hba1c}</span></label>
              <input type="range" min="3.5" max="12" step="0.1" value={data.hba1c} onChange={e => hcn('hba1c', e.target.value)} />
            </div>
            
            <div style={{marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <Toggle label="Type 2 Diabetes" checked={data.has_diabetes === 1} onChange={() => tog('has_diabetes')} />
              <Toggle label="Hypertension" checked={data.has_hypertension === 1} onChange={() => tog('has_hypertension')} />
              <Toggle label="Sleep Disorder" checked={data.has_sleep_disorder === 1} onChange={() => tog('has_sleep_disorder')} />
              <Toggle label="Stress/Anxiety" checked={data.has_stress_anxiety === 1} onChange={() => tog('has_stress_anxiety')} />
              <Toggle label="High Cholesterol" checked={data.has_high_cholesterol === 1} onChange={() => tog('has_high_cholesterol')} />
            </div>
          </div>
        </div>

        <div style={{textAlign: 'center', marginTop: '16px'}}>
          <button className="btn-primary" onClick={onSubmit} disabled={loading} style={{padding: '16px 48px', fontSize: '15px'}}>
            {loading ? 'Running ML Models...' : 'Run AI Analysis — All 6 Models'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>

      </div>
    </div>
  );
}

function Toggle({label, checked, onChange}) {
  return (
    <div onClick={onChange} style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
      background: checked ? 'rgba(79,142,247,0.1)' : 'var(--s3)',
      border: `1px solid ${checked ? 'var(--blue)' : 'var(--border)'}`,
      borderRadius: '8px', cursor: 'pointer', transition: '0.2s',
      userSelect: 'none'
    }}>
      <div style={{
        width: '18px', height: '18px', borderRadius: '4px',
        border: `1.5px solid ${checked ? 'var(--blue)' : 'var(--muted)'}`,
        background: checked ? 'var(--blue)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {checked && <CheckCircle2 size={14} color="#fff" />}
      </div>
      <span style={{fontSize: '13px', color: checked ? 'var(--text)' : 'var(--muted)'}}>{label}</span>
    </div>
  );
}
