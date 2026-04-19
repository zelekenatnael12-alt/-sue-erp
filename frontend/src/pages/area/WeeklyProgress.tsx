import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { areaApi } from '../../api/areaApi';
import { useAutoSave } from '../../hooks/useAutoSave';
import { persistenceService } from '../../services/persistenceService';
import './AreaForms.css';

const WeeklyProgress: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [metrics, setMetrics] = useState({
    schoolsVisited: 0,
    meetingsHeld: 0,
    fellowshipsVisited: 0
  });

  const adjust = (key: keyof typeof metrics, amount: number) => {
    setMetrics({ ...metrics, [key]: Math.max(0, metrics[key] + amount) });
  };

  // Phase G Remediation: Offline Persistence
  useAutoSave('weekly_progress_draft', metrics);

  React.useEffect(() => {
    const loadDraft = async () => {
      const draft = await persistenceService.getDraft('weekly_progress_draft');
      if (draft && draft.data) {
        setMetrics(draft.data);
      }
    };
    loadDraft();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await areaApi.logWeeklyProgress(metrics);
      await persistenceService.clearDraft('weekly_progress_draft');
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
        <span className="material-symbols-outlined success-icon">speed</span>
        <h2 className="area-form-title">Weekly Update Logged!</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Your performance metrics have been updated. Keep up the great work!
        </p>
        <button className="mobile-submit-btn" onClick={() => navigate(-1)}>
          Return
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
        <h1 className="area-form-title">Weekly Progress</h1>
      </header>

      <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '0.95rem' }}>
        Log your impact for the past 7 days. This should take less than 30 seconds.
      </p>

      {error && <div style={{ color: '#ef4444', padding: '12px', background: '#fee2e2', borderRadius: '12px', marginBottom: '20px' }}>{error}</div>}

      <div className="metrics-container">
        {[
          { label: 'Schools Visited', key: 'schoolsVisited' as const, icon: 'school' },
          { label: 'Meetings Held', key: 'meetingsHeld' as const, icon: 'groups' },
          { label: 'Fellowships Visited', key: 'fellowshipsVisited' as const, icon: 'church' }
        ].map(m => (
          <div key={m.key} className="metric-row">
            <div className="metric-info">
              <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>{m.icon}</span>
              <span className="metric-label">{m.label}</span>
            </div>
            <div className="metric-controls">
              <button className="count-btn" onClick={() => adjust(m.key, -1)}>−</button>
              <span className="count-val">{metrics[m.key]}</span>
              <button className="count-btn" onClick={() => adjust(m.key, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <button className="mobile-submit-btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: '40px' }}>
        {loading ? 'Logging...' : 'Log Weekly Update'}
      </button>

      <style>{`
        .metrics-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .metric-row {
          background: #f8fafc;
          padding: 20px;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #f1f5f9;
        }
        .metric-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .metric-label {
          font-weight: 700;
          color: #1e293b;
        }
        .metric-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          background: white;
          padding: 4px;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .count-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: #f1f5f9;
          color: #1e293b;
          font-size: 1.25rem;
          font-weight: 800;
          cursor: pointer;
        }
        .count-val {
          font-weight: 800;
          font-size: 1.2rem;
          min-width: 30px;
          text-align: center;
          color: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default WeeklyProgress;
