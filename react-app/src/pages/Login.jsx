import React, { useState } from 'react';
import { HeartPulse, User, Shield, Stethoscope, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    setLoading(true);
    setTimeout(() => {
      onLogin(selectedRole);
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--s2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r2)',
        padding: '40px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        textAlign: 'center'
      }}>
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '24px'}}>
          <div style={{
            width: '64px', height: '64px', 
            background: 'rgba(79,142,247,0.1)',
            border: '1px solid var(--blue)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <HeartPulse size={36} color="#4f8ef7" />
          </div>
        </div>
        
        <h1 style={{fontSize: '24px', marginBottom: '8px'}}>Welcome to Aarogya Twin</h1>
        <p style={{color: 'var(--muted)', fontSize: '13px', marginBottom: '32px'}}>
          Please select your role to continue into the secure portal.
        </p>

        <form onSubmit={handleLoginSubmit}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px'}}>
            
            <RoleCard 
              active={selectedRole === 'patient'} 
              onClick={() => setSelectedRole('patient')}
              icon={User}
              title="Patient Portal"
              desc="Access your personal risk assessments"
            />
            <RoleCard 
              active={selectedRole === 'doctor'} 
              onClick={() => setSelectedRole('doctor')}
              icon={Stethoscope}
              title="Doctor Dashboard"
              desc="Review patients and run clinical simulations"
            />
            <RoleCard 
              active={selectedRole === 'admin'} 
              onClick={() => setSelectedRole('admin')}
              icon={Shield}
              title="System Admin"
              desc="Manage ML models and organizational settings"
            />

          </div>

          <button 
            type="submit"
            disabled={!selectedRole || loading}
            style={{
              width: '100%',
              padding: '14px',
              background: (!selectedRole || loading) ? 'var(--s3)' : 'linear-gradient(135deg, var(--blue), var(--indigo))',
              color: (!selectedRole || loading) ? 'var(--muted)' : '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (!selectedRole || loading) ? 'not-allowed' : 'pointer',
              transition: '0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Authenticating...' : 'Enter Portal'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, icon: Icon, title, desc }) {
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        background: active ? 'rgba(79,142,247,0.1)' : 'var(--s3)',
        border: `1px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: '0.2s',
        textAlign: 'left'
      }}
    >
      <div style={{
        width: '40px', height: '40px',
        background: active ? 'var(--blue)' : 'var(--s4)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        color: active ? '#fff' : 'var(--text)'
      }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{fontSize: '14px', fontWeight: '600', color: active ? 'var(--blue)' : 'var(--text)'}}>
          {title}
        </div>
        <div style={{fontSize: '11px', color: 'var(--muted)'}}>{desc}</div>
      </div>
    </div>
  );
}
