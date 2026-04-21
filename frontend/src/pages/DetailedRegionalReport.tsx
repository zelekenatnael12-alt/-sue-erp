import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, Report } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { OFFICIAL_TEMPLATE_CATEGORIES, ETHIOPIAN_MONTHS } from '../utils/templateData';
import './DetailedRegionalReport.css';

const DetailedRegionalReport = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  // Monthly Report Modal State
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [monthlyMonth, setMonthlyMonth] = useState(ETHIOPIAN_MONTHS[0].name.split(' ')[0]);
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [monthlyNarrative, setMonthlyNarrative] = useState('');
  const [actualsMatrix, setActualsMatrix] = useState<Record<string, number>>({});
  const [isSubmittingMonthly, setIsSubmittingMonthly] = useState(false);
  const [activeCatTab, setActiveCatTab] = useState(OFFICIAL_TEMPLATE_CATEGORIES[0].id);

  const handleActualChange = (activityId: string, val: string) => {
    setActualsMatrix(prev => ({ ...prev, [activityId]: parseInt(val) || 0 }));
  };

  const handleMonthlySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!report?.projectPlanId) return;
    setIsSubmittingMonthly(true);
    try {
      const newMonthlyReport = await api.submitMonthlyReport({
        planId: report.projectPlanId,
        reportMonth: monthlyMonth,
        reportYear: new Date().getFullYear(),
        budgetSpent: parseFloat(monthlyBudget),
        narrative: monthlyNarrative,
        actualsMatrix
      });
      // Append the newly created report to locally display it
      setReport(prev => {
        if (!prev || !prev.projectPlan) return prev;
        return {
          ...prev,
          projectPlan: {
             ...prev.projectPlan,
             reports: [...(prev.projectPlan.reports || []), newMonthlyReport]
          }
        };
      });
      setShowMonthlyModal(false);
      setMonthlyBudget('');
      setMonthlyNarrative('');
      setActualsMatrix({});
    } catch (e) {
      alert('Failed to submit monthly report.');
    } finally {
      setIsSubmittingMonthly(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    api.getReport(parseInt(id))
      .then(setReport)
      .catch(() => navigate('/reports'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleApprove = async () => {
    if (!report) return;
    setApproving(true);
    try {
      const updated = await api.approveReport(report.id);
      setReport(prev => prev ? { ...prev, status: updated.status } : prev);
    } catch (e) {
      alert('Failed to approve. Only executives can approve reports.');
    } finally {
      setApproving(false);
    }
  };

  if (loading) return <div style={{padding:'4rem',textAlign:'center',color:'var(--color-text-muted)'}}>Loading report...</div>;
  if (!report) return <div style={{padding:'4rem',textAlign:'center'}}>Report not found</div>;

  const isApproved = report.status === 'APPROVED';
  const submittedDate = new Date(report.dateSubmitted).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  return (
    <div className="detailed-report-page">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs mb-6 text-sm">
        <Link to="/reports" className="breadcrumbs__link">Regional Reports</Link>
        <span className="breadcrumbs__separator">/</span>
        <span className="breadcrumbs__current">{report.title}</span>
      </nav>

      {/* Header */}
      <div className="report-header flex-wrap mb-8">
        <div className="report-header__title flex-col gap-2">
          <div className={`status-pill ${isApproved ? 'status-pill--approved' : 'status-pill--pending'}`}>
            <span className="status-dot"></span>
            {isApproved ? 'Approved' : 'Pending Review'}
          </div>
          <h1 className="text-4xl font-black">{report.title}</h1>
          <p className="text-muted">
            Submitted by {report.coordinator?.name || report.coordinator?.email || '—'} on {submittedDate}
            {report.coordinator?.region && ` • ${report.coordinator.region}`}
          </p>
        </div>
        
        <div className="report-header__actions flex-wrap gap-3">
          <button type="button" className="btn btn--secondary btn--icon" onClick={() => window.print()}>
            <span className="material-symbols-outlined">download</span>
            Download PDF
          </button>
          {!isApproved && user?.role === 'EXECUTIVE' && (
            <button type="button" className="btn btn--primary btn--shadow btn--icon" onClick={handleApprove} disabled={approving}>
              <span className="material-symbols-outlined">check_circle</span>
              {approving ? 'Approving...' : 'Approve Plan'}
            </button>
          )}
          {isApproved && (
            <span className="btn btn--outline btn--icon" style={{color:'#16a34a',borderColor:'#16a34a'}}>
              <span className="material-symbols-outlined">verified</span>
              Approved
            </span>
          )}
        </div>
      </div>

      {/* Plan Details */}
      {report.projectPlan && (
        <div className="grid-4-col mb-8">
          <div className="kpi-card">
            <p className="kpi-card__label">Project Name</p>
            <p className="kpi-card__value" style={{fontSize:'1.1rem'}}>{report.projectPlan.projectName}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-card__label">Project Type</p>
            <p className="kpi-card__value" style={{fontSize:'1.1rem'}}>{report.projectPlan.projectType}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-card__label">Total Staff</p>
            <p className="kpi-card__value">{report.projectPlan.totalStaff ?? '—'}</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-card__label">Plan Status</p>
            <p className="kpi-card__value" style={{fontSize:'1rem'}}>{report.projectPlan.status}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="main-content-grid">
        <div className="left-column">
          {/* Monthly Budget Chart Placeholder */}
          <div className="card-panel mb-8">
            <div className="flex-between mb-6">
              <div>
                <h3 className="text-lg font-bold">Monthly Budget Burn Rate</h3>
                <p className="text-sm text-muted">Actual monthly utilization tracked against project.</p>
              </div>
              {isApproved && user?.role === 'COORDINATOR' && (
                <button type="button" className="btn btn--primary" onClick={() => setShowMonthlyModal(true)}>
                  + Add Details
                </button>
              )}
            </div>
            <div className="chart-container">
              {ETHIOPIAN_MONTHS.map((mObj) => {
                const m = mObj.name.split(' ')[0]; // Getting the Amharic name e.g. መስከረም
                const monthlyUpdate = report.projectPlan?.reports?.find(r => r.type === 'MONTHLY_UPDATE' && r.reportMonth === m);
                const isReported = !!monthlyUpdate;
                
                // Use plan budget if available, otherwise fallback to 50000
                const planMonthlyBudget = (report.projectPlan?.estimatedBudget || 600000) / 12;
                const simulatedPercent = isReported ? Math.min(100, Math.round((monthlyUpdate.budgetSpent! / planMonthlyBudget) * 100)) : 0;
                
                return (
                  <div key={mObj.id} className={`chart-bar-wrap ${isReported ? 'has-data' : ''}`}>
                    <div className={`chart-bar ${isReported ? 'chart-bar--primary' : 'chart-bar--dashed'} chart-bar--${isReported ? simulatedPercent : 5}`}>
                       {isReported && <span className="tooltip">{monthlyUpdate.budgetSpent} ETB</span>}
                    </div>
                    <span className="chart-label">{mObj.short}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section Summaries */}
          <div className="grid-2-col mb-8">
            {[
              {icon:'hub', title:'Regional Logistics', section:'01', status:'COMPLETE', color:'blue', desc:'Optimized supply chain and logistics for the year.'},
              {icon:'groups', title:'Human Resources', section:'02', status:'COMPLETE', color:'blue', desc: report.projectPlan?.leadRoles ? `Lead roles: ${report.projectPlan.leadRoles}` : 'New hiring program details included.'},
              {icon:'precision_manufacturing', title:'Maintenance Schedule', section:'03', status:'COMPLETE', color:'blue', desc:'Preventive maintenance cycles defined.'},
              {icon:'warning', title:'Risk Management', section:'04', status:'NEEDS REVIEW', color:'amber', desc:'Potential delays flagged for review.'},
            ].map(s => (
              <div key={s.section} className="section-card">
                <div className="section-card__header flex-start gap-3 mb-4">
                  <div className={`icon-square icon-square--${s.color}`}>
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold">{s.title}</h4>
                    <p className="text-xs text-muted">Section {s.section} of 16</p>
                  </div>
                </div>
                <p className="text-sm text-body line-clamp-3">{s.desc}</p>
                <div className="section-card__footer">
                  <span className={`status-text ${s.status !== 'COMPLETE' ? 'text-amber' : 'text-muted'}`}>STATUS: {s.status}</span>
                  <span className="link-text">View Section</span>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="btn-outline-block">
            View All 16 Sections Summary
          </button>
        </div>

        {/* Right Column */}
        <div className="right-column gap-6 flex-col">
          <div className="card-panel-no-padding">
            <div className="map-hero">
              <div className="map-ping"></div>
            </div>
            <div className="p-4">
              <h4 className="font-bold flex-start gap-2">
                <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                Region: {report.coordinator?.region || 'Ethiopia'}
              </h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {report.coordinator?.name || 'Coordinator'}'s regional hub with oversight for all district offices.
              </p>
            </div>
          </div>

          <div className="card-panel">
            <h3 className="font-bold mb-4">Report Info</h3>
            <div className="doc-list flex-col gap-3">
              <div className="doc-item">
                <div className="flex-start gap-3">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <div>
                    <p className="text-sm font-medium">{report.coordinator?.name || '—'}</p>
                    <p className="text-xs text-muted">{report.coordinator?.email}</p>
                  </div>
                </div>
              </div>
              <div className="doc-item">
                <div className="flex-start gap-3">
                  <span className="material-symbols-outlined text-primary">calendar_today</span>
                  <div>
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-xs text-muted">
                      {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : submittedDate}
                    </p>
                  </div>
                </div>
              </div>
              {report.decidedAt && (
                <div className="doc-item">
                  <div className="flex-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600">verified</span>
                    <div>
                      <p className="text-sm font-medium">Approved On</p>
                      <p className="text-xs text-muted">{new Date(report.decidedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="doc-item">
                <div className="flex-start gap-3">
                  <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-xs text-muted">{isApproved ? 'Approved ✓' : 'Pending Review'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Report Submission Modal */}
      {showMonthlyModal && (
        <div className="modal-overlay">
          <div className="modal-content card-panel" style={{width: '600px'}}>
            <div className="flex-between mb-4">
              <h2 className="text-2xl font-bold">Submit Monthly Actuals</h2>
              <button type="button" className="btn btn--icon" onClick={() => setShowMonthlyModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleMonthlySubmit} className="flex-col gap-4">
              <div className="form-group grid-2-col">
                <div>
                  <label className="form-label">Month</label>
                  <select className="form-select" value={monthlyMonth} onChange={(e) => setMonthlyMonth(e.target.value)}>
                    {ETHIOPIAN_MONTHS.map(m => <option key={m.id} value={m.name.split(' ')[0]}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Budget Spent (ETB)</label>
                  <input type="number" required className="form-input" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              
              <div className="form-group flex-col mt-2">
                <label className="form-label flex-start gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-sm">assignment</span>
                  Activity Actuals for {monthlyMonth} (Click a category to expand)
                </label>

                <div className="matrix-categories-list">
                  {OFFICIAL_TEMPLATE_CATEGORIES.map(cat => {
                    const isExpanded = activeCatTab === cat.id; // Reusing activeCatTab for single-accordion
                    const hasValue = cat.activities.some(a => actualsMatrix[a.id] && actualsMatrix[a.id] > 0);
                    
                    return (
                      <section key={cat.id} className={`form-section matrix-section ${isExpanded ? 'matrix-section--expanded' : ''}`} style={{ marginBottom: isExpanded ? '1rem' : '0.5rem' }}>
                        <div 
                          className="form-section__header matrix-accordion-header" 
                          onClick={() => setActiveCatTab(isExpanded ? '' : cat.id)}
                          style={{ cursor: 'pointer', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)', borderRadius: isExpanded ? 'var(--radius-md) var(--radius-md) 0 0' : 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                        >
                          <div className="matrix-accordion-header-left flex-start gap-2" style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>table_chart</span>
                            <span style={{ fontSize: '0.9rem' }}>{cat.name}</span>
                            {hasValue && <span className="tab-indicator" style={{ color: '#10b981', fontSize: '0.8rem', marginLeft: '0.5rem' }}>● Filled</span>}
                          </div>
                          <div className="matrix-accordion-header-right">
                            <span className={`material-symbols-outlined transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="card-panel-no-padding border" style={{ borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)' }}>
                            <div className="px-3 py-2 bg-slate-50">
                              {cat.activities.map(act => (
                                <div key={act.id} className="flex-between gap-4 py-2 border-b border-dashed border-slate-200 last:border-0 hover:bg-slate-100 transition-colors">
                                  <div className="flex-col" style={{ flex: 1 }}>
                                    <span className="text-sm text-slate-700 font-medium" style={{ lineHeight: '1.3' }}>{act.name}</span>
                                    {report.projectPlan?.matrixActivities && (
                                      <span className="text-xs text-blue-600 font-bold">
                                        Target: {(() => {
                                          const ma = report.projectPlan.matrixActivities.find(item => item.activity === act.name);
                                          const monthIndex = ETHIOPIAN_MONTHS.findIndex(mo => mo.name.startsWith(monthlyMonth));
                                          if (ma && monthIndex !== -1) {
                                            const key = `m${monthIndex + 1}` as keyof typeof ma;
                                            return ma[key] || 0;
                                          }
                                          return 0;
                                        })()}
                                      </span>
                                    )}
                                  </div>
                                  <input 
                                    type="number" 
                                    min="0" 
                                    placeholder="Actual"
                                    className="form-input text-sm px-2 py-1 h-8 w-24 text-right font-bold"
                                    style={{ border: '1px solid var(--color-border)', backgroundColor: '#fff' }}
                                    value={actualsMatrix[act.id] || ''}
                                    onChange={(e) => handleActualChange(act.id, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Qualitative Narrative (Progress & Challenges)</label>
                <textarea required className="form-textarea" rows={4} value={monthlyNarrative} onChange={(e) => setMonthlyNarrative(e.target.value)} placeholder="Describe activities completed, number of schools reached, staff updates..."></textarea>
              </div>

              <div className="flex-end gap-3 mt-4">
                <button type="button" className="btn btn--outline" onClick={() => setShowMonthlyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={isSubmittingMonthly}>
                  {isSubmittingMonthly ? 'Submitting...' : 'Save Actuals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedRegionalReport;
