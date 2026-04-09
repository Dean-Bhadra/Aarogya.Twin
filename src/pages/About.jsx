import React from 'react';
import { Terminal, Lightbulb, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="content-wrap" style={{ maxWidth: '900px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--blue)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Terminal size={24} color="#fff" />
          </div>
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.02em' }}>Meet Team Null Pointers</h1>
        <p style={{ fontSize: '18px', color: 'var(--muted)', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
          We are a team of passionate developers and data enthusiasts bridging the gap between machine learning and accessible healthcare in India.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '40px', marginBottom: '60px' }}>
        <div className="form-card" style={{ padding: '40px', background: 'var(--s2)', border: '1px solid var(--border)' }}>
          <Lightbulb size={24} color="var(--amber)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Our Mission</h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.7 }}>
            Cardiovascular diseases dictate the leading cause of mortality globally, but earlier identification is notoriously difficult without specialized screenings. 
            We built CardioRisk AI entirely during this hackathon to prove that serverless, high-accuracy clinical decision support systems can be deployed rapidly—without relying on heavy backends.
          </p>
        </div>
        <div className="form-card" style={{ padding: '40px', background: 'var(--s2)', border: '1px solid var(--border)' }}>
          <Users size={24} color="var(--indigo)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>The Members</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Member name="Ayan Banerjee" role="ML Engineering & Logistics" init="AB" color="var(--red)" />
            <Member name="Debanjan Bhadra" role="Project Architecture & UI/UX" init="DB" color="var(--blue)" />
            <Member name="Anurag Ghosh" role="Frontend Integration" init="AG" color="var(--green)" />
            <Member name="Debmalya Gupta" role="Data Synthesis" init="DG" color="var(--amber)" />
            <Member name="Zainab Rahman" role="Documentation & QC" init="ZR" color="var(--purple)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Member({ name, role, init, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '700' }}>
        {init}
      </div>
      <div>
        <div style={{ fontSize: '15px', fontWeight: '600' }}>{name}</div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{role}</div>
      </div>
    </div>
  );
}
