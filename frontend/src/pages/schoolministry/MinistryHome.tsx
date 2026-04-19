import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import './Ministry.css';

const MinistryHome: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const dashboard = await api.getMinistryNationalDashboard();
      setStats(dashboard);
      
      const staffData = await api.getUsers();
      setStaff(staffData.filter((u: any) => u.role === 'NATIONAL_STAFF'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="ministry-portal"><div className="empty-data">Loading National Metrics...</div></div>;

  return (
    <div className="ministry-portal">
      {/* Main content */}
      <main className="ministry-main" style={{ marginLeft: 0 }}>
        <header className="ministry-header">
          <h1>Ministry Health Board</h1>
          <p>Real-time nationwide school ministry analytics and staff roster.</p>
        </header>

        <div className="metric-grid">
          <div className="metric-card">
            <div className="metric-label">Total Schools</div>
            <div className="metric-value">{stats?.totalSchools || 0}</div>
            <div className="metric-trend trend-up">Nationwide Database</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">SUE Fellowships</div>
            <div className="metric-value">{stats?.fellowshipSchools || 0}</div>
            <div className="metric-trend trend-up">Active Core Groups</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Coverage %</div>
            <div className="metric-value">{stats?.coveragePercent?.toFixed(1) || 0}%</div>
            <div className="metric-trend">Strategic Reach</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Volunteer Power</div>
            <div className="metric-value">{stats?.volunteerPower || 0}</div>
            <div className="metric-trend trend-up">Mobilized Base</div>
          </div>
        </div>

        <div className="ministry-card">
          <div className="ministry-card-title">
            Sub-Department Roster
            <span className="dept-tag">Active Deployment</span>
          </div>
          <table className="ministry-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Sub-Department</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                  <td>
                    <span className="dept-tag" style={{ background: u.subDepartment ? 'rgba(14, 165, 233, 0.2)' : '#1e293b', color: u.subDepartment ? '#7dd3fc' : '#64748b' }}>
                      {u.subDepartment || 'UNASSIGNED'}
                    </span>
                  </td>
                  <td>{u.email}</td>
                  <td><span style={{ color: '#10b981' }}>● Active</span></td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-data">No National Staff found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default MinistryHome;
