import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Report } from '../../api/api';
import './AreaReports.css';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const ET_MONTHS = ['Meskerem','Tikimt','Hidar','Tahsas','Tir','Yekatit','Megabit','Miyazia','Ginbot','Sene','Hamle','Nehase','Pagume'];

const MODULES = [
  { id: 'A', label: 'General Data', subtitle: 'Schools & Staffing', icon: 'school',
    metrics: ['High Schools in Area','Middle Schools in Area','Schools with SU Fellowship','Schools without Fellowship','Full-Time Staff','Associate Staff','Volunteers'] },
  { id: 'B', label: 'Field Operations', subtitle: 'Visits & New Fellowships', icon: 'explore',
    metrics: ['Schools Visited','New Fellowships Started','Existing Fellowships Active','Student Leaders Trained','Area Meetings Held'] },
  { id: 'C', label: 'Programs & Evangelism', subtitle: 'Teachings & Conferences', icon: 'menu_book',
    metrics: ['Core Teachings Delivered','Bible Study Groups Run','Youth Conferences Held','People who heard the Gospel','Students who accepted Jesus'] },
  { id: 'D', label: 'Partnerships', subtitle: 'Churches & Support', icon: 'handshake',
    metrics: ['Partner Churches Engaged','Church Events Attended','New Church Partnerships','Prayer Groups Formed'] },
  { id: 'E', label: 'Admin & Stories', subtitle: 'Office setup & Testimonies', icon: 'auto_stories',
    metrics: ['Office Days Attended','Reports Submitted On Time','Coordination Meetings','Documentation Updated'] },
];

// Mock planned targets for Monthly Report scenario
const PLANNED_TARGETS: Record<string, number> = {
  'Schools Visited': 8, 'New Fellowships Started': 2, 'Existing Fellowships Active': 12,
  'Student Leaders Trained': 5, 'Area Meetings Held': 4, 'Core Teachings Delivered': 6,
  'Bible Study Groups Run': 3, 'Youth Conferences Held': 1, 'People who heard the Gospel': 120,
  'Students who accepted Jesus': 15, 'High Schools in Area': 42, 'Middle Schools in Area': 18,
  'Schools with SU Fellowship': 18, 'Schools without Fellowship': 24, 'Full-Time Staff': 3,
  'Associate Staff': 5, 'Volunteers': 12, 'Partner Churches Engaged': 8, 'Church Events Attended': 3,
  'New Church Partnerships': 1, 'Prayer Groups Formed': 2, 'Office Days Attended': 20,
  'Reports Submitted On Time': 3, 'Coordination Meetings': 4, 'Documentation Updated': 2,
};

/* ─── Types ──────────────────────────────────────────────────────────────── */
type KanbanStatus = 'DRAFT' | 'PENDING_REVIEW' | 'REQUIRES_CORRECTION' | 'APPROVED';
type WizardStep = 1 | 2 | 3;
type DocType = 'Annual Plan' | 'Monthly Report' | 'Weekly Update';

// Monthly grid: metric → month → value
type GridData = Record<string, Record<string, string>>;
// Monthly actuals: metric → { actual, variance }
type ActualsData = Record<string, { actual: string; variance: string }>;

interface WizardData {
  docType: DocType | '';
  period: string;
  title: string;
  schoolsVisited: string;
  narrative: string;
  file: File | null;
  gridData: GridData;
  actualsData: ActualsData;
  story: string;
  storyFile: File | null;
  featureStory: boolean;
}

const STATUS_META: Record<KanbanStatus, { label: string; color: string; bg: string; icon: string }> = {
  DRAFT:               { label: 'Draft',            color: '#475569', bg: 'rgba(100,116,139,0.1)',  icon: 'edit_note' },
  PENDING_REVIEW:      { label: 'Pending Review',   color: '#92400e', bg: 'rgba(234,179,8,0.1)',   icon: 'hourglass_top' },
  REQUIRES_CORRECTION: { label: 'Action Required',  color: '#b91c1c', bg: 'rgba(220,38,38,0.12)',  icon: 'warning' },
  APPROVED:            { label: 'Approved',          color: '#15803d', bg: 'rgba(22,163,74,0.1)',   icon: 'check_circle' },
};

const REVIEWERS: Record<KanbanStatus, string> = {
  DRAFT: '',
  PENDING_REVIEW: 'Sub-Regional Coordinator',
  REQUIRES_CORRECTION: 'Regional Director',
  APPROVED: '',
};

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function AreaReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardType, setWizardType] = useState<'plan' | 'report'>('plan');
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [submitting, setSubmitting] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>('A');
  const [wizardData, setWizardData] = useState<WizardData>({
    docType: '', period: '', title: '', schoolsVisited: '', narrative: '', file: null,
    gridData: {}, actualsData: {}, story: '', storyFile: null, featureStory: false,
  });

  useEffect(() => {
    api.getReports()
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const byStatus = (status: KanbanStatus) =>
    reports.filter(r => r.status === status);

  const pending = reports.filter(r => r.status === 'PENDING_REVIEW');
  const approved = reports.filter(r => r.status === 'APPROVED');
  const corrections = reports.filter(r => r.status === 'REQUIRES_CORRECTION');

  const openWizard = (type: 'plan' | 'report') => {
    setWizardType(type);
    setWizardStep(1);
    setOpenAccordion('A');
    setWizardData({ docType: type === 'plan' ? 'Annual Plan' : 'Monthly Report', period: '', title: '', schoolsVisited: '', narrative: '', file: null, gridData: {}, actualsData: {}, story: '', storyFile: null, featureStory: false });
    setShowWizard(true);
  };

  const setGrid = useCallback((metric: string, month: string, val: string) => {
    setWizardData(d => ({
      ...d,
      gridData: { ...d.gridData, [metric]: { ...(d.gridData[metric] || {}), [month]: val } },
    }));
  }, []);

  const setActual = useCallback((metric: string, field: 'actual' | 'variance', val: string) => {
    setWizardData(d => ({
      ...d,
      actualsData: { ...d.actualsData, [metric]: { ...(d.actualsData[metric] || { actual: '', variance: '' }), [field]: val } },
    }));
  }, []);

  const gridTotal = (metric: string) =>
    ET_MONTHS.reduce((sum, m) => sum + (parseInt(wizardData.gridData[metric]?.[m] || '0', 10) || 0), 0);

  const handleWizardSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitting(false);
    setShowWizard(false);
    navigate('/plan/step-1');
  };

  return (
    <div className="ar-page">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="ar-header">
        <div>
          <h1 className="ar-title">Area Planning & Reporting</h1>
          <p className="ar-subtitle">Manage your plans, reports, and submissions in one place.</p>
        </div>
        <div className="ar-header-actions">
          <div className="ar-view-toggle">
            <button className={`ar-view-btn ${view === 'kanban' ? 'ar-view-btn--active' : ''}`} onClick={() => setView('kanban')}>
              <span className="material-symbols-outlined">view_kanban</span> Board
            </button>
            <button className={`ar-view-btn ${view === 'list' ? 'ar-view-btn--active' : ''}`} onClick={() => setView('list')}>
              <span className="material-symbols-outlined">list</span> List
            </button>
          </div>
          <button className="btn btn--outline" onClick={() => openWizard('report')}>
            <span className="material-symbols-outlined">lab_profile</span>
            Submit Area Report
          </button>
          <button className="btn btn--primary" onClick={() => openWizard('plan')}>
            <span className="material-symbols-outlined">add</span>
            Create New Plan
          </button>
        </div>
      </div>

      {/* ── Summary KPIs ────────────────────────────────────── */}
      <div className="ar-kpi-row">
        {([
          { label: 'Total Documents', value: reports.length, icon: 'folder', color: 'var(--color-primary)' },
          { label: 'Pending Review',  value: pending.length,    icon: 'hourglass_top', color: '#92400e'  },
          { label: 'Action Required', value: corrections.length, icon: 'warning',      color: '#b91c1c'  },
          { label: 'Approved',        value: approved.length,   icon: 'check_circle',  color: '#15803d'  },
        ] as const).map(k => (
          <div key={k.label} className="ar-kpi">
            <span className="material-symbols-outlined" style={{ color: k.color }}>{k.icon}</span>
            <span className="ar-kpi-val">{loading ? '—' : k.value}</span>
            <span className="ar-kpi-lbl">{k.label}</span>
          </div>
        ))}
      </div>

      {/* ── Kanban / List ───────────────────────────────────── */}
      {view === 'kanban' ? (
        <div className="ar-kanban">
          {(['DRAFT', 'PENDING_REVIEW', 'REQUIRES_CORRECTION', 'APPROVED'] as KanbanStatus[]).map(status => {
            const meta = STATUS_META[status];
            const items = byStatus(status);
            return (
              <div key={status} className={`ar-col ${status === 'REQUIRES_CORRECTION' ? 'ar-col--alert' : ''}`}>
                <div className="ar-col-header">
                  <div className="ar-col-label" style={{ color: meta.color, background: meta.bg }}>
                    <span className="material-symbols-outlined">{meta.icon}</span>
                    {meta.label}
                  </div>
                  <span className="ar-col-count">{items.length}</span>
                </div>

                <div className="ar-col-body">
                  {items.length === 0 && (
                    <div className="ar-col-empty">
                      <span className="material-symbols-outlined">inbox</span>
                      <p>No {meta.label.toLowerCase()} items</p>
                    </div>
                  )}
                  {items.map(r => (
                    <div
                      key={r.id}
                      className={`ar-card ${status === 'REQUIRES_CORRECTION' ? 'ar-card--alert' : ''}`}
                      onClick={() => setSelectedReport(r)}
                    >
                      <div className="ar-card-type">{r.projectPlan?.projectType || 'Plan'}</div>
                      <h4 className="ar-card-title">{r.title}</h4>
                      <div className="ar-card-meta">
                        <span>{new Date(r.dateSubmitted).toLocaleDateString()}</span>
                        {REVIEWERS[status] && (
                          <span className="ar-card-reviewer">
                            <span className="material-symbols-outlined">person</span>
                            {REVIEWERS[status]}
                          </span>
                        )}
                      </div>
                      {status === 'REQUIRES_CORRECTION' && (
                        <div className="ar-card-feedback">
                          <span className="material-symbols-outlined">feedback</span>
                          "Please update line item 3 with correct figures."
                        </div>
                      )}
                      <div className="ar-card-footer">
                        <span className="ar-badge" style={{ color: meta.color, background: meta.bg }}>
                          {meta.label}
                        </span>
                        <button className="ar-card-action" onClick={e => { e.stopPropagation(); setSelectedReport(r); }}>
                          View →
                        </button>
                      </div>
                    </div>
                  ))}

                  {status === 'DRAFT' && (
                    <button className="ar-add-card" onClick={() => openWizard('plan')}>
                      <span className="material-symbols-outlined">add</span>
                      Add New
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── List View ── */
        <div className="ar-list-card">
          <table className="ar-table">
            <thead>
              <tr>
                <th>Document</th><th>Type</th><th>Status</th><th>Reviewer</th><th>Date</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="ar-table-empty">Loading…</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={6} className="ar-table-empty">No documents yet. <button onClick={() => openWizard('plan')} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Create your first plan →</button></td></tr>
              ) : reports.map(r => {
                const s = (r.status as KanbanStatus) in STATUS_META ? r.status as KanbanStatus : 'PENDING_REVIEW';
                const meta = STATUS_META[s];
                return (
                  <tr key={r.id} onClick={() => setSelectedReport(r)} style={{ cursor: 'pointer' }}>
                    <td><div style={{ fontWeight: 700 }}>{r.title}</div><div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>#{r.id}</div></td>
                    <td>{r.projectPlan?.projectType || 'Plan'}</td>
                    <td><span className="ar-badge" style={{ color: meta.color, background: meta.bg }}>{meta.label}</span></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{REVIEWERS[s] || '—'}</td>
                    <td style={{ fontSize: '0.82rem' }}>{new Date(r.dateSubmitted).toLocaleDateString()}</td>
                    <td><button className="ar-icon-btn" onClick={e => { e.stopPropagation(); setSelectedReport(r); }}><span className="material-symbols-outlined">visibility</span></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* WIZARD MODAL                                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showWizard && (
        <div className="ar-overlay" onClick={() => setShowWizard(false)}>
          <div className="ar-modal" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="ar-modal-header">
              <div>
                <h2 className="ar-modal-title">
                  {wizardType === 'plan' ? '➕ Create New Plan' : '📄 Submit Area Report'}
                </h2>
                <p className="ar-modal-subtitle">Step {wizardStep} of 3 — {wizardStep === 1 ? 'Setup' : wizardStep === 2 ? 'Data Entry' : 'Review & Submit'}</p>
              </div>
              <button className="ar-modal-close" onClick={() => setShowWizard(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Step Indicators */}
            <div className="ar-steps">
              {[1, 2, 3].map(s => (
                <div key={s} className={`ar-step ${wizardStep >= s ? 'ar-step--done' : ''} ${wizardStep === s ? 'ar-step--active' : ''}`}>
                  <div className="ar-step-dot">{wizardStep > s ? <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>check</span> : s}</div>
                  <span className="ar-step-label">{s === 1 ? 'Setup' : s === 2 ? 'Data Entry' : 'Review'}</span>
                </div>
              ))}
            </div>

            {/* Modal Body */}
            <div className="ar-modal-body">

              {/* Step 1: Setup */}
              {wizardStep === 1 && (
                <div className="ar-form">
                  <div className="ar-form-group">
                    <label className="ar-label">Document Type</label>
                    <div className="ar-type-grid">
                      {(['Annual Plan', 'Monthly Report', 'Weekly Update'] as DocType[]).map(dt => (
                        <button
                          key={dt}
                          type="button"
                          className={`ar-type-btn ${wizardData.docType === dt ? 'ar-type-btn--active' : ''}`}
                          onClick={() => setWizardData(d => ({ ...d, docType: dt }))}
                        >
                          <span className="material-symbols-outlined">
                            {dt === 'Annual Plan' ? 'event_note' : dt === 'Monthly Report' ? 'calendar_month' : 'today'}
                          </span>
                          {dt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="ar-form-group">
                    <label className="ar-label">Reporting Period</label>
                    <input
                      className="ar-input"
                      type="text"
                      placeholder="e.g. Q2 2026 or April 2026"
                      value={wizardData.period}
                      onChange={e => setWizardData(d => ({ ...d, period: e.target.value }))}
                    />
                  </div>
                  <div className="ar-form-group">
                    <label className="ar-label">Document Title</label>
                    <input
                      className="ar-input"
                      type="text"
                      placeholder="e.g. Addis Ababa Area - April Monthly Report"
                      value={wizardData.title}
                      onChange={e => setWizardData(d => ({ ...d, title: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Dynamic Data Entry — Accordion Modules */}
              {wizardStep === 2 && (
                <div className="ar-accordion-list">
                  {MODULES.map((mod) => {
                    const isOpen = openAccordion === mod.id;
                    const isMonthly = wizardData.docType === 'Monthly Report';
                    return (
                      <div key={mod.id} className={`ar-accordion ${isOpen ? 'ar-accordion--open' : ''}`}>
                        {/* Accordion Header */}
                        <button
                          className="ar-accordion-hdr"
                          onClick={() => setOpenAccordion(isOpen ? '' : mod.id)}
                        >
                          <div className="ar-accordion-icon">
                            <span className="material-symbols-outlined">{mod.icon}</span>
                          </div>
                          <div className="ar-accordion-meta">
                            <span className="ar-accordion-title">Module {mod.id}: {mod.label}</span>
                            <span className="ar-accordion-sub">{mod.subtitle}</span>
                          </div>
                          <span className={`ar-accordion-chevron material-symbols-outlined ${isOpen ? 'ar-accordion-chevron--open' : ''}`}>expand_more</span>
                        </button>

                        {/* Accordion Body */}
                        {isOpen && (
                          <div className="ar-accordion-body">

                            {/* ── ANNUAL PLAN: 12-month grid ── */}
                            {!isMonthly && (
                              <div className="ar-grid-wrap">
                                <table className="ar-month-grid">
                                  <thead>
                                    <tr>
                                      <th className="ar-grid-metric-col">Activity</th>
                                      {ET_MONTHS.map(m => <th key={m}>{m.slice(0, 3)}</th>)}
                                      <th className="ar-grid-total">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {mod.metrics.map(metric => (
                                      <tr key={metric}>
                                        <td className="ar-grid-metric-cell">{metric}</td>
                                        {ET_MONTHS.map(month => (
                                          <td key={month}>
                                            <input
                                              className="ar-grid-input"
                                              type="number"
                                              min="0"
                                              value={wizardData.gridData[metric]?.[month] || ''}
                                              onChange={e => setGrid(metric, month, e.target.value)}
                                            />
                                          </td>
                                        ))}
                                        <td className="ar-grid-total-cell">{gridTotal(metric) || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* ── MONTHLY REPORT: Target vs Actual ── */}
                            {isMonthly && (
                              <div className="ar-actuals-list">
                                {mod.metrics.map(metric => {
                                  const target = PLANNED_TARGETS[metric] ?? 0;
                                  const actualStr = wizardData.actualsData[metric]?.actual || '';
                                  const actual = parseInt(actualStr, 10);
                                  const shortfall = actualStr !== '' && !isNaN(actual) && actual < target;
                                  return (
                                    <div key={metric} className="ar-actual-row">
                                      <div className="ar-actual-metric">{metric}</div>
                                      <div className="ar-actual-cols">
                                        <div className="ar-actual-target">
                                          <span className="ar-actual-lbl">Planned Target</span>
                                          <span className="ar-actual-locked">{target}</span>
                                        </div>
                                        <div className="ar-actual-input-wrap">
                                          <span className="ar-actual-lbl">Actual Achieved</span>
                                          <input
                                            className={`ar-actual-input ${shortfall ? 'ar-actual-input--shortfall' : actualStr ? 'ar-actual-input--met' : ''}`}
                                            type="number"
                                            min="0"
                                            placeholder="—"
                                            value={actualStr}
                                            onChange={e => setActual(metric, 'actual', e.target.value)}
                                          />
                                        </div>
                                      </div>
                                      {shortfall && (
                                        <div className="ar-variance-box">
                                          <span className="material-symbols-outlined">warning</span>
                                          <div style={{ flex: 1 }}>
                                            <label className="ar-variance-lbl">Variance Explanation <em>(Please explain the shortfall)</em></label>
                                            <textarea
                                              className="ar-variance-input"
                                              placeholder="e.g. Two schools were closed for national exams…"
                                              value={wizardData.actualsData[metric]?.variance || ''}
                                              onChange={e => setActual(metric, 'variance', e.target.value)}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* ── Module E extra: Transforming Story ── */}
                            {mod.id === 'E' && isMonthly && (
                              <div className="ar-story-section">
                                <div className="ar-story-header">
                                  <span className="material-symbols-outlined">auto_awesome</span>
                                  Share a Transforming Story
                                </div>
                                <p className="ar-story-hint">Inspire the whole network! Share a testimony or success story from this month.</p>
                                <textarea
                                  className="ar-actual-input ar-story-textarea"
                                  placeholder="Describe a student testimony, a school breakthrough, or a fellowship milestone…"
                                  value={wizardData.story}
                                  onChange={e => setWizardData(d => ({ ...d, story: e.target.value }))}
                                />
                                <label className="ar-dropzone" style={{ marginTop: '0.75rem' }}>
                                  <span className="material-symbols-outlined">add_photo_alternate</span>
                                  <span>Upload Photo Evidence</span>
                                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => setWizardData(d => ({ ...d, storyFile: e.target.files?.[0] ?? null }))} />
                                </label>
                                {wizardData.storyFile && <p style={{ fontSize: '0.8rem', color: '#15803d', margin: '0.4rem 0' }}>✅ {wizardData.storyFile.name}</p>}
                                <label className="ar-story-toggle">
                                  <span className="ar-toggle-track">
                                    <input
                                      type="checkbox"
                                      checked={wizardData.featureStory}
                                      onChange={e => setWizardData(d => ({ ...d, featureStory: e.target.checked }))}
                                      style={{ position: 'absolute', opacity: 0 }}
                                    />
                                    <span className={`ar-toggle-thumb ${wizardData.featureStory ? 'ar-toggle-thumb--on' : ''}`} />
                                  </span>
                                  <span>Feature this story on the Area Dashboard?</span>
                                </label>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step 3: Review */}
              {wizardStep === 3 && (
                <div className="ar-review">
                  <div className="ar-review-banner">
                    <span className="material-symbols-outlined">fact_check</span>
                    Please review all information before submitting.
                  </div>
                  <dl className="ar-review-list">
                    <div className="ar-review-row"><dt>Document Type</dt><dd>{wizardData.docType || '—'}</dd></div>
                    <div className="ar-review-row"><dt>Reporting Period</dt><dd>{wizardData.period || '—'}</dd></div>
                    <div className="ar-review-row"><dt>Title</dt><dd>{wizardData.title || '—'}</dd></div>
                    <div className="ar-review-row"><dt>Schools Visited</dt><dd>{wizardData.schoolsVisited || '0'}</dd></div>
                    <div className="ar-review-row"><dt>Narrative</dt><dd>{wizardData.narrative ? wizardData.narrative.slice(0, 120) + '…' : '—'}</dd></div>
                    <div className="ar-review-row"><dt>Attachment</dt><dd>{wizardData.file?.name || 'None'}</dd></div>
                  </dl>
                  <div className="ar-review-note">
                    <span className="material-symbols-outlined">info</span>
                    Once submitted, your document will be sent to your Sub-Regional Coordinator for review.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="ar-modal-footer">
              {wizardStep > 1 && (
                <button className="btn btn--outline" onClick={() => setWizardStep(s => (s - 1) as WizardStep)}>
                  ← Back
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button className="btn btn--outline" onClick={() => setShowWizard(false)}>Cancel</button>
              {wizardStep < 3 ? (
                <button className="btn btn--primary" onClick={() => setWizardStep(s => (s + 1) as WizardStep)}>
                  Next Step →
                </button>
              ) : (
                <button className="btn btn--primary" onClick={handleWizardSubmit} disabled={submitting}>
                  {submitting ? 'Submitting…' : '✅ Submit Document'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* CORRECTION DETAIL SIDE PANEL                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      {selectedReport && (
        <div className="ar-overlay" onClick={() => setSelectedReport(null)}>
          <div className="ar-side-panel" onClick={e => e.stopPropagation()}>
            <div className="ar-panel-header">
              <div>
                <h2 className="ar-panel-title">{selectedReport.title}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <span className="ar-badge" style={{
                    color: STATUS_META[(selectedReport.status as KanbanStatus) in STATUS_META ? selectedReport.status as KanbanStatus : 'PENDING_REVIEW'].color,
                    background: STATUS_META[(selectedReport.status as KanbanStatus) in STATUS_META ? selectedReport.status as KanbanStatus : 'PENDING_REVIEW'].bg,
                  }}>
                    {STATUS_META[(selectedReport.status as KanbanStatus) in STATUS_META ? selectedReport.status as KanbanStatus : 'PENDING_REVIEW'].label}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Submitted: {new Date(selectedReport.dateSubmitted).toLocaleDateString()}</span>
                </div>
              </div>
              <button className="ar-modal-close" onClick={() => setSelectedReport(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="ar-panel-body">
              {/* Reviewer Feedback if correction needed */}
              {selectedReport.status === 'REQUIRES_CORRECTION' && (
                <div className="ar-feedback-module">
                  <div className="ar-feedback-header">
                    <span className="material-symbols-outlined">feedback</span>
                    Reviewer Feedback — Action Required
                  </div>
                  <div className="ar-feedback-reviewer">
                    <div className="ar-feedback-avatar">RD</div>
                    <div>
                      <strong>Regional Director</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>2 days ago</span>
                    </div>
                  </div>
                  <p className="ar-feedback-comment">
                    "Please update line item 3 with the correct budget figures. The total for outreach activities does not match the attached receipts. Also add a brief narrative for the fellowship meetings held in Week 3."
                  </p>
                  <button className="btn btn--primary" style={{ marginTop: '0.75rem', fontSize: '0.82rem' }} onClick={() => navigate('/plan/step-1')}>
                    <span className="material-symbols-outlined">edit</span>
                    Edit & Resubmit
                  </button>
                </div>
              )}

              {/* Document Details */}
              <div className="ar-panel-section">
                <h4 className="ar-panel-section-title">Document Details</h4>
                <dl className="ar-review-list">
                  <div className="ar-review-row"><dt>Document ID</dt><dd>#{selectedReport.id}</dd></div>
                  <div className="ar-review-row"><dt>Status</dt><dd>{selectedReport.status}</dd></div>
                  <div className="ar-review-row"><dt>Submitted</dt><dd>{new Date(selectedReport.dateSubmitted).toLocaleDateString()}</dd></div>
                  {selectedReport.narrative && <div className="ar-review-row"><dt>Narrative</dt><dd>{selectedReport.narrative}</dd></div>}
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
