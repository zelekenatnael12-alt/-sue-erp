import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import './Growth.css';

const PartnershipHome: React.FC = () => {
  const [psrHealth, setPsrHealth] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const healthData = await api.getPsrHealth();
      setPsrHealth(healthData);

      const conflictsData = await api.getDonorConflicts();
      setConflicts(conflictsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resolveConflict = async (donorId: string, staffId: number) => {
    try {
      await api.resolveDonorConflict(donorId, staffId);
      loadData();
    } catch (err) {
      alert('Resolution failed');
    }
  };

  if (loading) return <div className="growth-portal"><div className="empty-data">Loading Revenue Metrics...</div></div>;

  return (
    <div className="growth-portal">
      {/* Main content */}
      <main className="growth-main" style={{ marginLeft: 0 }}>
        <header className="growth-header">
          <h1>Partnership & Resource Hub</h1>
          <p>National donor base management and staff funding health.</p>
        </header>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>PSR Funding Health (Nationwide)</h2>
          <div className="psr-grid">
            {psrHealth.map(staff => (
              <div className="psr-card" key={staff.id}>
                <div className="psr-card-top">
                  <div className="psr-name">{staff.name}</div>
                  <div className="psr-region">{staff.region}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>{staff.department || 'National Staff'}</div>
                <div className="psr-bar-bg">
                  <div className="psr-bar-fill" style={{ width: `${staff.psrPercentage}%` }}></div>
                </div>
                <div className="psr-percent">{staff.psrPercentage.toFixed(1)}% Funded</div>
              </div>
            ))}
          </div>
        </section>

        <section className="conflict-desk">
          <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Conflict Resolution Desk</h2>
          {conflicts.length === 0 && <div className="empty-data">No donor resource conflicts detected.</div>}
          {conflicts.map((group, idx) => (
            <div className="conflict-item" key={idx}>
              <div className="conflict-header">
                <div className="conflict-id">Flag: Duplicate Contact ({group.identifier})</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Dispute found in {group.donors.length} records</div>
              </div>
              <div className="conflict-comparo">
                {group.donors.map((d: any) => (
                  <div className="donor-blob" key={d.id}>
                    <h4>Registrar: Staff #{d.areaStaffId}</h4>
                    <p><strong>Donor:</strong> {d.fullName}</p>
                    <p><strong>Church:</strong> {d.church || '-'}</p>
                    <button className="resolve-btn" onClick={() => resolveConflict(d.id, d.areaStaffId)}>
                      Confirm Sole Registrar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default PartnershipHome;
