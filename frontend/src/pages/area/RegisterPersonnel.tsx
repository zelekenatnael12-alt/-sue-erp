import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { areaApi } from '../../api/areaApi';
import { api } from '../../api/api';
import './AreaForms.css';

const RegisterPersonnel: React.FC = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<'volunteer' | 'associate'>('volunteer');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    backgroundInfo: '',
    photoUrl: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    try {
      const file = e.target.files[0];
      const res = await api.uploadFile(file); // Reusing existing generic upload
      setFormData({ ...formData, photoUrl: res.path });
    } catch (err: any) {
      setError('File upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (type === 'associate') {
      if (!formData.photoUrl || !formData.backgroundInfo) {
        setError('Photo and Background binary are required for Associates.');
        setLoading(false);
        return;
      }
    }

    try {
      if (type === 'volunteer') {
        await areaApi.registerVolunteer({ name: formData.name, phone: formData.phone });
      } else {
        await areaApi.registerAssociate(formData);
      }
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
        <span className="material-symbols-outlined success-icon">how_to_reg</span>
        <h2 className="area-form-title">{type === 'volunteer' ? 'Volunteer Added!' : 'Associate Submitted!'}</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          {type === 'volunteer' 
            ? `${formData.name} is now in your local directory.` 
            : `${formData.name} has been sent for manager approval.`}
        </p>
        <button className="mobile-submit-btn" onClick={() => navigate('/area/home')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="area-form-page">
      <header className="area-form-header">
        <button className="back-btn" onClick={() => navigate('/area/home')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="area-form-title">Register Personnel</h1>
      </header>

      <div className="form-toggle">
        <button 
          className={`toggle-btn ${type === 'volunteer' ? 'toggle-btn--active' : ''}`}
          onClick={() => setType('volunteer')}
        >
          ⚡ Volunteer
        </button>
        <button 
          className={`toggle-btn ${type === 'associate' ? 'toggle-btn--active' : ''}`}
          onClick={() => setType('associate')}
        >
          👤 Associate
        </button>
      </div>

      {error && <div style={{ color: '#ef4444', padding: '12px', background: '#fee2e2', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mobile-input-group">
          <label className="mobile-label">Full Name</label>
          <input 
            className="mobile-input" 
            type="text" 
            placeholder="First and Last Name"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="mobile-input-group">
          <label className="mobile-label">Phone Number</label>
          <input 
            className="mobile-input" 
            type="tel" 
            placeholder="0911..."
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            required
          />
        </div>

        {type === 'associate' && (
          <>
            <div className="mobile-input-group">
              <label className="mobile-label">Profile Photo</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="mobile-select" style={{ cursor: 'pointer', textAlign: 'center', background: '#fff' }}>
                  {formData.photoUrl ? '✅ Photo Uploaded' : '📁 Select Photo'}
                </label>
              </div>
            </div>

            <div className="mobile-input-group">
              <label className="mobile-label">Background / Commitment</label>
              <textarea 
                className="mobile-textarea" 
                placeholder="Briefly describe their background and why they want to serve..."
                value={formData.backgroundInfo}
                onChange={e => setFormData({...formData, backgroundInfo: e.target.value})}
              />
            </div>
          </>
        )}

        <button className="mobile-submit-btn" type="submit" disabled={loading}>
          {loading ? 'Processing...' : (type === 'volunteer' ? 'Add Volunteer (Instant)' : 'Submit for Manager Approval')}
        </button>
      </form>
    </div>
  );
};

export default RegisterPersonnel;
