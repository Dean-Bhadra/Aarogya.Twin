import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HeartPulse, LayoutDashboard, Stethoscope, Beaker, LogOut, FileText, Info, DollarSign, Workflow as WorkflowIcon, Zap } from 'lucide-react';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Workflow from './pages/Workflow';
import PatientDashboard from './pages/PatientDashboard';
import Assessment from './pages/Assessment';
import Results from './pages/Results';
import WhatIfLab from './pages/WhatIfLab';
import DoctorDashboard from './pages/DoctorDashboard';
import Pricing from './pages/Pricing';
import About from './pages/About';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage for mock session on load
    const savedUser = localStorage.getItem('cardiorisk_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (role) => {
    const session = {
      role,
      name: role === 'doctor' ? 'Dr. Smith' : role === 'admin' ? 'Admin' : 'John Doe',
      id: Math.random().toString(36).substr(2, 9)
    };
    localStorage.setItem('cardiorisk_user', JSON.stringify(session));
    setUser(session);
    if (role === 'doctor') {
      navigate('/doctor-dashboard');
    } else {
      navigate('/patient-dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cardiorisk_user');
    setUser(null);
    navigate('/');
  };

  const NavItem = ({ path, icon: Icon, label }) => {
    const isActive = location.pathname === path;
    return (
      <button 
        className={`nav-link ${isActive ? 'active' : ''}`}
        onClick={() => navigate(path)}
      >
        <Icon size={16} />
        {label}
      </button>
    );
  };

  return (
    <>
      <nav className="app-nav">
        <div className="nav-brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <HeartPulse size={24} color="#f43f5e" />
          CardioRisk AI
        </div>
        <div className="nav-badge">v. alpha | Null Pointers</div>
        
        <div className="nav-links">
          {!user && (
            <>
              <NavItem path="/workflow" icon={WorkflowIcon} label="Workflow" />
              <NavItem path="/pricing" icon={DollarSign} label="Pricing" />
              <NavItem path="/about" icon={Info} label="About" />
              <button 
                className="btn-primary" 
                onClick={() => navigate('/login')} 
                style={{ marginLeft: '12px', padding: '6px 16px', fontSize: '12px' }}
              >
                <Zap size={14} /> Login
              </button>
            </>
          )}

          {user && user.role === 'patient' && (
            <>
              <NavItem path="/patient-dashboard" icon={LayoutDashboard} label="Home" />
              <NavItem path="/assess" icon={Stethoscope} label="Assess" />
              <NavItem path="/results" icon={FileText} label="Results" />
              <NavItem path="/whatif" icon={Beaker} label="What-If Lab" />
            </>
          )}
          
          {user && user.role === 'doctor' && (
            <>
              <NavItem path="/doctor-dashboard" icon={LayoutDashboard} label="Patients" />
              <NavItem path="/whatif" icon={Beaker} label="Simulation" />
            </>
          )}
          
          {user && (
            <div className="nav-user">
              <div className="nav-user-avatar">
                {user.name.charAt(0)}
              </div>
              <div className="nav-user-name">{user.name}</div>
              <LogOut 
                size={16} 
                color="#f43f5e" 
                style={{cursor: 'pointer', marginLeft: '4px'}} 
                onClick={handleLogout} 
              />
            </div>
          )}
        </div>
      </nav>

      <div className="page-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          {/* Protected Routes */}
          <Route path="/patient-dashboard" element={user ? <PatientDashboard /> : <Navigate to="/login" />} />
          <Route path="/doctor-dashboard" element={user ? <DoctorDashboard /> : <Navigate to="/login" />} />
          <Route path="/assess" element={user ? <Assessment /> : <Navigate to="/login" />} />
          <Route path="/results" element={user ? <Results /> : <Navigate to="/login" />} />
          <Route path="/whatif" element={user ? <WhatIfLab /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
