import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Brain, Scale, Moon, Droplets, ShieldCheck, Stethoscope, UserCheck, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 60px)' }}>
      {/* Dynamic Mouse Glow Background */}
      <div style={{
        position: 'fixed',
        left: mousePos.x,
        top: mousePos.y,
        width: '800px',
        height: '800px',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(79, 142, 247, 0.08) 0%, rgba(20, 24, 38, 0) 60%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div className="content-wrap" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* HERO SECTION */}
        <div style={{textAlign: 'center', maxWidth: '800px', margin: '40px auto 60px'}}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            background: 'var(--s3)', border: '1px solid var(--border)', 
            borderRadius: '20px', padding: '8px 20px', fontSize: '12px', 
            fontFamily: 'var(--mono)', color: 'var(--blue)', marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <span className="pulse-dot"></span> Built by Team Null Pointers
          </div>
          
          <h1 style={{fontSize: 'clamp(28px, 6vw, 56px)', fontWeight: '800', marginBottom: '24px', letterSpacing: '-0.03em', lineHeight: 1.1}}>
            Digital Twin <span style={{
              background: 'linear-gradient(135deg, var(--blue), var(--indigo), var(--purple))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Health Prediction</span>
          </h1>
          
          <p style={{fontSize: 'clamp(14px, 2vw, 18px)', color: 'var(--muted)', marginBottom: '40px', lineHeight: 1.6}}>
            Aarogya Twin is a secure, serverless clinical decision support system utilizing 6 simultaneous ML models.
          </p>

          <button className="btn-primary" onClick={() => navigate('/login')} style={{padding: '16px 40px', fontSize: '16px', borderRadius: '40px'}}>
            Login to Portal <ArrowRight size={18} />
          </button>
        </div>

        {/* DATASET INFO SECTION */}
        <div style={{ marginBottom: '80px' }}>
          <div style={{display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 3vw, 40px)', flexWrap: 'wrap', padding: 'clamp(20px, 3vw, 40px)', background: 'var(--s2)', borderRadius: '24px', border: '1px solid var(--border)'}}>
            <Stat val="7,500" lbl="Training Patients" />
            <Stat val="6" lbl="ML Models" />
            <Stat val="95.5%" lbl="CVD Accuracy" />
            <Stat val="0.991" lbl="CVD AUC" />
          </div>
        </div>

        {/* VALUE PROPOSITION SECTION */}
        <div style={{ marginBottom: '80px' }}>
          <h2 style={{fontSize: '24px', textAlign: 'center', marginBottom: '32px'}}>How Aarogya Twin Solves The Problem</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <TiltCard>
              <div className="form-card" style={{ height: '100%', marginBottom: 0, background: 'linear-gradient(180deg, var(--s2) 0%, var(--bg) 100%)' }}>
                <UserCheck size={32} color="var(--green)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>For Patients</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>
                  Patients often lack an understanding of how their lifestyle choices compound into chronic disease. 
                  Our app provides <strong>instant, visually intuitive health feedback</strong>. The "What-If" simulation lab empowers 
                  patients to see exactly how losing 5kg or lowering blood pressure immediately reduces their risk probability.
                </p>
              </div>
            </TiltCard>
            <TiltCard>
              <div className="form-card" style={{ height: '100%', marginBottom: 0, background: 'linear-gradient(180deg, var(--s2) 0%, var(--bg) 100%)' }}>
                <Stethoscope size={32} color="var(--blue)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>For Doctors</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>
                  Clinicians are overwhelmed with raw data. CardioRisk serves as an <strong>early warning system</strong>, automatically flagging high-risk patients. 
                  Instead of calculating disjointed scores manually, doctors can use our interactive dashboard to validate algorithmic predictions 
                  and prioritize timely interventions.
                </p>
              </div>
            </TiltCard>
            <TiltCard>
              <div className="form-card" style={{ height: '100%', marginBottom: 0, background: 'linear-gradient(180deg, var(--s2) 0%, var(--bg) 100%)' }}>
                <ShieldCheck size={32} color="var(--purple)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>Privacy & Security</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6 }}>
                  Built entirely on a continuous <strong>client-side inference architecture</strong>. 
                  Patient data is processed internally within the browser via our optimized weights engine. 
                  No sensitive medical records are ever sent to an external server, drastically reducing HIPAA compliance risks.
                </p>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* MODELS GRID SECTION */}
        <div>
          <h2 style={{fontSize: '24px', textAlign: 'center', marginBottom: '32px'}}>Powered by 6 Inference Models</h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'
          }}>
            <TiltCard><ModelCard icon={Heart} title="CVD Risk" auc="AUC 0.9914" prev="49.5% prevalence" desc="Primary cardiovascular disease identification matrix." /></TiltCard>
            <TiltCard><ModelCard icon={Droplets} title="Type 2 Diabetes" auc="AUC 0.9837" prev="21.4% prevalence" desc="Assesses metabolic risk based on HbA1c and BMI clusters." /></TiltCard>
            <TiltCard><ModelCard icon={Activity} title="Hypertension" auc="AUC 0.9824" prev="39.9% prevalence" desc="Hemodynamic analysis using systolic/diastolic spread." /></TiltCard>
            <TiltCard><ModelCard icon={Moon} title="Sleep Disorder" auc="AUC 0.6743" prev="37.5% prevalence" desc="Identifies apnea risks from SpO2 and demographic triggers." /></TiltCard>
            <TiltCard><ModelCard icon={Brain} title="Stress/Anxiety" auc="AUC 0.9084" prev="32.8% prevalence" desc="Mental health screening via PHQ-2 and neurological vitals." /></TiltCard>
            <TiltCard><ModelCard icon={Scale} title="Obesity" auc="AUC 0.8169" prev="30.0% prevalence" desc="Predictive physical clustering and lifestyle indicators." /></TiltCard>
          </div>
        </div>

      </div>
    </div>
  );
}

function Stat({val, lbl}) {
  return (
    <div style={{textAlign: 'center'}}>
      <div style={{
        fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '800', fontFamily: 'var(--mono)',
        background: 'linear-gradient(135deg, var(--blue), var(--cyan))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
      }}>{val}</div>
      <div style={{fontSize: '12px', color: 'var(--muted)', marginTop: '4px', textTransform: 'uppercase'}}>{lbl}</div>
    </div>
  );
}

function TiltCard({ children }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef();

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -6; 
    const rotateY = ((x - centerX) / centerX) * 6;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => { setIsHovered(false); setTilt({ x: 0, y: 0 }); };

  return (
    <div 
      ref={cardRef} onMouseMove={handleMouseMove} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
        transition: isHovered ? 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'transform 0.5s ease-out',
        willChange: 'transform', transformStyle: 'preserve-3d', height: '100%', cursor: 'default'
      }}
    >
      <div style={{ transform: 'translateZ(20px)', height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

function ModelCard({icon: Icon, title, auc, prev, desc}) {
  return (
    <div style={{
      background: 'var(--s2)', border: '1px solid var(--border)', 
      borderRadius: 'var(--r2)', padding: '24px', transition: '0.2s', height: '100%',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 142, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={24} color="var(--blue)" />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--green)', fontWeight: '600'}}>{auc}</div>
          <div style={{fontSize: '11px', color: 'var(--muted)'}}>{prev}</div>
        </div>
      </div>
      <h4 style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px'}}>{title}</h4>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}
