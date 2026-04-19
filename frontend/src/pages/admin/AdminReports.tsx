import { useState, useEffect } from 'react';
import { api, Report } from '../../api/api';
import './AdminReports.css';

const AdminReports = ({ isExecutive }: { isExecutive?: boolean }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Are you sure you want to approve this report?')) return;
    try {
      await api.approveReport(id);
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Are you sure you want to reject this report? This will mark it as needing revision.')) return;
    try {
      await api.rejectReport(id);
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Failed to reject');
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesFilter = filter === 'ALL' || r.status === filter;
    const matchesSearch = 
      (r.projectPlan?.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.coordinator?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.coordinator?.region || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading && reports.length === 0) return <div className="ar-loading">Loading reports...</div>;

  return (
    <div className="admin-reports">
      <div className="admin-reports__header">
        <h1>{isExecutive ? 'Executive Reports' : 'Regional Reports'}</h1>
        <p className="ar__subtitle">Review, approve, or reject regional reports from across Ethiopia.</p>
      </div>

      <div className="ar__controls card">
        <div className="ar__tabs">
          <button 
            className={`ar__tab ${filter === 'ALL' ? 'ar__tab--active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All Reports ({reports.length})
          </button>
          <button 
            className={`ar__tab ${filter === 'PENDING_REVIEW' ? 'ar__tab--active' : ''}`}
            onClick={() => setFilter('PENDING_REVIEW')}
          >
            Pending ({reports.filter(r => r.status === 'PENDING_REVIEW').length})
          </button>
          <button 
            className={`ar__tab ${filter === 'APPROVED' ? 'ar__tab--active' : ''}`}
            onClick={() => setFilter('APPROVED')}
          >
            Approved ({reports.filter(r => r.status === 'APPROVED').length})
          </button>
          <button 
            className={`ar__tab ${filter === 'REJECTED' ? 'ar__tab--active' : ''}`}
            onClick={() => setFilter('REJECTED')}
          >
            Rejected ({reports.filter(r => r.status === 'REJECTED').length})
          </button>
        </div>

        <div className="ar__search">
          <span className="material-symbols-outlined">search</span>
          <input 
            type="text" 
            placeholder="Search by project, coordinator, or region..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="ar__error">{error}</div>}

      <div className="ar__table-card card">
        <div className="ar__table-wrapper">
          <table className="ar__table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Coordinator</th>
                <th>Region</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th className="ar__actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No reports found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map(report => (
                  <tr key={report.id}>
                    <td>
                      <div className="ar__project-info">
                        <strong>{report.projectPlan?.projectName || 'Untitled Report'}</strong>
                        <span>{report.projectPlan?.projectType || 'Standard'}</span>
                      </div>
                    </td>
                    <td>{report.coordinator?.name || 'Unknown'}</td>
                    <td>{report.coordinator?.region || '—'}</td>
                    <td>
                      <span className={`ar__badge ar__badge--${report.status.toLowerCase().replace('_', '-')}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(report.dateSubmitted).toLocaleDateString()}</td>
                    <td>
                      <div className="ar__actions">
                        <a href={`/reports/${report.id}`} className="btn btn--outline btn--sm" title="View Details">
                          <span className="material-symbols-outlined">visibility</span>
                        </a>
                        {report.status === 'PENDING_REVIEW' && (
                          <>
                            <button 
                              className="btn btn--approve btn--sm" 
                              title="Approve Report"
                              onClick={() => handleApprove(report.id)}
                            >
                              <span className="material-symbols-outlined">check_circle</span>
                            </button>
                            <button 
                              className="btn btn--reject btn--sm" 
                              title="Reject / Needs Revision"
                              onClick={() => handleReject(report.id)}
                            >
                              <span className="material-symbols-outlined">cancel</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
