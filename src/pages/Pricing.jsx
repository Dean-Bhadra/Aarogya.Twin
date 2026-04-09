import React from 'react';
import { Check, HeartPulse, Building2, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const navigate = useNavigate();
  return (
    <div className="content-wrap">
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px' }}>Clear, Transparent Pricing</h1>
        <p style={{ fontSize: '18px', color: 'var(--muted)' }}>Designed strictly for the Indian healthcare ecosystem.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '1100px', margin: '0 auto' }}>
        <PricingCard 
          icon={HeartPulse}
          title="Patient (Individual)"
          price="Free"
          desc="For individuals managing their personal risk factors."
          features={['Access to 6 core ML Risk Models', 'Real-time What-If Scenarios', 'Basic clinical recommendations', 'Save up to 3 risk snapshots']}
          btnText="Create Patient Profile"
          action={() => navigate('/login')}
        />
        
        <PricingCard 
          icon={Building2}
          title="Small Clinic"
          price="₹999"
          period="/month"
          desc="For standard general practitioner offices."
          features={['Everything in Patient', 'Dedicated Doctor Dashboard', 'Review up to 500 patients/month', 'PDF Report Generation', 'Priority Email Support']}
          highlight={true}
          btnText="Start 14-Day Trial"
          action={() => navigate('/login')}
        />
        
        <PricingCard 
          icon={Globe}
          title="Enterprise Hospital"
          price="Custom"
          desc="For nationwide deployment and EMR integration."
          features={['Everything in Small Clinic', 'Unlimited patient reviews', 'Custom ML weight fine-tuning', 'Direct API access', '24/7 Dedicated SLA']}
          btnText="Contact Sales"
          action={() => navigate('/')}
        />
      </div>
    </div>
  );
}

function PricingCard({ icon: Icon, title, price, period, desc, features, highlight, btnText, action }) {
  return (
    <div className="form-card" style={{ 
      border: highlight ? '2px solid var(--blue)' : '1px solid var(--border)',
      background: highlight ? 'linear-gradient(180deg, var(--s3) 0%, var(--bg) 100%)' : 'var(--s2)',
      transform: highlight ? 'scale(1.05)' : 'none',
      position: 'relative',
      padding: '40px 32px'
    }}>
      {highlight && (
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--blue)', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>
          Most Popular
        </div>
      )}
      
      <Icon size={32} color={highlight ? 'var(--blue)' : 'var(--muted)'} style={{ marginBottom: '24px' }} />
      <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{title}</h3>
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '36px', fontWeight: '800' }}>{price}</span>
        {period && <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{period}</span>}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '32px', height: '40px' }}>{desc}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Check size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '14px', color: 'var(--text)' }}>{f}</span>
          </div>
        ))}
      </div>
      
      <button 
        onClick={action}
        className="btn-primary" 
        style={{ 
          width: '100%', 
          justifyContent: 'center', 
          background: highlight ? 'linear-gradient(135deg, var(--blue), var(--indigo))' : 'var(--border2)', 
          color: highlight ? '#fff' : 'var(--text)' 
        }}
      >
        {btnText}
      </button>
    </div>
  );
}
