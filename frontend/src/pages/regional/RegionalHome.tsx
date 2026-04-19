import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { regionalApi } from '../../api/regionalApi';
import { useAuth } from '../../context/AuthContext';
import GovernanceAlert from '../../components/regional/GovernanceAlert';
import NotificationCenter from '../../components/NotificationCenter';
import './Regional.css';

const RegionalHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statData, boardData] = await Promise.all([
            regionalApi.getDashboardStats(),
            regionalApi.getAdvisoryTeam()
        ]);
        setStats(statData);
        setBoard(boardData);
      } catch (error) {
        console.error('Failed to fetch regional data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading-container">Gathering regional intelligence...</div>;
  }

  const ministryHealth = stats?.ministryHealth || { activeSchools: 0, totalSchools: 0, coveragePercentage: 0 };
  const assetStats = stats?.assets || { total: 0, repairNeeded: 0 };
  const governance = stats?.governance || { totalMembers: 0 };
  const financials = stats?.financials || { raised: 0, expended: 0 };

  return (
    <div className="regional-home">
      <header className="regional-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="regional-greeting">Director Command</h1>
            <p className="regional-subtext">{user?.region} Regional Jurisdiction</p>
          </div>
          <NotificationCenter />
        </div>
      </header>

      <GovernanceAlert members={board} />

      {/* Regional Health Card */}
      <div className="coverage-card">
        <div className="coverage-label">
          <span>MINISTRY COVERAGE</span>
          <span>{ministryHealth.coveragePercentage}%</span>
        </div>
        <div className="coverage-bar-bg">
          <div 
            className="coverage-bar-fill" 
            style={{ width: `${ministryHealth.coveragePercentage}%` }}
          ></div>
        </div>
        <div style={{ marginTop: '12px', fontSize: '0.75rem', opacity: 0.8 }}>
          {ministryHealth.activeSchools} active SUE schools out of {ministryHealth.totalSchools} recorded.
        </div>
      </div>

      {/* Institutional Verification Progress (Phase G) */}
      <div className="exec-inbox" style={{ borderLeft: '4px solid #f59e0b' }}>
        <h2 className="section-title">DATA ACCOUNTABILITY</h2>
        <div style={{ marginTop: '12px', display: 'flex', gap: '24px' }}>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b' }}>{ministryHealth.verification?.verified || 0}</span>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 800 }}>VERIFIED SCHOOLS</span>
          </div>
          <div style={{ opacity: (ministryHealth.verification?.pending || 0) > 0 ? 1 : 0.5 }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#94a3b8' }}>{ministryHealth.verification?.pending || 0}</span>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 800 }}>AWAITING AUDIT</span>
          </div>
        </div>
      </div>

      {/* Regional Impact Rollup */}
      <div className="exec-inbox" style={{ background: '#f0f9ff', borderColor: '#0ea5e9' }}>
        <h2 className="section-title" style={{ color: '#0369a1' }}>REGIONAL MINISTRY IMPACT</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>TOTAL MEMBERS</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0369a1' }}>{(ministryHealth.totalMembers || 0).toLocaleString()}</span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>SMALL GROUPS</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0891b2' }}>{(ministryHealth.totalSmallGroups || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Oversight Grid */}
      <div className="oversight-grid">
        <div className="oversight-tile">
          <span className="oversight-icon">🏍️</span>
          <span className="oversight-value">{assetStats.total}</span>
          <span className="oversight-label">Assets</span>
        </div>
        <div className="oversight-tile" onClick={() => navigate('/regional/advisory')}>
          <span className="oversight-icon">👥</span>
          <span className="oversight-value">{governance.totalMembers}</span>
          <span className="oversight-label">RAT Board</span>
        </div>
        <div className="oversight-tile">
          <span className="oversight-icon">📍</span>
          <span className="oversight-value">2</span> {/* Hardcoded for now as per user request mapping */}
          <span className="oversight-label">Vacant</span>
        </div>
      </div>

      {/* Executive Inbox */}
      <div className="exec-inbox" onClick={() => navigate('/regional/approvals')}>
        <div className="section-header">
          <h2 className="section-title">EXECUTIVE INBOX</h2>
          {stats?.inboxCount > 0 && <span className="badge-count">{stats.inboxCount} PENDING</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '0.85rem' }}>
          <span className="material-symbols-outlined">mark_email_unread</span>
          <span>Sub-regional quarterly reports awaiting your review.</span>
        </div>
      </div>

      {/* Financial Health Summary (Addon) */}
      <div className="exec-inbox" style={{ borderLeft: '4px solid #10b981' }} onClick={() => navigate('/regional/treasury')}>
        <h2 className="section-title" style={{ marginBottom: '12px' }}>REGIONAL MINISTRY FUNDS</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>RAISED (Mobiliized)</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>{(financials?.raised || 0).toLocaleString()} ETB</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 800 }}>EXPENDED (Invested)</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#dc2626' }}>{(financials?.expended || 0).toLocaleString()} ETB</span>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', marginTop: '24px' }}>Strategic Operations</h3>
      <div className="action-grid">
        <div className="action-btn" onClick={() => navigate('/regional/assets')}>
          <div className="action-icon">📋</div>
          <span className="action-text">Asset Registry</span>
        </div>
        <div className="action-btn" onClick={() => navigate('/regional/advisory')}>
          <div className="action-icon">👥</div>
          <span className="action-text">Advisory Team</span>
        </div>
        <div className="action-btn" onClick={() => navigate('/regional/structural-review')}>
          <div className="action-icon">🗺️</div>
          <span className="action-text">Review Hub</span>
        </div>
        <div className="action-btn" onClick={() => navigate('/regional/treasury')}>
          <div className="action-icon">💸</div>
          <span className="action-text">Treasury</span>
        </div>
      </div>
    </div>
  );
};

export default RegionalHome;
