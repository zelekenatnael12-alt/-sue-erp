import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, DeploymentRegion, DeploymentSubRegion, DeploymentArea, DeploymentStaff } from '../../api/api';
import './SouthEthiopiaTree.css';

// ─── Recursive Tree Sub-Components ──────────────────────────────────────────

function StaffChip({ staff }: { staff: DeploymentStaff }) {
  return (
    <div className="set-node set-node-area active set-node-blue" style={{ marginBottom: '0.5rem' }}>
      <div className="set-avatar set-avatar-blue">{staff.avatar}</div>
      <div className="set-node-info">
        <strong>{staff.full_name}</strong>
        <span>{staff.role}</span>
      </div>
    </div>
  );
}

function AreaNode({ area }: { area: DeploymentArea }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="set-area-col">
      <div className="set-connector-to-area active-line" />
      <div
        className="set-node set-node-area active set-node-teal"
        onClick={() => setExpanded(e => !e)}
        title={`${area.name} — ${area.staff.length} staff`}
      >
        <div className="set-avatar set-avatar-teal">
          {area.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="set-node-info">
          <strong>{area.name}</strong>
          <span>{area.staff.length} Area Staff</span>
        </div>
        <div className="set-notif-bubble">{area.staff.length > 0 ? `${area.staff.length} staff` : 'Empty'}</div>
        <span className="material-symbols-outlined set-drill-icon">
          {expanded ? 'expand_less' : 'open_in_new'}
        </span>
      </div>
      {expanded && area.staff.length > 0 && (
        <div style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          {area.staff.map(s => <StaffChip key={s.id} staff={s} />)}
        </div>
      )}
    </div>
  );
}

function SubRegionNode({ sr }: { sr: DeploymentSubRegion }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ width: '100%' }}>
      <div className="set-level set-level-2">
        <div
          className="set-node set-node-subregional active"
          onClick={() => setExpanded(e => !e)}
          title="Click to expand/collapse"
        >
          <div className="set-avatar set-avatar-subregional">
            {sr.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="set-node-info">
            <strong>{sr.name}</strong>
            <span>Sub-Region</span>
          </div>
          <div className="set-notif-bubble">
            {sr.staff.map(s => s.full_name).join(', ') || `${sr.areas.length} Areas`}
          </div>
          <span className="material-symbols-outlined set-drill-icon">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </div>

      {expanded && (
        <>
          <div className="set-branch-connector">
            <div className="set-branch-vertical active-line" />
            <div className="set-branch-horizontal active-line" />
          </div>
          <div className="set-level set-level-3">
            {sr.areas.map((area) => (
              <AreaNode key={area.name} area={area} />
            ))}
            {sr.areas.length === 0 && (
              <div className="set-empty-card">
                <span className="material-symbols-outlined">person_off</span>
                <p>No Areas Assigned</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function RegionNode({ region }: { region: DeploymentRegion }) {
  const [expanded, setExpanded] = useState(true);
  const totalStaff = region.staff.length +
    region.subRegions.reduce((acc, sr) =>
      acc + sr.staff.length + sr.areas.reduce((a2, ar) => a2 + ar.staff.length, 0), 0);

  return (
    <div className="set-canvas" style={{ marginBottom: '2rem', border: '1px solid rgba(139,92,246,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
      {/* L1: Regional Node */}
      <div className="set-level set-level-1">
        <div
          className="set-node set-node-regional active"
          onClick={() => setExpanded(e => !e)}
          title="Click to expand/collapse region"
        >
          <div className="set-avatar set-avatar-regional">
            {region.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="set-node-info">
            <strong>{region.name}</strong>
            <span>{region.staff.map(s => `${s.full_name} (${s.role})`).join(' • ') || 'Region'}</span>
          </div>
          <div className="set-node-badge">{totalStaff} Active Staff</div>
          <span className="material-symbols-outlined set-drill-icon">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </div>

      {expanded && (
        <>
          <div className="set-connector-col">
            <div className="set-connector-line active-line" />
          </div>

          {/* L2: Sub-Regions */}
          {region.subRegions.map((sr) => (
            <SubRegionNode key={sr.name} sr={sr} />
          ))}

          {region.subRegions.length === 0 && (
            <div className="set-empty-state-row">
              <div className="set-empty-card">
                <span className="material-symbols-outlined">person_off</span>
                <p>No Sub-Regions Assigned</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SouthEthiopiaTree() {
  const navigate = useNavigate();
  const [tree, setTree] = useState<DeploymentRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDeploymentTree()
      .then(data => {
        setTree(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message || 'Failed to load deployment tree');
      })
      .finally(() => setLoading(false));
  }, []);

  const totalStaff = tree.reduce((acc, r) =>
    acc + r.staff.length +
    r.subRegions.reduce((a2, sr) =>
      a2 + sr.staff.length + sr.areas.reduce((a3, ar) => a3 + ar.staff.length, 0), 0), 0);

  return (
    <div className="set-container">
      {/* ─── Header ─────────────────────────────────── */}
      <div className="set-header">
        <button className="set-back" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="set-title">Organization — Live Deployment Tree</h1>
          <p className="set-subtitle">
            {loading ? 'Loading...' : `${tree.length} Regions • ${totalStaff} Active Staff`}
          </p>
        </div>
        <div className="set-live-badge">
          <span className="set-live-dot" /> LIVE
        </div>
      </div>

      {/* ─── Loading ─────────────────────────────────── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', animation: 'spin 1s linear infinite' }}>sync</span>
          <p>Building deployment tree from database...</p>
        </div>
      )}

      {/* ─── Error ─────────────────────────────────── */}
      {error && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>error</span>
          <p>{error}</p>
          <button
            className="set-btn set-btn-approve"
            onClick={() => { setLoading(true); api.getDeploymentTree().then(setTree).catch(e => setError(e.message)).finally(() => setLoading(false)); }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── Empty ─────────────────────────────────── */}
      {!loading && !error && tree.length === 0 && (
        <div className="set-empty-state-row">
          <div className="set-empty-card">
            <span className="material-symbols-outlined">account_tree</span>
            <p>ምንም መረጃ አልተገኘም</p>
            <span>No Active Staff Found in Database</span>
          </div>
        </div>
      )}

      {/* ─── Dynamic Tree ────────────────────────────── */}
      {!loading && !error && tree.map(region => (
        <RegionNode key={region.name} region={region} />
      ))}
    </div>
  );
}
