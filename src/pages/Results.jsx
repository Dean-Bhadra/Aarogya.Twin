import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Beaker, ArrowLeft, AlertCircle, HeartPulse, Brain, Droplets, Moon, Scale, Activity } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state || !location.state.results) {
    return <Navigate to="/assess" />;
  }

  const { inputs, results } = location.state;
  const { cvd, diabetes, hypertension, sleep, stress, obesity } = results;

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

  return (
    <div className="content-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Patient Risk Profile</h1>
          <p style={{ color: 'var(--muted)' }}>Analysis complete · {new Date().toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={() => navigate('/assess')} style={{ background: 'var(--s3)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <ArrowLeft size={16} /> Re-assess
          </button>
          <button className="btn-primary" onClick={() => navigate('/whatif')}>
            <Beaker size={16} /> Open Simulation Lab
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* CVD Gauge Card */}
        <div className="form-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--s2)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top, rgba(79,142,247,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <svg width="200" height="120" viewBox="0 0 200 120" style={{ marginBottom: '16px' }}>
            <path d="M 24 108 A 76 76 0 0 1 176 108" fill="none" stroke="#1a2035" strokeWidth="16" strokeLinecap="round" />
            <path d="M 24 108 A 76 76 0 0 1 176 108" fill="none" stroke={cvdColor} strokeWidth="16" strokeLinecap="round" strokeDasharray="238" strokeDashoffset={238 - (cvd * 238)} style={{ transition: '1s ease-out' }} />
            <line x1="100" y1="108" x2="100" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ transformOrigin: '100px 108px', transform: `rotate(${-90 + cvd * 180}deg)`, transition: '1s ease-out' }} />
            <circle cx="100" cy="108" r="5" fill="white" />
          </svg>
          <div style={{ fontSize: '56px', fontWeight: '700', fontFamily: 'var(--mono)', lineHeight: 1, color: cvdColor }}>{cvdPct}%</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CVD / Heart Disease Risk</div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: cvdColor, marginTop: '8px' }}>
            {cvd < 0.3 ? 'Low Risk' : cvd < 0.6 ? 'Moderate Risk' : 'High Risk'}
          </div>
        </div>

        {/* Comorbidities */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <ComorbidCard title="Diabetes" icon={Droplets} prob={diabetes} color="var(--amber)" />
          <ComorbidCard title="Hypertension" icon={Activity} prob={hypertension} color="var(--red)" />
          <ComorbidCard title="Sleep Disorder" icon={Moon} prob={sleep} color="var(--indigo)" />
          <ComorbidCard title="Stress/Anxiety" icon={Brain} prob={stress} color="var(--purple)" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="form-card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: 'var(--muted)', textTransform: 'uppercase' }}>Risk Comparison (All 6 Models)</h3>
          <div style={{ height: '240px' }}><Bar data={barData} options={barOptions} /></div>
        </div>
        <div className="form-card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: 'var(--muted)', textTransform: 'uppercase' }}>Patient vs. Population</h3>
          <div style={{ height: '240px' }}><Radar data={radarData} options={radarOptions} /></div>
        </div>
      </div>

      <div className="form-card">
        <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px', color: 'var(--muted)', textTransform: 'uppercase' }}>Clinical Recommendations</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recommendations.map((rec, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--s3)', padding: '16px', borderRadius: '8px', borderLeft: `4px solid ${rec.type === 'high' ? 'var(--red)' : rec.type === 'med' ? 'var(--amber)' : 'var(--green)'}` }}>
              <rec.icon size={24} color={rec.type === 'high' ? 'var(--red)' : rec.type === 'med' ? 'var(--amber)' : 'var(--green)'} />
              <div style={{ fontSize: '14px', color: 'var(--text)' }}>{rec.text}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function ComorbidCard({ title, icon: Icon, prob, color }) {
  const pct = (prob * 100).toFixed(1);
  return (
    <div className="form-card" style={{ marginBottom: 0, padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon size={18} color={color} />
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{title}</span>
        </div>
        <span style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'var(--mono)', color }}>{pct}%</span>
      </div>
      <div style={{ height: '6px', background: 'var(--s3)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px' }} />
      </div>
    </div>
  );
}
