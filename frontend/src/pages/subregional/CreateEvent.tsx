import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subRegionalApi } from '../../api/subRegionalApi';
import '../area/AreaForms.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await subRegionalApi.createEvent(formData);
      setSuccess(true);
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
        <h1 className="area-form-title">Create Sub-Regional Event</h1>
      </header>

      {success ? (
        <div className="success-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
           <span className="material-symbols-outlined" style={{ fontSize: '5rem', color: '#10b981' }}>campaign</span>
           <h2 style={{ marginTop: '24px' }}>Event Broadcasted!</h2>
           <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '12px' }}>Event successfully broadcasted to all Area Staff in your Sub-Region.</p>
           <button className="mobile-submit-btn" style={{ marginTop: '40px' }} onClick={() => navigate('/sub-regional/home')}>Back to Dashboard</button>
        </div>
      ) : (
        <form className="mobile-form" onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          
          <div className="mobile-input-group">
            <label className="mobile-label">Event Title</label>
            <input 
              className="mobile-input" 
              required 
              placeholder="e.g. Quarterly Area Staff Sync"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="mobile-input-group">
            <label className="mobile-label">Event Date</label>
            <input 
              className="mobile-input" 
              type="date"
              required 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className="mobile-input-group">
            <label className="mobile-label">Location</label>
            <input 
              className="mobile-input" 
              required 
              placeholder="Office, Zoom link, or Cafe"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div className="mobile-input-group">
            <label className="mobile-label">Short Description</label>
            <textarea 
              className="mobile-textarea" 
              placeholder="Agenda or special instructions..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button className="mobile-submit-btn" type="submit" disabled={loading}>
            {loading ? 'Broadcasting...' : 'Create & Broadcast Event'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateEvent;
