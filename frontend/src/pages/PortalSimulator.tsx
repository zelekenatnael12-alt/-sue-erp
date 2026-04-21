import { useState } from 'react';
import ExecutiveDashboard from './dashboards/ExecutiveDashboard';
import RegionalDashboard from './dashboards/RegionalDashboard';
import SubRegionalDashboard from './dashboards/SubRegionalDashboard';
import AreaDashboard from './dashboards/AreaDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import './PortalSimulator.css';

type PortalRole =
  | 'EXECUTIVE'
  | 'REGIONAL'
  | 'SUB_REGIONAL'
  | 'AREA_STAFF'
  | 'ADMIN';

const ROLES: { value: PortalRole; label: string; icon: string; color: string; desc: string }[] = [
  { value: 'EXECUTIVE',    label: 'National Executive',       icon: '🌟', color: '#1e40af', desc: 'National HQ — all-regions KPI command centre' },
  { value: 'REGIONAL',     label: 'Regional Coordinator',     icon: '🗺️', color: '#15803d', desc: 'Regional portal — sub-region reports & approvals' },
  { value: 'SUB_REGIONAL', label: 'Sub-Regional Coordinator', icon: '📍', color: '#7c3aed', desc: 'Sub-regional hub — area submissions & oversight' },
  { value: 'AREA_STAFF',   label: 'Area Coordinator',         icon: '🏫', color: '#ea580c', desc: 'Area portal — school data, PSR, field reports' },
  { value: 'ADMIN',        label: 'System Administrator',     icon: '🛡️', color: '#475569', desc: 'Admin dashboard — users, settings, audit logs' },
];

export default function PortalSimulator() {
  const [activeRole, setActiveRole] = useState<PortalRole>('EXECUTIVE');
  const current = ROLES.find(r => r.value === activeRole)!;

  return (
    <div className="sim-shell">
      {/* ── Simulator Header Bar ── */}
      <div className="sim-bar">
        <div className="sim-bar__brand">
          <span className="sim-bar__icon">✦</span>
          <div>
            <strong>SU Ethiopia ERP</strong>
            <span>Portal Simulator</span>
          </div>
        </div>

        <div className="sim-bar__tabs">
          {ROLES.map(r => (
            <button
              key={r.value}
              className={`sim-tab ${activeRole === r.value ? 'sim-tab--active' : ''}`}
              style={activeRole === r.value ? { borderColor: r.color, color: r.color } : {}}
              onClick={() => setActiveRole(r.value)}
              title={r.desc}
            >
              <span className="sim-tab__icon">{r.icon}</span>
              <span className="sim-tab__label">{r.label}</span>
            </button>
          ))}
        </div>

        <div className="sim-bar__badge" style={{ background: current.color + '22', color: current.color }}>
          <span>{current.icon}</span>
          <span>Viewing as <strong>{current.label}</strong></span>
        </div>
      </div>

      {/* ── Portal Content ── */}
      <div className="sim-content">
        {activeRole === 'EXECUTIVE'    && <ExecutiveDashboard />}
        {activeRole === 'REGIONAL'     && <RegionalDashboard />}
        {activeRole === 'SUB_REGIONAL' && <SubRegionalDashboard />}
        {activeRole === 'AREA_STAFF'   && <AreaDashboard />}
        {activeRole === 'ADMIN'        && <AdminDashboard />}
      </div>
    </div>
  );
}
