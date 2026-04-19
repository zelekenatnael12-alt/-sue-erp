import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subRegionalApi } from '../../api/subRegionalApi';
import '../area/AreaForms.css';

const ManagerForms: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'associate';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Associate State
  const [associateData, setAssociateData] = useState({
    name: '',
    phone: '',
    email: '',
    background: ''
  });

  // Area Proposal State
  const [areaData, setAreaData] = useState({
    name: '',
    boundaries: '',
    justification: ''
  });

  const handleAssociateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await subRegionalApi.registerAssociateDirect(associateData);
      setSuccess(true);
      setTimeout(() => navigate('/sub-regional/home'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await subRegionalApi.proposeArea(areaData);
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
        <h1 className="area-form-title">
          {mode === 'associate' ? 'Direct Registration' : 'Propose New Area'}
        </h1>
      </header>

      {success ? (
        <div className="success-state" style={{ textAlign: 'center', padding: '40px' }}>
           <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#10b981' }}>check_circle</span>
           <h2>{mode === 'associate' ? 'Associate Registered!' : 'Proposal Submitted!'}</h2>
           <p>{mode === 'associate' ? 'Auto-approved and activated.' : 'Sent to Regional Director for review.'}</p>
        </div>
      ) : mode === 'associate' ? (
        <form className="mobile-form" onSubmit={handleAssociateSubmit}>
          {error && <div className="error-msg">{error}</div>}
          <div className="mobile-input-group">
            <label className="mobile-label">Full Name</label>
            <input className="mobile-input" required value={associateData.name} onChange={e => setAssociateData({...associateData, name: e.target.value})} />
          </div>
          <div className="mobile-input-group">
            <label className="mobile-label">Phone Number</label>
            <input className="mobile-input" required type="tel" value={associateData.phone} onChange={e => setAssociateData({...associateData, phone: e.target.value})} />
          </div>
          <div className="mobile-input-group">
            <label className="mobile-label">Email (Optional)</label>
            <input className="mobile-input" type="email" value={associateData.email} onChange={e => setAssociateData({...associateData, email: e.target.value})} />
          </div>
          <div className="mobile-input-group">
            <label className="mobile-label">Church/Ministry Background</label>
            <textarea className="mobile-textarea" value={associateData.background} onChange={e => setAssociateData({...associateData, background: e.target.value})} />
          </div>
          <button className="mobile-submit-btn" type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Register & Auto-Approve'}
          </button>
        </form>
      ) : (
        <form className="mobile-form" onSubmit={handleAreaSubmit}>
          {error && <div className="error-msg">{error}</div>}
          <div className="mobile-input-group">
            <label className="mobile-label">Proposed Area Name</label>
            <input className="mobile-input" required placeholder="e.g. West Bole Extension" value={areaData.name} onChange={e => setAreaData({...areaData, name: e.target.value})} />
          </div>
          <div className="mobile-input-group">
            <label className="mobile-label">Geographic Boundaries</label>
            <textarea className="mobile-textarea" placeholder="North: Road X, South: River Y..." value={areaData.boundaries} onChange={e => setAreaData({...areaData, boundaries: e.target.value})} />
          </div>
          <div className="mobile-input-group">
            <label className="mobile-label">Justification / Need</label>
            <textarea className="mobile-textarea" required placeholder="Why is this area needed now?" value={areaData.justification} onChange={e => setAreaData({...areaData, justification: e.target.value})} />
          </div>
          <button className="mobile-submit-btn" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit to Regional Director'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ManagerForms;
