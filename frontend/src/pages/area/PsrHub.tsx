import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { areaApi } from '../../api/areaApi';
import { api } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './AreaForms.css';
import './AreaPortal.css';

const PsrHub: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'donor' | 'pledge'>('donor');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [donorForm, setDonorForm] = useState({ name: '', phone: '', email: '' });
  const [pledgeForm, setPledgeForm] = useState({ amount: '', format: 'MONTHLY', donorId: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [s, d] = await Promise.all([
        api.getAreaDashboardStats(),
        areaApi.getDonors()
      ]);
      setStats(s);
      setDonors(d);
    } catch (e) {
      console.error('PSR Hub load error:', e);
    }
  };

  const handleAddDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await areaApi.addDonor(donorForm);
      setSuccess('Donor added successfully!');
      setDonorForm({ name: '', phone: '', email: '' });
      fetchInitialData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogPledge = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await areaApi.logPledge(pledgeForm);
      setSuccess('Pledge logged! Dashboard updating...');
      setPledgeForm({ amount: '', format: 'MONTHLY', donorId: '' });
      fetchInitialData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="area-form-page">
      <header className="area-form-header">
        <button className="back-btn" onClick={() => navigate('/area/home')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="area-form-title">Support & PSR</h1>
      </header>

      {/* Ring Monitoring */}
      <section className="psr-section" style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div className="psr-ring-container" style={{ width: '100px', height: '100px' }}>
          <svg className="psr-ring-svg" width="100" height="100">
            <circle className="psr-ring-background" cx="50" cy="50" r="40" style={{ strokeWidth: 8 }} />
            <circle 
              className="psr-ring-fill" 
              cx="50" 
              cy="50" 
              r="40" 
              style={{ strokeWidth: 8 }}
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={2 * Math.PI * 40 - ((stats?.psrPercentage || 0) / 100) * (2 * Math.PI * 40)}
            />
          </svg>
          <div className="psr-percentage" style={{ fontSize: '1rem' }}>{stats?.psrPercentage || 0}%</div>
        </div>
        <div className="psr-label" style={{ fontSize: '0.75rem' }}>Personal Support Status</div>
      </section>

      <div className="form-toggle">
        <button 
          className={`toggle-btn ${activeTab === 'donor' ? 'toggle-btn--active' : ''}`}
          onClick={() => { setActiveTab('donor'); setSuccess(''); setError(''); }}
        >
          👤 New Donor
        </button>
        <button 
          className={`toggle-btn ${activeTab === 'pledge' ? 'toggle-btn--active' : ''}`}
          onClick={() => { setActiveTab('pledge'); setSuccess(''); setError(''); }}
        >
          💸 Log Pledge
        </button>
      </div>

      {error && <div style={{ color: '#ef4444', padding: '12px', background: '#fee2e2', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>{error}</div>}
      {success && <div style={{ color: '#059669', padding: '12px', background: '#d1fae5', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>{success}</div>}

      {activeTab === 'donor' ? (
        <form onSubmit={handleAddDonor}>
          <div className="mobile-input-group">
            <label className="mobile-label">Donor Name</label>
            <input 
              className="mobile-input" 
              required 
              placeholder="e.g. Ato Tesfaye"
              value={donorForm.name}
              onChange={e => setDonorForm({...donorForm, name: e.target.value})}
            />
          </div>
          <div className="mobile-input-group">
            <label className="mobile-label">Phone Number</label>
            <input className="mobile-input" type="tel" placeholder="09..." value={donorForm.phone} onChange={e => setDonorForm({...donorForm, phone: e.target.value})} />
          </div>
          <div className="mobile-input-group">
            <label className="mobile-label">Email (Optional)</label>
            <input className="mobile-input" type="email" placeholder="example@mail.com" value={donorForm.email} onChange={e => setDonorForm({...donorForm, email: e.target.value})} />
          </div>
          <button className="mobile-submit-btn" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Donor'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogPledge}>
          <div className="mobile-input-group">
            <label className="mobile-label">Select Donor</label>
            <select 
              className="mobile-select" 
              required
              value={pledgeForm.donorId}
              onChange={e => setPledgeForm({...pledgeForm, donorId: e.target.value})}
            >
              <option value="">-- Select One --</option>
              {donors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="mobile-input-group">
            <label className="mobile-label">Monthly Amount (ETB)</label>
            <input 
              className="mobile-input" 
              type="number" 
              required 
              placeholder="500"
              value={pledgeForm.amount}
              onChange={e => setPledgeForm({...pledgeForm, amount: e.target.value})}
            />
          </div>
          <div className="mobile-input-group">
            <label className="mobile-label">Format / Frequency</label>
            <select 
              className="mobile-select"
              value={pledgeForm.format}
              onChange={e => setPledgeForm({...pledgeForm, format: e.target.value})}
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="ONE_TIME">One Time Gift</option>
            </select>
          </div>
          <button className="mobile-submit-btn" type="submit" disabled={loading}>
            {loading ? 'Logging...' : 'Register Pledge'}
          </button>
        </form>
      )}
    </div>
  );
};

export default PsrHub;
