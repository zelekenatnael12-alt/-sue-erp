import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import './Ministry.css';

const OperationsDesk = () => {
  const [pendingRATs, setPendingRATs] = useState<any[]>([]);
  const [nationalStaff, setNationalStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deployData, setDeployData] = useState({ userId: '', dept: 'Evangelism' });
  
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const rats = await api.getPendingRat();
      setPendingRATs(rats);

      const staffData = await api.getUsers();
      setNationalStaff(staffData.filter((u: any) => u.role === 'NATIONAL_STAFF'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRAT = async (id: string) => {
    try {
      await api.approveRat(id);
      setPendingRATs(pendingRATs.filter(r => r.id !== id));
    } catch (err) {
      alert('Approval failed');
    }
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deployData.userId) return;
    try {
      // In api.ts, I didn't add deployStaff yet, but I can add it now or use a generic patch
      await api.updateProfile({ id: parseInt(deployData.userId), subDepartment: deployData.dept } as any);
      alert('Staff deployed successfully');
      setDeployData({ ...deployData, userId: '' });
    } catch (err) {
      alert('Deployment failed');
    }
  };

  if (loading) return <div className="ministry-portal"><div className="empty-data">Loading Operational Data...</div></div>;

  return (
    <div className="ministry-portal">
      <aside className="ministry-sidebar">
        <div className="ministry-sidebar-head">
          <div className="ministry-logo">⚙️</div>
          <h2>Ministry Ops</h2>
          <p>Operations Desk</p>
        </div>
        <nav className="ministry-nav">
          <button className="ministry-nav-link" onClick={() => navigate('/school-ministry')}>
            📊 Ministry Health
          </button>
          <button className="ministry-nav-link active" onClick={() => navigate('/school-ministry/operations')}>
            ⚙️ Operations Desk
          </button>
        </nav>
      </aside>

      <main className="ministry-main">
        <header className="ministry-header">
          <h1>Governance & Deployment</h1>
          <p>National-level RAT approvals and staff technical deployment.</p>
        </header>

        <div className="op-desk-grid">
          <div className="ministry-card">
            <div className="ministry-card-title">RAT Approval Queue</div>
            <table className="ministry-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Region / Church</th>
                  <th>Profession</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRATs.map((rat) => (
                  <tr key={rat.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rat.fullName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{rat.region} Region</div>
                    </td>
                    <td>{rat.church || '-'}</td>
                    <td>{rat.profession || '-'}</td>
                    <td>
                      <button className="btn-approve" onClick={() => handleApproveRAT(rat.id)}>
                        ✓ Approve
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingRATs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-data">No pending RAT approvals.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="ministry-card">
            <div className="ministry-card-title">Staff Deployment Form</div>
            <form className="deployment-form" onSubmit={handleDeploy}>
              <div className="form-field">
                <label>Select National Staff Member</label>
                <select 
                  value={deployData.userId} 
                  onChange={e => setDeployData({ ...deployData, userId: e.target.value })}
                  required
                >
                  <option value="">-- Select Staff --</option>
                  {nationalStaff.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.subDepartment || 'Unassigned'})</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Target Sub-Department</label>
                <select 
                  value={deployData.dept} 
                  onChange={e => setDeployData({ ...deployData, dept: e.target.value })}
                >
                  <option value="Evangelism">Evangelism</option>
                  <option value="Servant Leadership">Servant Leadership</option>
                  <option value="Material Production">Material Production</option>
                  <option value="Scripture Engagement">Scripture Engagement</option>
                </select>
              </div>

              <button type="submit" className="btn-primary">
                Deploy to Sub-Department
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OperationsDesk;
