import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import './../media/Media.css';

const StaffHome: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await api.me();
      setUser(userData);

      const historyData = await api.getStaffHistory();
      setHistory(historyData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="media-portal"><div className="media-content">Loading workspace...</div></div>;

  return (
    <div className="media-portal">
      <main className="media-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header className="staff-header">
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>National Staff Portal</div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px' }}>Welcome, {user?.full_name}</h1>
          <div className="staff-dept-badge">{user?.subDepartment || 'Departmental Specialist'}</div>
        </header>

        <div className="media-metric-grid">
          <div className="media-card" style={{ cursor: 'pointer', transition: '0.2s' }} onClick={() => navigate('/staff-portal/report')}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ margin: 0 }}>Submit Report</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>Document departmental achievements and KPIs.</p>
          </div>
          <div className="media-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/partnership')}>
             <div style={{ fontSize: '32px', marginBottom: '16px' }}>💸</div>
            <h3 style={{ margin: 0 }}>My PSR Donors</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>View your donor resource network components.</p>
          </div>
          <div className="media-card">
             <div style={{ fontSize: '32px', marginBottom: '16px' }}>🏛️</div>
            <h3 style={{ margin: 0 }}>Staff Resources</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>Access national policies and document templates.</p>
          </div>
        </div>

        <section className="media-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #1e293b' }}>
            <h2 style={{ fontSize: '18px', margin: 0 }}>Your Submission History</h2>
          </div>
          <table className="log-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600 }}>{h.title}</td>
                  <td>{h.subDepartment}</td>
                  <td>
                    <span style={{ 
                      color: h.status === 'APPROVED' ? '#10b981' : '#f59e0b',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      ● {h.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: '#64748b' }}>{new Date(h.dateSubmitted).toLocaleDateString()}</td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>No departmental reports submitted yet.</td></tr>}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default StaffHome;
