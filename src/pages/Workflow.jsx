import React from 'react';

export default function Workflow() {
  return (
    <div className="content-wrap">
      <div style={{textAlign: 'center', maxWidth: '800px', margin: '40px auto 40px'}}>
        <h1 style={{fontSize: '40px', fontWeight: '800', marginBottom: '16px'}}>
          System Workflow Architecture
        </h1>
        <p style={{fontSize: '16px', color: 'var(--muted)', lineHeight: 1.6}}>
          This diagram illustrates how clinical data flows through the Digital Twin engine. 
          Data is securely processed via client-side inference using pre-trained ML weights.
        </p>
      </div>

      <div className="form-card" style={{ padding: '40px', background: 'var(--bg)', display: 'flex', justifyContent: 'center' }}>
        <img 
          src="/digital_twin_health_workflow.svg" 
          alt="Digital Twin Health Workflow" 
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 0 40px rgba(79, 142, 247, 0.1)' }} 
        />
      </div>
    </div>
  );
}
