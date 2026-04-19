import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';
import './../partnership/Growth.css';

const CapacityHome: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [vault, setVault] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const statsData = await api.getCapacityDashboard();
      setStats(statsData);

      const vaultData = await api.getCapacitySections();
      setVault(vaultData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="growth-portal"><div className="empty-data">Loading Capacity Data...</div></div>;

  return (
    <div className="growth-portal">
      {/* Main content */}
      <main className="growth-main" style={{ marginLeft: 0 }}>
        <header className="growth-header">
          <h1>Staff Capacity Hub</h1>
          <p>Internal training, volunteer mobilization, and professional development.</p>
        </header>

        <div className="growth-metrics">
          <div className="growth-card">
            <div className="growth-card-label">Active Volunteers</div>
            <div className="growth-card-value">{stats?.totalVolunteers || 0}</div>
          </div>
          <div className="growth-card">
            <div className="growth-card-label">Assigned National Staff</div>
            <div className="growth-card-value">{stats?.nationalStaff || 0}</div>
          </div>
          <div className="growth-card">
            <div className="growth-card-label">Training Programs</div>
            <div className="growth-card-value">{stats?.activeTrainingPrograms || 0}</div>
          </div>
          <div className="growth-card">
            <div className="growth-card-label">Manpower Index</div>
            <div className="growth-card-value">{stats?.manpowerIndex?.toFixed(0) || 0}</div>
          </div>
        </div>

        <section>
          <h2 style={{ fontSize: '20px', marginBottom: '32px' }}>Staff Development Vault</h2>
          <div className="vault-timeline">
            {vault.length === 0 && <div className="empty-data">No training requests or development notes found.</div>}
            {vault.map((entry) => (
              <div className="vault-entry" key={entry.id}>
                <div className="vault-date">{entry.month} / {entry.region}</div>
                <div className="vault-body">
                  <div className="vault-author">{entry.author.full_name}</div>
                  {entry.staffPersonalDevelopment && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 800 }}>DEV NOTE</span>
                      <div className="vault-text">{entry.staffPersonalDevelopment}</div>
                    </div>
                  )}
                  {entry.trainingNeeds && (
                    <div>
                      <span style={{ fontSize: '10px', color: '#f43f5e', fontWeight: 800 }}>TRAINING NEED</span>
                      <div className="vault-text">{entry.trainingNeeds}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CapacityHome;
