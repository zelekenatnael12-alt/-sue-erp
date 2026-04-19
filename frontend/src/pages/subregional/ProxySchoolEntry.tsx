import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subRegionalApi } from '../../api/subRegionalApi';
import '../area/AreaForms.css';

const ProxySchoolEntry: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 'NO_FELLOWSHIP',
    targetAreaName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await subRegionalApi.proxySchoolEntry(formData);
      setSuccess(true);
      setTimeout(() => navigate('/sub-regional/home'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="area-form-page">
      <header className="area-form-header">
        <button className="back-btn" onClick={() => navigate('/sub-regional/home')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="area-form-title">Proxy School Entry</h1>
      </header>

      <div className="manager-info-banner">
        <span className="material-symbols-outlined">verified_user</span>
        <p><strong>Note:</strong> Proxy entries are automatically approved to maintain health metrics, but are tagged for Regional review.</p>
      </div>

      {success ? (
        <div className="success-state">
           <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#10b981' }}>check_circle</span>
           <h2>School Registered!</h2>
           <p>Proxy entry auto-approved and logged.</p>
        </div>
      ) : (
        <form className="mobile-form" onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          
          <div className="mobile-input-group">
            <label className="mobile-label">School Name</label>
            <input 
              className="mobile-input" 
              required 
              placeholder="Enter official name"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="mobile-input-group">
            <label className="mobile-label">General Location</label>
            <input 
              className="mobile-input" 
              placeholder="City, District, or Landmark"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div className="mobile-input-group">
            <label className="mobile-label">Vacant Area Name</label>
            <input 
              className="mobile-input" 
              required
              placeholder="Which area is this covering?"
              value={formData.targetAreaName}
              onChange={e => setFormData({...formData, targetAreaName: e.target.value})}
            />
          </div>

          <div className="mobile-input-group">
            <label className="mobile-label">Ministry Status</label>
            <select 
              className="mobile-select"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="SUE_FELLOWSHIP">SUE Fellowship Active</option>
              <option value="OTHER_FELLOWSHIP">Other Fellowship Only</option>
              <option value="NO_FELLOWSHIP">No Known Fellowship</option>
            </select>
          </div>

          <button className="mobile-submit-btn" type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Register as Proxy'}
          </button>
        </form>
      )}

      <style>{`
        .manager-info-banner {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 16px;
          margin: 0 16px 24px;
          border-radius: 12px;
          display: flex;
          gap: 12px;
          color: #1e40af;
          font-size: 0.85rem;
          line-height: 1.4;
        }
        .manager-info-banner span { color: #2563eb; }
        .success-state {
          text-align: center;
          padding: 40px 20px;
        }
      `}</style>
    </div>
  );
};

export default ProxySchoolEntry;
