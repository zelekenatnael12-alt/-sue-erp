import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/api';
import './AssociatePortal.css';

interface AssociateDashboardData {
  schools: any[];
  impact: {
    totalMembers: number;
    totalSmallGroups: number;
  };
  weeklyLogs: any[];
  stats: {
    schoolCount: number;
  };
}

const AssociateHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<AssociateDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await api.getAssociateDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load associate dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <div className="loading-state">Syncing ministry data...</div>;

  return (
    <div className="associate-home">
      <header className="associate-header">
        <div className="welcome-banner">
          <h1>Welcome, {user?.name.split(' ')[0]}</h1>
          <p>You're impacting {data?.impact.totalMembers} students across {data?.stats.schoolCount} schools.</p>
        </div>
      </header>

      <div className="impact-grid">
        <div className="impact-card">
          <span className="material-symbols-outlined icon-blue">groups</span>
          <div className="impact-info">
            <h3>{data?.impact.totalMembers}</h3>
            <p>Fellowship Members</p>
          </div>
        </div>
        <div className="impact-card">
          <span className="material-symbols-outlined icon-green">hub</span>
          <div className="impact-info">
            <h3>{data?.impact.totalSmallGroups}</h3>
            <p>Active Small Groups</p>
          </div>
        </div>
        <div className="impact-card">
          <span className="material-symbols-outlined icon-gold">school</span>
          <div className="impact-info">
            <h3>{data?.stats.schoolCount}</h3>
            <p>Schools Managed</p>
          </div>
        </div>
      </div>

      <div className="action-strip">
        <button className="action-btn" onClick={() => navigate('/associate/register-school')}>
          <span className="material-symbols-outlined">add_business</span>
          <span>Register School</span>
        </button>
        <button className="action-btn" onClick={() => navigate('/associate/weekly')}>
          <span className="material-symbols-outlined">edit_note</span>
          <span>Log Weekly Progress</span>
        </button>
        <button className="action-btn" onClick={() => navigate('/associate/volunteers')}>
          <span className="material-symbols-outlined">group</span>
          <span>Manage Volunteers</span>
        </button>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>My Schools</h2>
          <button className="text-btn" onClick={() => navigate('/under-construction')}>View All</button>
        </div>
        <div className="school-list">
          {data?.schools.slice(0, 3).map(school => (
            <div key={school.id} className="school-item">
              <div className="school-main">
                <p className="school-name">{school.name}</p>
                <p className="school-meta">{school.memberCount} Members • {school.smallGroupCount} Groups</p>
              </div>
              <span className={`status-badge ${school.status.toLowerCase()}`}>
                {school.status.replace('_', ' ')}
              </span>
            </div>
          ))}
          {data?.schools.length === 0 && (
            <div className="empty-state">No schools registered yet. Start by adding one!</div>
          )}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
        </div>
        <div className="activity-feed">
          {data?.weeklyLogs.map(log => (
            <div key={log.id} className="feed-item">
              <div className="feed-icon">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="feed-content">
                <p>Logged weekly progress for <strong>Week of {new Date(log.createdAt).toLocaleDateString()}</strong></p>
                <p className="feed-time">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          {data?.weeklyLogs.length === 0 && (
            <p className="empty-text">No recent activity logs.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AssociateHome;
