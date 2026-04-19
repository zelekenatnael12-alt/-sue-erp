import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Report } from '../api/api';
import './Reports.css';

type FilterStatus = 'ALL' | 'APPROVED' | 'PENDING_REVIEW';

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReports()
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter(r => filter === 'ALL' || r.status === filter);
  const approved = reports.filter(r => r.status === 'APPROVED').length;
  const pending = reports.filter(r => r.status === 'PENDING_REVIEW').length;

  return (
    <div className="reports-page">
      <div className="page-header mb-8">
        <h1 className="text-3xl font-black">Regional Plan Submissions | የክልል እቅድ ግምገማ</h1>
        <p className="section-description mt-2 text-lg">
          Overview of NGO reporting and budget status | የሪፖርት እና የበጀት ሁኔታ አጠቃላይ እይታ
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid-3-col mb-10">
        <div className="stat-card">
          <div className="flex-between">
            <p className="stat-card__title">Total Plans Received | አጠቃላይ እቅዶች</p>
            <span className="material-symbols-outlined text-primary">analytics</span>
          </div>
          <p className="stat-card__value">{loading ? '—' : reports.length}</p>
          <div className="stat-card__trend text-emerald">
            <span className="material-symbols-outlined text-sm">description</span>
            <span>Total submitted plans</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex-between">
            <p className="stat-card__title">Approved | የጸደቁ</p>
            <span className="material-symbols-outlined text-primary">check_circle</span>
          </div>
          <p className="stat-card__value">{loading ? '—' : approved}</p>
          <div className="stat-card__trend text-emerald">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>Approved reports</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex-between">
            <p className="stat-card__title">Pending Reviews | በመጠባበቅ ላይ</p>
            <span className="material-symbols-outlined text-primary">pending_actions</span>
          </div>
          <p className="stat-card__value">{loading ? '—' : pending}</p>
          <div className="stat-card__trend text-amber">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>Requires attention</span>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="card-panel-no-padding overflow-hidden mb-8">
        <div className="filters-header p-6">
          <h2 className="text-xl font-bold mb-4">Filters | ማጣሪያዎች</h2>
          <div className="filters-row flex-wrap">
            <div className="filter-tabs">
              {(['ALL', 'APPROVED', 'PENDING_REVIEW'] as FilterStatus[]).map(f => (
                <button
                  key={f}
                  type="button"
                  className={`filter-tab ${filter === f ? 'filter-tab--active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'ALL' ? 'All | ሁሉንም' : f === 'APPROVED' ? 'Approved | የጸደቁ' : 'Pending | በመጠባበቅ ላይ'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table w-full text-left">
            <thead>
              <tr>
                <th>Report Title</th>
                <th>Submitted By | የቀረበው</th>
                <th>Region | ክልል</th>
                <th>Status | ሁኔታ</th>
                <th>Submitted | የቀረበው</th>
                <th>Approved | የጸደቀው</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{textAlign:'center',padding:'2rem',color:'var(--color-text-muted)'}}>Loading reports...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center',padding:'2rem',color:'var(--color-text-muted)'}}>
                  No reports found. <button type="button" style={{color:'var(--color-primary)',background:'none',border:'none',cursor:'pointer',fontWeight:600}} onClick={() => navigate('/plan/step-1')}>Submit the first plan →</button>
                </td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="font-bold">{r.title}</div>
                    <div className="text-xs text-muted">#{r.id}</div>
                  </td>
                  <td>
                    <div className="flex-center-gap">
                      <div className="avatar-sm"></div>
                      <span className="text-sm">{r.coordinator?.name || r.coordinator?.email || '—'}</span>
                    </div>
                  </td>
                  <td className="text-sm">{r.coordinator?.region || '—'}</td>
                  <td>
                    <span className={`status-badge ${r.status === 'APPROVED' ? 'status-badge--approved' : 'status-badge--pending'}`}>
                      <span className="status-dot"></span>
                      {r.status === 'APPROVED' ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="text-sm">
                    {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : new Date(r.dateSubmitted).toLocaleDateString()}
                  </td>
                  <td className="text-sm">
                    {r.decidedAt ? new Date(r.decidedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="text-right">
                    <button type="button" className="action-btn" onClick={() => navigate(`/reports/${r.id}`)}>
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination p-4 flex-between">
          <p className="text-sm text-muted">Showing {filtered.length} of {reports.length} results</p>
        </div>
      </div>

      {/* Regional Map & Budget */}
      <div className="grid-2-col mb-8">
        <div className="card-panel">
          <h3 className="font-bold mb-4">Activity by Region | ክልላዊ እንቅስቃሴ</h3>
          <div className="map-placeholder">
            <span className="btn btn--primary map-badge shadow-lg">
              <span className="material-symbols-outlined">map</span>
              Interactive Map Coming Soon
            </span>
          </div>
        </div>
        <div className="card-panel">
          <h3 className="font-bold mb-4">Budget Utilization | በጀት አጠቃቀም</h3>
          <div className="progress-list flex-col gap-4">
            {[{region:'Addis Ababa and its Surrounding',pct:82},{region:'Central Ethiopia',pct:45},{region:'South Ethiopia',pct:68},{region:'West',pct:31}].map(i => (
              <div key={i.region} className="progress-item">
                <div className="progress-item__header flex-between mb-1">
                  <span className="text-sm">{i.region}</span>
                  <span className="text-sm font-semibold">{i.pct}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{width:`${i.pct}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
