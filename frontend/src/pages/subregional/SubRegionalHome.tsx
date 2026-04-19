import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './SubRegional.css';
import '../area/AreaPortal.css';

interface DashboardStats {
  psr: number;
  healthBoard: {
    coveragePercent: number;
    totalAssociates: number;
    vacantAreas: number;
  };
  inbox: {
    id: number;
    title: string;
    type: string;
    date: string;
  }[];
  demographics: {
    sue: number;
    other: number;
    none: number;
    total: number;
  };
}

const SubRegionalHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/erp/api/sub-regional/dashboard', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching sub-regional data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = stats ? circumference - (stats.psr / 100) * circumference : circumference;

  if (loading) return <div className="loading-state">Syncing Command Center...</div>;

  return (
    <div className="sub-regional-home">
      {/* Section 1: Profile Header with Personal PSR */}
      <header className="profile-header">
        <div className="psr-ring-container" style={{ width: '80px', height: '80px', marginRight: '16px' }}>
          <svg width="80" height="80" viewBox="0 0 120 120">
            <circle className="psr-ring-background" cx="60" cy="60" r={radius} />
            <circle 
              className="psr-ring-fill" 
              cx="60" cy="60" r={radius} 
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="psr-percentage" style={{ fontSize: '1rem' }}>{stats?.psr || 0}%</div>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user?.name || 'Sub-Regional Coordinator'}</h1>
          <span className="stat-badge">Manager • {user?.subRegion}</span>
        </div>
      </header>

      {/* Section 2: Ministry Health Board */}
      <section className="health-board">
        <div className="health-board__header">
          <h2 className="health-board__title">Ministry Health</h2>
          <span className="material-symbols-outlined" style={{ color: '#64748b' }}>monitoring</span>
        </div>
        
        <div className="coverage-metric">
          <div className="coverage-label">
            <span>SUE Fellowship Coverage</span>
            <span>{stats?.healthBoard.coveragePercent || 0}%</span>
          </div>
          <div className="coverage-bar">
            <div className="coverage-fill" style={{ width: `${stats?.healthBoard.coveragePercent || 0}%` }} />
          </div>
        </div>

        <div className="health-stats">
          <div className="stat-pill">
            <span className="stat-pill__val">{stats?.healthBoard.totalAssociates || 0}</span>
            <span className="stat-pill__label">Active Associates</span>
          </div>
          <div className="stat-pill" style={{ borderLeft: stats?.healthBoard.vacantAreas ? '4px solid #ef4444' : '1px solid #f1f5f9' }}>
            <span className="stat-pill__val">{stats?.healthBoard.vacantAreas || 0}</span>
            <span className="stat-pill__label">Vacant Areas</span>
          </div>
        </div>
      </section>

      {/* Section 3: Manager Inbox */}
      <section className="manager-inbox">
        <div className="inbox-header">
          <h3 className="inbox-title">Approval Inbox</h3>
          {stats?.inbox.length ? <span className="inbox-badge">{stats.inbox.length} NEW</span> : null}
        </div>

        {stats?.inbox.length ? (
          <div className="inbox-list">
            {stats.inbox.map(item => (
              <div key={item.id} className="inbox-item">
                <div className="inbox-item__info">
                  <span className="inbox-item__title">{item.title}</span>
                  <span className="inbox-item__date">{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>chevron_right</span>
              </div>
            ))}
            <button className="view-all-btn">View All Team Approvals</button>
          </div>
        ) : (
          <div className="inbox-zero">
            <span className="material-symbols-outlined">task_alt</span>
            <p style={{ fontWeight: 800, color: '#10b981', marginTop: '8px' }}>Inbox Zero - Great Job!</p>
          </div>
        )}
      </section>

      {/* Section 4: Quick Action Grid */}
      <div className="sub-action-grid">
        <button className="sub-tile" onClick={() => navigate('/sub-regional/create-event')}>
          <span className="sub-tile__icon">📅</span>
          <span className="sub-tile__label">Create Event</span>
        </button>
        <button className="sub-tile" onClick={() => navigate('/sub-regional/proxy-school')}>
          <span className="sub-tile__icon">🏫</span>
          <span className="sub-tile__label">Proxy School Entry</span>
        </button>
        <button className="sub-tile" onClick={() => navigate('/area/announcements')}>
          <span className="sub-tile__icon">📢</span>
          <span className="sub-tile__label">Post Announcement</span>
        </button>
        <button className="sub-tile" onClick={() => navigate('/sub-regional/manager-form?mode=associate')}>
          <span className="sub-tile__icon">👤</span>
          <span className="sub-tile__label">Register Associate</span>
        </button>
        <button className="sub-tile" onClick={() => navigate('/sub-regional/manager-form?mode=area')}>
          <span className="sub-tile__icon">🗺️</span>
          <span className="sub-tile__label">Propose New Area</span>
        </button>
        <button className="sub-tile" onClick={() => navigate('/area/psr')}>
          <span className="sub-tile__icon">💸</span>
          <span className="sub-tile__label">My PSR Donors</span>
        </button>
      </div>
    </div>
  );
};

export default SubRegionalHome;
