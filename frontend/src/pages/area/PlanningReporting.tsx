import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CardWizard, { WizardStep } from '../../components/area/CardWizard';
import { areaApi } from '../../api/areaApi';
import { useAutoSave } from '../../hooks/useAutoSave';
import { persistenceService } from '../../services/persistenceService';
import './AreaForms.css';

const PlanningReporting: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'plan' | 'report' | 'history'>('report');
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<{ reports: any[], plans: any[] }>({ reports: [], plans: [] });
  const [error, setError] = useState('');
  
  // Form States
  const [planData, setPlanData] = useState({
    title: '',
    location: '',
    targetSchools: '',
    totalAnnualTarget: '',
    q1Target: '',
    q2Target: '',
    q3Target: '',
    q4Target: '',
    coreTopics: '',
    estimatedBudget: '',
    narrative: ''
  });

  const [reportData, setReportData] = useState({
    content: '',
    ministryRaised: '',
    ministryExpended: '',
    receipt: null as File | null,
    receiptJustification: ''
  });

  // ─── Auto-Save ─────────────────────────────────────────────────────────────
  useAutoSave('area_plan_draft', planData, tab === 'plan');
  useAutoSave('area_report_draft', reportData, tab === 'report');

  useEffect(() => {
    fetchSubmissions();
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    const pDraft = await persistenceService.getDraft('area_plan_draft');
    if (pDraft && pDraft.data && pDraft.data.title) {
       // Only load if it's not empty
       setPlanData(pDraft.data);
    }
    const rDraft = await persistenceService.getDraft('area_report_draft');
    if (rDraft && rDraft.data && (rDraft.data.content || rDraft.data.ministryRaised)) {
       setReportData(rDraft.data);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const data = await areaApi.getSubmissions();
      setSubmissions(data);
    } catch (e) {}
  };

  const handlePlanSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await areaApi.submitPlan({ ...planData, status: 'PENDING_REVIEW' });
      await persistenceService.clearDraft('area_plan_draft');
      setTab('history');
      fetchSubmissions();
      resetForms();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('content', reportData.content);
      formData.append('ministryRaised', reportData.ministryRaised);
      formData.append('ministryExpended', reportData.ministryExpended);
      formData.append('receiptJustification', reportData.receiptJustification);
      formData.append('status', 'PENDING_REVIEW');
      if (reportData.receipt) {
        formData.append('receipt', reportData.receipt);
      }

      await areaApi.submitReport(formData);
      await persistenceService.clearDraft('area_report_draft');
      setTab('history');
      fetchSubmissions();
      resetForms();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setPlanData({
      title: '', location: '', targetSchools: '', totalAnnualTarget: '',
      q1Target: '', q2Target: '', q3Target: '', q4Target: '',
      coreTopics: '', estimatedBudget: '', narrative: ''
    });
    setReportData({
      content: '', ministryRaised: '', ministryExpended: '',
      receipt: null, receiptJustification: ''
    });
  };

  // --- Annual Plan Steps ---
  const planWizardSteps: WizardStep[] = [
    {
      title: '🎯 Mission Title',
      question: 'Name this annual strategic plan.',
      component: (
        <input 
          className="mobile-input" 
          placeholder="e.g. 2024 Arada Outreach" 
          value={planData.title}
          style={{ fontSize: '1.2rem', fontWeight: 800, padding: '16px' }}
          onChange={e => setPlanData({...planData, title: e.target.value})}
        />
      )
    },
    {
      title: '👥 Annual Target',
      question: 'How many children/youth is your total goal?',
      description: 'Your impact is measured in lives reached.',
      component: (
        <input 
          className="mobile-input" 
          type="number"
          placeholder="e.g. 5000" 
          value={planData.totalAnnualTarget}
          onChange={e => setPlanData({...planData, totalAnnualTarget: e.target.value})}
        />
      )
    },
    {
      title: '📅 Quarterly Allocation',
      question: 'Divide your total target across the year.',
      component: (
        <div>
          <div className="quarter-grid">
            {['q1Target', 'q2Target', 'q3Target', 'q4Target'].map((q, idx) => (
              <div key={q} className="mobile-input-group">
                <label className="mobile-label">Quarter {idx + 1}</label>
                <input 
                  className="mobile-input" 
                  type="number" 
                  placeholder="0"
                  value={(planData as any)[q]}
                  onChange={e => setPlanData({...planData, [q]: e.target.value})}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', fontSize: '10px', color: '#6366f1', fontWeight: 800 }}>
            RUNNING TOTAL: { (parseInt(planData.q1Target)||0) + (parseInt(planData.q2Target)||0) + (parseInt(planData.q3Target)||0) + (parseInt(planData.q4Target)||0) } / {planData.totalAnnualTarget || 0}
          </div>
        </div>
      )
    },
    {
      title: 'Core Topics',
      question: 'What central teachings will be covered?',
      component: (
        <textarea 
          className="mobile-textarea" 
          placeholder="Biblical foundation, leadership..." 
          value={planData.coreTopics}
          onChange={e => setPlanData({...planData, coreTopics: e.target.value})}
        />
      )
    },
    {
      title: 'Budget Estimate',
      question: 'What is the estimated budget for this plan?',
      component: (
        <div className="mobile-input-group">
          <label className="mobile-label">Estimated ETB</label>
          <input 
            className="mobile-input" 
            type="number" 
            placeholder="0.00"
            value={planData.estimatedBudget}
            onChange={e => setPlanData({...planData, estimatedBudget: e.target.value})}
          />
        </div>
      )
    },
    {
      title: 'Review Plan',
      question: 'Confirm your strategic goals.',
      component: (
        <div className="review-card">
          <div className="review-item"><strong>Title:</strong> {planData.title}</div>
          <div className="review-item"><strong>Annual Target:</strong> {planData.totalAnnualTarget}</div>
          <div className="review-item">
            <strong>Quarters:</strong> Q1: {planData.q1Target} | Q2: {planData.q2Target} | Q3: {planData.q3Target} | Q4: {planData.q4Target}
          </div>
          <div className="review-item"><strong>Budget:</strong> {planData.estimatedBudget} ETB</div>
        </div>
      )
    }
  ];

  // --- Monthly Report Steps ---
  const activePlan = submissions.plans.find(p => p.status === 'APPROVED');
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  const reportWizardSteps: WizardStep[] = [
    {
      title: '📖 Ministry Context',
      question: 'Achievements & Core Teachings covered.',
      description: `Target for ${Object.keys(planData.q1Target ? {q1Target:1} : {}).length > 0 ? 'This Quarter' : 'Unset'}: ${activePlan ? Math.floor(activePlan.totalAnnualTarget / 4) : '---'} reached`,
      component: (
        <div className="mobile-input-group">
          <label className="mobile-label">Core Teachings Covered ({currentMonth})</label>
          <textarea 
            className="mobile-textarea" 
            placeholder="I taught on the fruit of the spirit..." 
            style={{ minHeight: '120px' }}
            value={reportData.content}
            onChange={e => setReportData({...reportData, content: e.target.value})}
          />
        </div>
      )
    },
    {
      title: '💰 Ministry Finance',
      question: 'Did you raise or expend ministry funds?',
      component: (
        <div className="finance-stack">
          <div className="mobile-input-group">
            <label className="mobile-label">Raised (ETB)</label>
            <input 
              className="mobile-input" 
              type="number" 
              placeholder="0.00"
              value={reportData.ministryRaised}
              onChange={e => setReportData({...reportData, ministryRaised: e.target.value})}
            />
          </div>
          <div className="mobile-input-group">
            <label className="mobile-label">Expended (ETB)</label>
            <input 
              className="mobile-input" 
              type="number" 
              placeholder="0.00"
              value={reportData.ministryExpended}
              onChange={e => setReportData({...reportData, ministryExpended: e.target.value})}
            />
          </div>
          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}>
             <strong>Net Impact:</strong> {(parseFloat(reportData.ministryRaised)||0) - (parseFloat(reportData.ministryExpended)||0)} ETB
          </div>
        </div>
      )
    },
    {
      title: '📸 Financial Proof',
      question: 'Snapshot receipt or provide justification.',
      component: (
        <div className="finance-stack">
          <div className="mobile-input-group">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              id="receipt-upload" 
              style={{ display: 'none' }}
              onChange={e => setReportData({...reportData, receipt: e.target.files?.[0] || null})}
            />
            <label htmlFor="receipt-upload" className="mobile-submit-btn" style={{ background: '#fff', color: '#2563eb', border: '2px dashed #2563eb', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">{reportData.receipt ? 'check_circle' : 'photo_camera'}</span>
              {reportData.receipt ? 'Receipt Captured' : 'Open Camera'}
            </label>
          </div>
          {parseFloat(reportData.ministryExpended) > 0 && !reportData.receipt && (
            <div className="mobile-input-group" style={{ marginTop: '12px', animation: 'shake 0.5s' }}>
              <label className="mobile-label" style={{ color: '#dc2626' }}>Receipt Justification Required</label>
              <textarea 
                className="mobile-textarea" 
                placeholder="Why is a receipt unavailable?" 
                value={reportData.receiptJustification}
                onChange={e => setReportData({...reportData, receiptJustification: e.target.value})}
              />
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Final Review',
      question: 'Summary of Monthly Activities.',
      component: (
        <div className="review-card">
          <div className="review-item"><strong>Month:</strong> {currentMonth}</div>
          <div className="review-item"><strong>Raised:</strong> {reportData.ministryRaised || '0'} ETB</div>
          <div className="review-item"><strong>Expended:</strong> {reportData.ministryExpended || '0'} ETB</div>
          <div className="review-item">
            <strong>Proof:</strong> {reportData.receipt ? 'Receipt Captured' : (reportData.receiptJustification ? 'Written Justification' : 'None')}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="area-form-page">
      <header className="area-form-header">
        <button className="back-btn" onClick={() => navigate('/area/home')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="area-form-title">Ministry Pipeline</h1>
      </header>

      <nav className="form-tab-bar">
        <button className={`tab-item ${tab === 'report' ? 'tab-item--active' : ''}`} onClick={() => setTab('report')}>Report</button>
        <button className={`tab-item ${tab === 'plan' ? 'tab-item--active' : ''}`} onClick={() => setTab('plan')}>Plan</button>
        <button className={`tab-item ${tab === 'history' ? 'tab-item--active' : ''}`} onClick={() => setTab('history')}>Log</button>
      </nav>

      <div className="form-content">
        {tab === 'report' && <CardWizard steps={reportWizardSteps} onSubmit={handleReportSubmit} loading={loading} error={error} />}
        {tab === 'plan' && <CardWizard steps={planWizardSteps} onSubmit={handlePlanSubmit} loading={loading} error={error} />}
        {tab === 'history' && (
          <div className="submissions-list">
            {[...submissions.reports, ...submissions.plans]
              .sort((a, b) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime())
              .map((sub, i) => (
                <div key={i} className="submission-card">
                  <div className="submission-meta">
                    <span className="submission-type">{sub.projectName ? 'PLAN' : (sub.generatedId ? sub.generatedId : 'REPORT')}</span>
                    <span className={`submission-status status--${sub.status.toLowerCase()}`}>{sub.status}</span>
                  </div>
                  <h4 className="submission-title">{sub.projectName || sub.autoName || sub.title}</h4>
                  <div className="submission-footer">
                    <span>{new Date(sub.submittedAt || sub.createdAt).toLocaleDateString()}</span>
                    <span>{sub.receiptUrl ? '📎 Receipt' : 'No Receipt'}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <style>{`
        .form-tab-bar {
          display: flex;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        .tab-item {
          flex: 1;
          border: none;
          background: none;
          padding: 10px;
          font-weight: 700;
          color: #64748b;
          border-radius: 8px;
          cursor: pointer;
        }
        .tab-item--active {
          background: #fff;
          color: #2563eb;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .quarter-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .review-card {
          background: #f8fafc;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }
        .review-item {
          margin-bottom: 8px;
          font-size: 0.9rem;
          color: #1e293b;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 4px;
        }
        .review-item:last-child { border-bottom: none; }
        .finance-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .submission-card {
          background: #fff;
          padding: 16px;
          border-radius: 16px;
          margin-bottom: 12px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .submission-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .submission-type {
          font-size: 0.65rem;
          font-weight: 900;
          color: #2563eb;
          background: #dbeafe;
          padding: 4px 10px;
          border-radius: 100px;
        }
        .submission-status {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 100px;
        }
        .status--pending { background: #fef3c7; color: #92400e; }
        .status--approved { background: #d1fae5; color: #065f46; }
        .status--rejected { background: #fee2e2; color: #991b1b; }
        .submission-title { font-size: 0.95rem; font-weight: 700; margin: 0 0 4px 0; color: #1e293b; }
        .submission-footer { display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; }
      `}</style>
    </div>
  );
};

export default PlanningReporting;
