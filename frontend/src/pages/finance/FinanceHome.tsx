import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';
import './FinanceHome.css';

interface UserProvisionResponse {
  user: { id: number; email: string; role: string };
  tempPassword: string;
}

const FinanceHome: React.FC = () => {
  const [ledger, setLedger] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'NATIONAL_STAFF',
    region: '',
    subDepartment: '',
    baseSalary: ''
  });
  const [provisionResult, setProvisionResult] = useState<UserProvisionResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const data = await api.getMinistryLedger();
      setLedger(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setProvisionResult(null);

    try {
      const resData = await api.provisionUser(formData);
      setProvisionResult(resData);
      setFormData({
        fullName: '',
        email: '',
        role: 'NATIONAL_STAFF',
        region: '',
        subDepartment: '',
        baseSalary: ''
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalRaised = ledger.reduce((acc, curr) => acc + (curr.ministryRaised || 0), 0);
  const totalExpended = ledger.reduce((acc, curr) => acc + (curr.ministryExpended || 0), 0);
  const balance = totalRaised - totalExpended;

  return (
    <div className="finance-portal">
      {/* Main content */}
      <main className="finance-main" style={{ marginLeft: 0 }}>
        <header className="finance-topbar">
          <div>
            <h1>National Finance Command</h1>
            <span className="topbar-meta">Master Ledger & Personnel Management</span>
          </div>
          <div className="topbar-badge">Security Level: High</div>
        </header>

        <div className="finance-content">
          {error && <div className="finance-error">{error}</div>}

          <div className="ledger-summary-bar">
            <div className="ledger-stat">
              <div className="stat-label">Total Nationwide Funds</div>
              <div className="stat-value green">ETB {totalRaised.toLocaleString()}</div>
            </div>
            <div className="ledger-stat">
              <div className="stat-label">Total Nationwide Expenditure</div>
              <div className="stat-value red">ETB {totalExpended.toLocaleString()}</div>
            </div>
            <div className="ledger-stat">
              <div className="stat-label">Net Treasury Balance</div>
              <div className="stat-value">ETB {balance.toLocaleString()}</div>
            </div>
          </div>

          <div className="finance-card">
            <div className="finance-card-header">
              <div className="finance-card-title">
                <div className="card-icon blue">👤</div>
                <div>
                  <h2>HR Provisioning</h2>
                  <p>Onboard new staff and set base compensation</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleProvision}>
              <div className="hr-form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Abebe Bikila" 
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="abebe@suethiopia.org" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="NATIONAL_STAFF">National Staff</option>
                    <option value="FINANCE_ADMIN">Finance Admin</option>
                    <option value="SCHOOL_MINISTRY_DIRECTOR">School Ministry Director</option>
                    <option value="PARTNERSHIP_DIRECTOR">Partnership Director</option>
                    <option value="CAPACITY_DIRECTOR">Capacity Director</option>
                    <option value="MEDIA_DIRECTOR">Media Director</option>
                    <option value="NATIONAL_DIRECTOR">National Director</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department / Region</label>
                  <input 
                    type="text" 
                    placeholder="e.g. South Ethiopia" 
                    value={formData.region}
                    onChange={e => setFormData({...formData, region: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Sub-Department</label>
                  <input 
                    type="text" 
                    placeholder="e.g. IT, Legal, HR" 
                    value={formData.subDepartment}
                    onChange={e => setFormData({...formData, subDepartment: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Base Monthly Salary (ETB)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={formData.baseSalary}
                    onChange={e => setFormData({...formData, baseSalary: e.target.value})}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-provision" disabled={submitting}>
                {submitting ? 'Processing...' : 'Provision New Staff Account'}
              </button>
            </form>

            {provisionResult && (
              <div className="provision-result">
                <h3>Account Created Successfully</h3>
                <p style={{fontSize: '13px', color: '#94a3b8', marginBottom: '10px'}}>
                  Share this temporary password with the user. They will be forced to change it on first login.
                </p>
                <div className="temp-password-display">
                  <code>{provisionResult.tempPassword}</code>
                  <button className="btn-copy" onClick={() => navigator.clipboard.writeText(provisionResult.tempPassword)}>
                    Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="finance-card">
            <div className="finance-card-header">
              <div className="finance-card-title">
                <div className="card-icon green">📜</div>
                <div>
                  <h2>Master Ledger</h2>
                  <p>Real-time aggregation of approved regional activities</p>
                </div>
              </div>
            </div>

            <div className="ledger-table-wrap">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Activity / Narrative</th>
                    <th>Area</th>
                    <th>Raised</th>
                    <th>Expended</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((item, idx) => (
                    <tr key={idx}>
                      <td><code style={{color: '#94a3b8'}}>{item.generatedId || 'MAN-001'}</code></td>
                      <td>{item.autoName}</td>
                      <td>{item.author?.area || 'National'}</td>
                      <td className="amount-positive">+{item.ministryRaised?.toLocaleString()}</td>
                      <td className="amount-negative">-{item.ministryExpended?.toLocaleString()}</td>
                      <td>{item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '-'}</td>
                      <td><span className="status-badge approved">Approved</span></td>
                    </tr>
                  ))}
                  {ledger.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                        No ledger entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinanceHome;
