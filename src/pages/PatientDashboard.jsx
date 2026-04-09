import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Brain, Scale, Moon, Droplets } from 'lucide-react';

export default function PatientDashboard() {
  const navigate = useNavigate();

  return (
    <div className="content-wrap">
      <div style={{textAlign: 'center', maxWidth: '800px', margin: '0 auto 48px'}}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', 
          background: 'var(--s3)', border: '1px solid var(--border)', 
          borderRadius: '20px', padding: '6px 16px', fontSize: '11px', 
          fontFamily: 'var(--mono)', color: 'var(--blue)', marginBottom: '24px'
        }}>
          <span className="pulse-dot"></span> 6 ML Models · Real-Time Inference
        </div>
        
        <h1 style={{fontSize: '48px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.03em'}}>
          Predict Your <span style={{
            background: 'linear-gradient(135deg, var(--blue), var(--indigo), var(--purple))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Cardiovascular Risk</span>
        </h1>
        
        <p style={{fontSize: '16px', color: 'var(--muted)', marginBottom: '36px'}}>
          Begin your assessment below. Our AI will analyze your clinical data and present you with a comprehensive multi-disease risk profile simultaneously.
        </p>

        <button className="btn-primary" onClick={() => navigate('/assess')} style={{padding: '16px 48px', fontSize: '16px', borderRadius: '40px'}}>
          Begin Health Assessment
        </button>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', opacity: 0.6, pointerEvents: 'none'
      }}>
        <ModelCard icon={Heart} title="CVD Risk" />
        <ModelCard icon={Droplets} title="Diabetes" />
        <ModelCard icon={Activity} title="Hypertension" />
        <ModelCard icon={Moon} title="Sleep Disorder" />
        <ModelCard icon={Brain} title="Stress/Anxiety" />
        <ModelCard icon={Scale} title="Obesity" />
      </div>
    </div>
  );
}

function ModelCard({icon: Icon, title}) {
  return (
    <div style={{
      background: 'var(--s2)', border: '1px solid var(--border)', 
      borderRadius: 'var(--r2)', padding: '20px', textAlign: 'center'
    }}>
      <Icon size={24} color="var(--muted)" style={{marginBottom: '12px'}} />
      <div style={{fontSize: '14px', fontWeight: '500', color: 'var(--muted)'}}>{title}</div>
    </div>
  );
}
