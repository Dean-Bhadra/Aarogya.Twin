import React, { useState } from 'react';
import { User, CheckCircle, XCircle, Search, AlertCircle, FileText } from 'lucide-react';
import { predictAll } from '../utils/mlEngine';
import { useNavigate } from 'react-router-dom';

const MOCK_PATIENTS = [
  { id: 'P-10492', name: 'Rajesh Kumar', age: 45, sex: 1, history: 'Hypertension', inputs: { age: 45, gender_enc: 1, is_married: 1, race_asian: 1, income: 85000, has_hypertension: 1, systolic_bp: 145, diastolic_bp: 90, heart_rate: 72, hba1c: 5.4, spo2: 98, resp_rate: 16, weight_kg: 82, height_cm: 175, bmi: 26.8, alcohol_score: 2, phq2_score: 1 } },
  { id: 'P-99381', name: 'Priya Sharma', age: 58, sex: 0, history: 'Type 2 Diabetes', inputs: { age: 58, gender_enc: 0, is_married: 0, race_white: 1, income: 45000, has_diabetes: 1, systolic_bp: 138, diastolic_bp: 82, heart_rate: 85, hba1c: 7.2, spo2: 95, resp_rate: 18, weight_kg: 95, height_cm: 162, bmi: 36.2, alcohol_score: 0, phq2_score: 3 } },
  { id: 'P-55210', name: 'Amit Patel', age: 32, sex: 1, history: 'None', inputs: { age: 32, gender_enc: 1, is_married: 0, race_black: 1, income: 60000, has_diabetes: 0, systolic_bp: 118, diastolic_bp: 75, heart_rate: 65, hba1c: 5.1, spo2: 99, resp_rate: 14, weight_kg: 78, height_cm: 182, bmi: 23.5, alcohol_score: 4, phq2_score: 0 } },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState(
    MOCK_PATIENTS.map(p => {
      const risks = predictAll(p.inputs);
      const cvdRisk = +(risks.cvd * 100).toFixed(1);
      return { ...p, cvdRisk, status: 'pending', risks };
    })
  );

  const handleAction = (id, newStatus) => {
    setPatients(patients.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const pendingCount = patients.filter(p => p.status === 'pending').length;

  return (
    <div className="content-wrap">
      <div className="flex-responsive" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{fontSize: '28px', marginBottom: '8px'}}>Doctor Dashboard</h1>
          <p style={{color: 'var(--muted)'}}>Review patient risk assessments and approve clinical records.</p>
        </div>
        <div style={{background: 'var(--s2)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: '12px', textAlign: 'center'}}>
          <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--blue)'}}>{pendingCount}</div>
          <div style={{fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase'}}>Pending Reviews</div>
        </div>
      </div>

      <div className="form-card" style={{padding: '0', overflow: 'hidden'}}>
        <div style={{padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--s3)'}}>
          <Search size={16} color="var(--muted)" />
          <input type="text" placeholder="Search patients by name or ID..." style={{background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', flex: 1}} />
        </div>
        
        <div className="table-responsive">
          <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px'}}>
          <thead style={{background: 'var(--s1)', borderBottom: '1px solid var(--border)'}}>
            <tr>
              <th style={{padding: '12px 20px', color: 'var(--muted)', fontWeight: '500'}}>Patient</th>
              <th style={{padding: '12px 20px', color: 'var(--muted)', fontWeight: '500'}}>Age/Sex</th>
              <th style={{padding: '12px 20px', color: 'var(--muted)', fontWeight: '500'}}>Known History</th>
              <th style={{padding: '12px 20px', color: 'var(--muted)', fontWeight: '500'}}>AI CVD Risk</th>
              <th style={{padding: '12px 20px', color: 'var(--muted)', fontWeight: '500'}}>Status</th>
              <th style={{padding: '12px 20px', color: 'var(--muted)', fontWeight: '500', textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id} style={{borderBottom: '1px solid var(--border)', background: p.status === 'pending' ? 'var(--s2)' : 'var(--bg)'}}>
                <td style={{padding: '16px 20px'}}>
                  <div style={{fontWeight: '600'}}>{p.name}</div>
                  <div style={{fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)'}}>{p.id}</div>
                </td>
                <td style={{padding: '16px 20px'}}>{p.age} / {p.sex ? 'M' : 'F'}</td>
                <td style={{padding: '16px 20px'}}>{p.history}</td>
                <td style={{padding: '16px 20px'}}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 8px', borderRadius: '4px', fontFamily: 'var(--mono)', fontSize: '12px',
                    background: p.cvdRisk > 50 ? 'rgba(239, 68, 68, 0.1)' : p.cvdRisk > 30 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: p.cvdRisk > 50 ? 'var(--red)' : p.cvdRisk > 30 ? 'var(--amber)' : 'var(--green)'
                  }}>
                    {p.cvdRisk > 50 && <AlertCircle size={14} />}
                    {p.cvdRisk}%
                  </div>
                </td>
                <td style={{padding: '16px 20px'}}>
                  {p.status === 'pending' && <span style={{color: 'var(--amber)', fontSize: '12px'}}>Needs Review</span>}
                  {p.status === 'approved' && <span style={{color: 'var(--green)', fontSize: '12px'}}>Approved</span>}
                  {p.status === 'rejected' && <span style={{color: 'var(--red)', fontSize: '12px'}}>Flagged</span>}
                </td>
                <td style={{padding: '16px 20px', textAlign: 'right'}}>
                  <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
                    <button 
                      onClick={() => navigate('/whatif')} 
                      title="Simulate interventions"
                      style={{background: 'var(--s3)', border: '1px solid var(--border)', padding: '6px', borderRadius: '6px', color: 'var(--blue)'}}
                    >
                      <FileText size={16} />
                    </button>
                    {p.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleAction(p.id, 'approved')}
                          style={{background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--green)', padding: '6px', borderRadius: '6px', color: 'var(--green)'}}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          onClick={() => handleAction(p.id, 'rejected')}
                          style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--red)', padding: '6px', borderRadius: '6px', color: 'var(--red)'}}
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleAction(p.id, 'pending')}
                        style={{background: 'var(--s3)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px', color: 'var(--muted)', fontSize: '11px'}}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
