import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Brain, Scale, Moon, Droplets, Watch, Check, Loader2, Smartphone, ShieldCheck, Lock, FileText } from 'lucide-react';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [syncState, setSyncState] = useState('idle');

  const handleSync = () => {
    setSyncState('syncing');
    setTimeout(() => {
      setSyncState('done');
      setTimeout(() => navigate('/assess', { state: { hasWearableData: true } }), 1000);
    }, 2000);
  };

  return (
    <div className="content-wrap" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Hero Header */}
      <div className="form-card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '40px', background: 'var(--s2)', marginBottom: '24px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', gap: '24px' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'radial-gradient(ellipse at right, rgba(79,142,247,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            background: 'var(--s3)', border: '1px solid var(--border)', 
            borderRadius: '20px', padding: '6px 16px', fontSize: '11px', 
            fontFamily: 'var(--mono)', color: 'var(--blue)', marginBottom: '16px'
          }}>
            <span className="pulse-dot"></span> XAI Clinical Environment Active
          </div>
          <h1 style={{fontSize: '36px', fontWeight: '700', marginBottom: '16px', letterSpacing: '-0.02em'}}>
            Welcome to your <span style={{ color: 'var(--blue)' }}>Digital Twin</span>
          </h1>
          <p style={{fontSize: '15px', color: 'var(--muted)', maxWidth: '500px'}}>
            Run simultaneous predictive models against your live clinical data to establish a comprehensive risk profile and test preventative lifestyle interventions.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '300px', minWidth: '240px', flex: '1 1 240px', zIndex: 1 }}>
          <button className="btn-primary" onClick={() => navigate('/assess')} style={{padding: '16px', fontSize: '14px', borderRadius: '8px', justifyContent: 'center'}}>
            <Activity size={18} style={{marginRight: '8px'}} /> Run Diagnostic Assessment
          </button>
          
          <button 
             onClick={handleSync} 
             disabled={syncState !== 'idle'}
             style={{
               padding: '16px', fontSize: '14px', borderRadius: '8px',
               background: syncState === 'done' ? 'var(--green)' : 'var(--s3)',
               color: syncState === 'done' ? '#fff' : 'var(--text)',
               border: '1px solid var(--border)',
               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
               cursor: syncState !== 'idle' ? 'default' : 'pointer',
               transition: 'all 0.3s'
             }}
           >
             {syncState === 'idle' && <><Watch size={18} /> Sync Apple Health Data</>}
             {syncState === 'syncing' && <><Loader2 size={18} className="spin" /> Importing Telemetry...</>}
             {syncState === 'done' && <><Check size={18} /> Synchronization Complete</>}
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '24px' }}>
        
        {/* Left Column: AI Models */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase' }}>Active Predictive Models</h3>
            <span style={{ fontSize: '12px', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14}/> All systems functional</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
            <ModelCard icon={Heart} title="Cardiovascular Event" color="var(--blue)" acc="AUC 0.991" type="Classification Network" />
            <ModelCard icon={Droplets} title="Diabetes Progression" color="var(--amber)" acc="AUC 0.984" type="Gradient Boosting" />
            <ModelCard icon={Activity} title="Hypertension Risk" color="var(--red)" acc="AUC 0.982" type="Ensemble Model" />
            <ModelCard icon={Scale} title="Obesity Index" color="var(--cyan)" acc="AUC 0.933" type="Decision Tree" />
            <ModelCard icon={Moon} title="Sleep Disorder" color="var(--indigo)" acc="AUC 0.921" type="Causal Inference" />
            <ModelCard icon={Brain} title="Psychological Stress" color="var(--purple)" acc="AUC 0.908" type="Neural Baseline" />
          </div>
        </div>

        {/* Right Column: Recent Activity & Wearables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="form-card" style={{ padding: '24px', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase' }}>Connected Data Sources</h3>
              <span style={{ fontSize: '11px', background: 'var(--s3)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '12px', color: 'var(--muted)' }}>0 Active</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--s3)', borderRadius: '8px', border: '1px dashed var(--border)', justifyContent: 'center', color: 'var(--muted)', textAlign: 'center' }}>
                <Watch size={18} />
                <div style={{ fontSize: '13px' }}>No wearables connected.<br/>Running on manual assessment mode.</div>
              </div>
            </div>
          </div>

          <div className="form-card" style={{ padding: '24px', margin: 0, flex: 1, borderTop: '2px solid var(--blue)', background: 'linear-gradient(180deg, rgba(79,142,247,0.05) 0%, transparent 100%)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '20px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Governance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'var(--s3)', borderRadius: '8px', color: 'var(--green)' }}><ShieldCheck size={18} /></div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>HIPAA Compliant Processing</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', lineHeight: 1.4 }}>System anonymizes all predictive telemetry before local XGBoost inference.</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'var(--s3)', borderRadius: '8px', color: 'var(--purple)' }}><Lock size={18} /></div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>End-to-End Encryption</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', lineHeight: 1.4 }}>Mock AES-256 standard applied to all patient demographic state variables.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'var(--s3)', borderRadius: '8px', color: 'var(--blue)' }}><FileText size={18} /></div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Explainable AI Audit Log</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', lineHeight: 1.4 }}>Every prediction is guarded by SHAP value extraction to eliminate black-box bias.</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ModelCard({icon: Icon, title, color, acc, type}) {
  return (
    <div style={{
      background: 'var(--s2)', border: '1px solid var(--border)', 
      borderRadius: '12px', padding: '20px', textAlign: 'left',
      transition: '0.2s', cursor: 'default'
    }} onMouseOver={e => e.currentTarget.style.borderColor = color} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      <Icon size={24} color={color} style={{marginBottom: '16px'}} />
      <div style={{fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px'}}>{title}</div>
      <div style={{fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: '12px'}}>{type}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--muted)' }}>Confidence</span>
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--green)' }}>{acc}</span>
      </div>
    </div>
  );
}


