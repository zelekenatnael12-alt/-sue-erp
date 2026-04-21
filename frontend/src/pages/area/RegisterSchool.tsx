import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { areaApi } from '../../api/areaApi';
import { useAutoSave } from '../../hooks/useAutoSave';
import { persistenceService } from '../../services/persistenceService';
import './AreaForms.css';

const RegisterSchool: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 'NO_FELLOWSHIP',
    memberCount: 0,
    smallGroupCount: 0,
    latitude: '',
    longitude: ''
  });

  const [step, setStep] = useState(1); // 1: Basic, 2: Metrics, 3: Leadership
  const [capturingGps, setCapturingGps] = useState(false);

  const [leaders, setLeaders] = useState([{ name: '', role: 'STUDENT_LEADER', phone: '' }]);

  // Phase G Remediation: Offline Persistence
  useAutoSave('school_reg_draft', { formData, leaders });

  React.useEffect(() => {
    const loadDraft = async () => {
      const draft = await persistenceService.getDraft('school_reg_draft');
      if (draft && draft.data) {
        setFormData(draft.data.formData);
        setLeaders(draft.data.leaders);
      }
    };
    loadDraft();
  }, []);

  const addLeader = () => setLeaders([...leaders, { name: '', role: 'STUDENT_LEADER', phone: '' }]);
  const updateLeader = (index: number, field: string, value: string) => {
    const newLeaders = [...leaders];
    (newLeaders[index] as any)[field] = value;
    setLeaders(newLeaders);
  };
  const captureGps = () => {
    setCapturingGps(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      setCapturingGps(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({ ...formData, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() });
        setCapturingGps(false);
      },
      () => {
        alert("Failed to capture location. Please ensure GPS is active.");
        setCapturingGps(false);
      }
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await areaApi.registerSchool({
        ...formData,
        leaders: leaders.filter(l => l.name.trim() !== '')
      });
      await persistenceService.clearDraft('school_reg_draft');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="area-form-page success-card">
        <div style={{ animation: 'bounce 1s infinite' }}><span className="material-symbols-outlined success-icon">location_on</span></div>
        <h2 className="area-form-title">Mission Point Discovered!</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          {formData.name} is now mapped and registered in the SUE national ecosystem.
        </p>
        <button className="mobile-submit-btn" onClick={() => navigate(-1)}>
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="area-form-page">
      <header className="area-form-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="area-form-title">School Ministry Registry</h1>
      </header>

      {error && <div style={{ color: '#ef4444', padding: '12px', background: '#fee2e2', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: '4px', flex: 1, background: step >= i ? '#6366f1' : '#e2e8f0', borderRadius: '2px' }} />
          ))}
        </div>

        {step === 1 && (
          <div className="wizard-step">
            <div className="form-section-label">Basic Information</div>
            <div className="mobile-input-group">
              <label className="mobile-label">School Name</label>
              <input 
                className="mobile-input" 
                type="text" 
                placeholder="e.g. Hawassa Tabor Secondary"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="mobile-input-group">
              <label className="mobile-label">Fellowship Status</label>
              <select className="mobile-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="NO_FELLOWSHIP">No SUE Fellowship (Target)</option>
                <option value="SUE_FELLOWSHIP">Active SUE Fellowship</option>
              </select>
            </div>

            <button type="button" className="action-tile" style={{ width: '100%', marginBottom: '24px', background: formData.latitude ? '#ecfdf5' : '#f8fafc' }} onClick={captureGps}>
              <span className="action-icon">{formData.latitude ? '📍' : '🛰️'}</span>
              <span className="action-label">{capturingGps ? 'Tracking Satellites...' : formData.latitude ? 'GPS Coordinates Captured' : 'Attach GPS Location'}</span>
            </button>

            <button type="button" className="mobile-submit-btn" onClick={() => setStep(2)} disabled={!formData.name}>Next Step</button>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <div className="form-section-label">Ministry Metrics</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div className="mobile-input-group">
                <label className="mobile-label">Member Count</label>
                <input className="mobile-input" type="number" value={formData.memberCount} onChange={e => setFormData({...formData, memberCount: parseInt(e.target.value) || 0})} />
              </div>
              <div className="mobile-input-group">
                <label className="mobile-label">Small Groups</label>
                <input className="mobile-input" type="number" value={formData.smallGroupCount} onChange={e => setFormData({...formData, smallGroupCount: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <button type="button" className="mobile-submit-btn" onClick={() => setStep(3)}>Next Step</button>
            <button type="button" className="text-btn" style={{ width: '100%', marginTop: '16px' }} onClick={() => setStep(1)}>Go Back</button>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <div className="form-section-label">School Leadership</div>
            {leaders.map((leader, index) => (
              <div key={index} className="leader-form-item" style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                <input className="mobile-input" style={{ marginBottom: '8px' }} placeholder="Leader Name" value={leader.name} onChange={e => updateLeader(index, 'name', e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                  <select className="mobile-select" value={leader.role} onChange={e => updateLeader(index, 'role', e.target.value)}>
                    <option value="STUDENT_LEADER">Student Leader</option>
                    <option value="PATRON">Teacher Patron</option>
                  </select>
                  <input className="mobile-input" placeholder="Phone" value={leader.phone} onChange={e => updateLeader(index, 'phone', e.target.value)} />
                </div>
              </div>
            ))}
            <button type="button" className="text-btn" onClick={addLeader} style={{ marginBottom: '24px' }}>+ Add Another Leader</button>

            <button className="mobile-submit-btn" type="submit" disabled={loading}>
              {loading ? 'Submitting Registry...' : '🚀 Complete Registry'}
            </button>
            <button type="button" className="text-btn" style={{ width: '100%', marginTop: '16px' }} onClick={() => setStep(2)}>Go Back</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterSchool;
