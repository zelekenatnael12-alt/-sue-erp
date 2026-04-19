import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';
import './NationalHome.css';

interface DashboardStats {
  coveragePercent: number;
  staffCount: number;
  totalAssetValue: number;
  fundsMobilized: number;
  fundsExpended: number;
}

const NationalHome: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingPlans, setPendingPlans] = useState<any[]>([]);
  const [vetoItems, setVetoItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Veto Modal State
  const [selectedVeto, setSelectedVeto] = useState<any | null>(null);
  const [justification, setJustification] = useState('');
  const [vetoing, setVetoing] = useState(false);

  // Drill-down State
  const [drilldown, setDrilldown] = useState<{ metric: string, data: any[] } | null>(null);
  const [loadingDrill, setLoadingDrill] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {

      // 1. Stats
      const statsData = await api.getNationalDashboard();
      setStats(statsData);
      
      // 2. Pending Plans (Inbox)
      const plansData = await api.getMyPlans();
      setPendingPlans(plansData.filter((p: any) => p.status === 'SUBMITTED'));
      
      // 3. Veto Items (Recently Approved)
      const reportsData = await api.getReports();
      setVetoItems(reportsData.filter((r: any) => r.status === 'APPROVED').slice(0, 10));
      
      // 4. Mission Pulse
      const pulseData = await api.getMissionPulse();
      setPulse(pulseData);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVetoSubmit = async () => {
    if (!justification.trim() || !selectedVeto) return;
    setVetoing(true);
    try {
      await api.executeVeto(selectedVeto.id, 'EXPENSE', justification);
      
      setSelectedVeto(null);
      setJustification('');
      fetchDashboard();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setVetoing(false);
    }
  };

  const openDrilldown = async (metric: string) => {
    setLoadingDrill(true);
    setDrilldown({ metric, data: [] });
    try {
      const data = await api.getNationalBreakdown(metric);
      setDrilldown({ metric, data });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDrill(false);
    }
  };

  const Sparkline = ({ color }: { color: string }) => (
    <svg className="stat-sparkline" style={{ color }} viewBox="0 0 100 40" preserveAspectRatio="none">
      <path d="M0,35 Q10,10 20,30 T40,20 T60,35 T80,10 T100,25" />
    </svg>
  );

  if (loading) return <div className="national-portal"><div className="national-loading">Loading Regional Aggregates...</div></div>;

  return (
    <div className="national-portal">
      {/* Main content */}
      <main className="national-main" style={{ marginLeft: 0 }}>
        <header className="national-topbar">
          <div>
            <h1>The National Matrix</h1>
            <span className="topbar-meta">Executive Macro Dashboard • Real-time Monitoring</span>
          </div>
          <div className="topbar-right">
            <div className="clearance-badge">Clearance: Level 5</div>
          </div>
        </header>

        <div className="national-content">
          {error && <div className="national-error">{error}</div>}

          {/* Macro Health Board */}
          <div className="macro-health-grid">
            <div className="macro-stat-card coverage" onClick={() => openDrilldown('coverage')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">📊</div>
              <div className="stat-label">Nationwide Coverage</div>
              <div className="stat-value">{stats?.coveragePercent}%</div>
              <div className="stat-sub">Trend: +2.4% vs last month</div>
              <Sparkline color="#a78bfa" />
            </div>
            <div className="macro-stat-card assets" onClick={() => openDrilldown('assets')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">🏛️</div>
              <div className="stat-label">Total Asset Value</div>
              <div className="stat-value">{(stats?.totalAssetValue || 0) / 1000000}M</div>
              <div className="stat-sub">Portfolio valuation steady</div>
              <Sparkline color="#fbbf24" />
            </div>
            <div className="macro-stat-card staff" onClick={() => openDrilldown('finance')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">💰</div>
              <div className="stat-label">Funds Mobilized</div>
              <div className="stat-value">{(stats?.fundsMobilized || 0) / 1000000}M</div>
              <div className="stat-sub">Mobilization Velocity: High</div>
              <Sparkline color="#34d399" />
            </div>
          </div>

          <div className="national-panel pulse-panel" style={{ marginBottom: '24px' }}>
             <div className="national-panel-header">
                <h3>📡 Mission Pulse <span className="panel-count">LIVE</span></h3>
             </div>
             <div className="national-panel-body">
                <div className="pulse-grid">
                   {pulse.length === 0 && <div className="empty-state">No recent activity pulse.</div>}
                   {pulse.map((item) => (
                      <div className="pulse-card" key={item.id}>
                         <div className="pulse-badge">{item.badge}</div>
                         <div className="pulse-title">{item.title}</div>
                         <div className="pulse-meta">{item.meta}</div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="national-bottom-grid">
            {/* Executive Inbox */}
            <div className="national-panel">
              <div className="national-panel-header">
                <h3>📥 Executive Inbox <span className="panel-count">{pendingPlans.length}</span></h3>
              </div>
              <div className="national-panel-body">
                {pendingPlans.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>No pending regional plans</p>
                  </div>
                ) : (
                  pendingPlans.map((plan) => (
                    <div key={plan.id} className="inbox-item">
                      <div className="inbox-dot plan" />
                      <div className="inbox-item-info">
                        <div className="inbox-item-title">{plan.projectName}</div>
                        <div className="inbox-item-meta">
                          {plan.coordinator?.region || 'Unknown Region'} • Submitted by {plan.coordinator?.name}
                        </div>
                      </div>
                      <span className="inbox-item-type plan">Plan</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Veto Desk */}
            <div className="national-panel veto-panel">
              <div className="national-panel-header">
                <h3>🛡️ The Veto Desk</h3>
                <span className="topbar-meta">Override recently approved items</span>
              </div>
              <div className="national-panel-body">
                {vetoItems.length === 0 ? (
                  <div className="empty-state">
                    <p>No recently approved high-level items</p>
                  </div>
                ) : (
                  vetoItems.map((item) => (
                    <div key={item.id} className="veto-item">
                      <div className="veto-item-info">
                        <div className="veto-item-title">{item.autoName || item.title}</div>
                        <div className="veto-item-meta">
                          ETB {item.ministryExpended?.toLocaleString()} • {item.author?.area} Area
                        </div>
                      </div>
                      <span className="veto-type-badge expense">Expense</span>
                      <button 
                        className="btn-veto"
                        onClick={() => setSelectedVeto(item)}
                      >
                        ✕ Veto Action
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Veto Modal */}
      {selectedVeto && (
        <div className="veto-modal-overlay">
          <div className="national-portal">
          <div className="veto-modal">
            <div className="modal-warning">
              <span className="warn-icon">⚠️</span>
              <p>Executive Overrides are permanent and will be logged for audit. The target item will be reverted to REJECTED.</p>
            </div>
            <h3>Confirm Veto Action</h3>
            <p className="modal-sub">Vetoing: {selectedVeto.autoName || selectedVeto.title}</p>
            
            <textarea 
              placeholder="Provide a justification for this veto override..."
              value={justification}
              onChange={e => setJustification(e.target.value)}
              required
            />

            <div className="veto-modal-actions">
              <button className="btn-cancel-veto" onClick={() => {setSelectedVeto(null); setJustification('');}}>Cancel</button>
              <button 
                className="btn-confirm-veto" 
                disabled={!justification.trim() || vetoing}
                onClick={handleVetoSubmit}
              >
                {vetoing ? 'Processing...' : 'Execute Veto'}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
      {/* Drilldown Modal */}
      {drilldown && (
        <div className="veto-modal-overlay">
          <div className="national-portal" style={{ background: 'transparent' }}>
            <div className="veto-modal" style={{ maxWidth: '600px', width: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '14px', fontWeight: 900 }}>
                  Regional Breakdown: {drilldown.metric}
                </h3>
                <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }} onClick={() => setDrilldown(null)}>✕</button>
              </div>

              {loadingDrill ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#38bdf8' }}>Analyzing Regional Performance...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {drilldown.data.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}>
                      <span style={{ fontWeight: 700 }}>{r.region}</span>
                      <span style={{ color: '#38bdf8', fontWeight: 900 }}>
                        {drilldown.metric === 'coverage' ? `${r.value}%` : `${(r.value / 1000).toFixed(1)}K ETB`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NationalHome;
