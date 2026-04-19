import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, Announcement } from '../../api/api';
import './AreaPortal.css';

interface DashboardStats {
  schoolCount: number;
  associateCount: number;
  psrPercentage: number;
  unreadAnnouncementsCount: number;
  impact: {
    totalMembers: number;
    totalSmallGroups: number;
  };
}

const AreaHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [syncHealth, setSyncHealth] = useState<{ failures: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, annData, syncData] = await Promise.all([
          api.getAreaDashboardStats(),
          api.getAnnouncements(),
          api.getAreaSyncHealth()
        ]);
        setStats(statsData);
        setAnnouncements(annData);
        setSyncHealth(syncData);
      } catch (error) {
        console.error('Error fetching area data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const initials = (name?: string) => name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'AS';

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = stats ? circumference - (stats.psrPercentage / 100) * circumference : circumference;

  const getMotivation = (percent: number) => {
    if (percent === 0) return "Seed stage: Your first donor is waiting to be invited!";
    if (percent < 30) return "Sprouting: Great start! Keep sharing the vision.";
    if (percent < 70) return "Growth phase: You're over halfway to full support!";
    if (percent < 100) return "Ready for harvest: Almost there, focus on the final goal.";
    return "Full Abundance: You are fully supported for the mission!";
  };

  if (loading) return <div className="area-home"><div className="loading-shimmer">Loading Dashboard...</div></div>;

  return (
    <div className="area-home">
      {/* Section 1: Profile Header */}
      <header className="profile-header">
        <div className="profile-avatar">{initials(user?.name)}</div>
        <div className="profile-info">
          <h1 className="profile-name">{user?.name || 'Area Staff'}</h1>
          <div className="profile-badges">
            <span className="stat-badge">🏫 {stats?.schoolCount || 0} Schools</span>
            <span className="stat-badge">👤 {stats?.associateCount || 0} Associates</span>
            <span className="stat-badge impact-badge">👨‍👩‍👧‍👦 {stats?.impact.totalMembers || 0} Members</span>
            <span className="stat-badge impact-badge">🌱 {stats?.impact.totalSmallGroups || 0} Small Groups</span>
          </div>
        </div>
      </header>

      {/* Section 2: Sync & Notifications */}
      <div className="status-banners">
        {syncHealth && syncHealth.failures > 0 && (
          <div className="notif-banner" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#fb7185', marginBottom: '12px' }}>
            <span className="material-symbols-outlined">sync_problem</span>
            <span>⚠️ {syncHealth.failures} Data points pending manual reconciliation.</span>
          </div>
        )}
        
        {stats && stats.unreadAnnouncementsCount > 0 && (
          <div className="notif-banner">
            <span className="material-symbols-outlined">campaign</span>
            <span>📢 {stats.unreadAnnouncementsCount} New Announcements</span>
          </div>
        )}
      </div>

      {/* Section 3: Bulletin Carousel */}
      {announcements.length > 0 && (
        <div className="bulletin-carousel">
          {announcements.map((ann: Announcement) => (
            <div key={ann.id} className="announcement-card">
              <div className="announcement-card__meta">
                <span>{ann.author?.full_name || 'System'}</span>
                <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="announcement-card__title">{ann.title}</h4>
              <p className="announcement-card__content">{ann.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Section 4: PSR Ring */}
      <section className="psr-section" style={{ textAlign: 'center' }}>
        <div className="psr-ring-container">
          <svg className="psr-ring-svg" width="120" height="120">
            <circle className="psr-ring-background" cx="60" cy="60" r={radius} />
            <circle 
              className="psr-ring-fill" 
              cx="60" 
              cy="60" 
              r={radius} 
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ stroke: (stats?.psrPercentage || 0) > 80 ? '#10b981' : '#6366f1' }}
            />
          </svg>
          <div className="psr-percentage">{stats?.psrPercentage || 0}%</div>
        </div>
        <div className="psr-label" style={{ fontWeight: 800, marginTop: '8px' }}>Ministry Support Level</div>
        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', maxWidth: '200px', margin: '4px auto' }}>
          {getMotivation(stats?.psrPercentage || 0)}
        </p>
      </section>

      {/* Section 5: Achievements */}
      <section style={{ padding: '0 24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Ministerial Milestones</h3>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{ minWidth: '80px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: (stats?.schoolCount || 0) >= 1 ? 'rgba(99, 102, 241, 0.1)' : '#f1f5f9', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto 8px', filter: (stats?.schoolCount || 0) >= 1 ? 'grayscale(0)' : 'grayscale(1)', opacity: (stats?.schoolCount || 0) >= 1 ? 1 : 0.3 }}>🏅</div>
            <div style={{ fontSize: '10px', fontWeight: 800 }}>Pioneer</div>
          </div>
          <div style={{ minWidth: '80px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: (stats?.associateCount || 0) >= 5 ? 'rgba(16, 185, 129, 0.1)' : '#f1f5f9', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto 8px', filter: (stats?.associateCount || 0) >= 5 ? 'grayscale(0)' : 'grayscale(1)', opacity: (stats?.associateCount || 0) >= 5 ? 1 : 0.3 }}>🛡️</div>
            <div style={{ fontSize: '10px', fontWeight: 800 }}>Guardian</div>
          </div>
          <div style={{ minWidth: '80px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: (stats?.impact.totalMembers || 0) > 100 ? 'rgba(245, 158, 11, 0.1)' : '#f1f5f9', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto 8px', filter: (stats?.impact.totalMembers || 0) > 100 ? 'grayscale(0)' : 'grayscale(1)', opacity: (stats?.impact.totalMembers || 0) > 100 ? 1 : 0.3 }}>🔥</div>
            <div style={{ fontSize: '10px', fontWeight: 800 }}>Catalyst</div>
          </div>
        </div>
      </section>

      {/* Section 6: Quick Action Grid */}
      <div className="quick-action-grid">
        <button className="action-tile" onClick={() => navigate('/area/weekly')}>
          <span className="action-icon">⚡</span>
          <span className="action-label">Log Weekly Progress</span>
        </button>
        <button className="action-tile" onClick={() => navigate('/area/register-school')}>
          <span className="action-icon">🏫</span>
          <span className="action-label">Register School</span>
        </button>
        <button className="action-tile" onClick={() => navigate('/area/register-personnel')}>
          <span className="action-icon">👤</span>
          <span className="action-label">Register Personnel</span>
        </button>
        <button className="action-tile" onClick={() => navigate('/area/planning')}>
          <span className="action-icon">📄</span>
          <span className="action-label">Draft Plan / Report</span>
        </button>
        <button className="action-tile" onClick={() => navigate('/area/psr')}>
          <span className="action-icon">💸</span>
          <span className="action-label">My PSR Donors</span>
        </button>
        <button className="action-tile" onClick={() => navigate('/area/id-services')}>
          <span className="action-icon">🆔</span>
          <span className="action-label">Digital ID Services</span>
        </button>
      </div>
    </div>
  );
};

export default AreaHome;
