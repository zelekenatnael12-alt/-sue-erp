import React, { useState, useEffect } from 'react';
import CardWizard, { WizardStep } from '../../components/area/CardWizard';
import { subRegionalApi } from '../../api/subRegionalApi';
import '../area/AreaForms.css';

const RegionalPlanning: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<{ reports: any[], plans: any[] }>({ reports: [], plans: [] });
  const [error, setError] = useState('');
  
  const [reportData, setReportData] = useState({
    title: '',
    narrative: '',
    expenseAmount: '',
    receipt: null as File | null
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await subRegionalApi.getManagerSubmissions();
      setSubmissions(data);
    } catch (e) {}
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', reportData.title);
      formData.append('content', reportData.narrative);
      formData.append('expenseAmount', reportData.expenseAmount);
      if (reportData.receipt) formData.append('receipt', reportData.receipt);

      await subRegionalApi.submitManagerReport(formData);
      setReportData({ title: '', narrative: '', expenseAmount: '', receipt: null });
      fetchHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps: WizardStep[] = [
    {
      title: 'Regional Audit Context',
      question: 'Identify this regional oversight period.',
      component: <input className="mobile-input" placeholder="e.g. Q3 Central Ethiopia Regional Roundup" value={reportData.title} onChange={e => setReportData({...reportData, title: e.target.value})} />
    },
    {
      title: 'Regional Narrative',
      question: 'Summarize ministry health across all sub-regions.',
      description: 'Focus on regional strategic goals and sub-regional coordination.',
      component: <textarea className="mobile-textarea" placeholder="The region is expanding in..." value={reportData.narrative} onChange={e => setReportData({...reportData, narrative: e.target.value})} />
    },
    {
      title: 'Direct Regional Expense',
      question: 'Total operational costs incurred by the regional office.',
      component: <input className="mobile-input" type="number" placeholder="0.00 ETB" value={reportData.expenseAmount} onChange={e => setReportData({...reportData, expenseAmount: e.target.value})} />
    },
    {
      title: 'Financial Integrity',
      question: 'Capture primary regional expense receipt.',
      component: (
        <div className="mobile-input-group">
          <input type="file" accept="image/*" capture="environment" id="reg-receipt" style={{ display: 'none' }} onChange={e => setReportData({...reportData, receipt: e.target.files?.[0] || null})} />
          <label htmlFor="reg-receipt" className="mobile-submit-btn" style={{ background: '#fff', color: '#2563eb', border: '2px dashed #2563eb', boxShadow: 'none' }}>
            {reportData.receipt ? '✅ Receipt Captured' : '📷 Capture Receipt'}
          </label>
        </div>
      )
    }
  ];

  return (
    <div className="area-form-page">
      <header className="area-form-header">
         <h1 className="area-form-title">Regional Pipeline</h1>
         <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '4px 0 0 0', fontWeight: 800 }}>NATIONAL OVERSIGHT SUBMISSION</p>
      </header>

      <CardWizard steps={steps} onSubmit={handleSubmit} loading={loading} error={error} />

      <section style={{ padding: '24px 16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Regional Log</h3>
        <div className="submissions-list">
          {[...submissions.reports, ...submissions.plans]
            .sort((a,b) => {
              const dateA = new Date(a.dateSubmitted || a.createdAt || a.submittedAt || 0).getTime();
              const dateB = new Date(b.dateSubmitted || b.createdAt || b.submittedAt || 0).getTime();
              return dateB - dateA;
            })
            .map((s, i) => (
              <div key={i} className="submission-card">
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="submission-type" style={{ background: '#dcfce7', color: '#166534' }}>{s.status}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(s.dateSubmitted || s.createdAt || s.submittedAt).toLocaleDateString()}</span>
                 </div>
                 <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{s.title || s.projectName || 'Monthly Roundup'}</h4>
              </div>
            ))}
            {submissions.reports.length === 0 && submissions.plans.length === 0 && (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No previous regional submissions found.</p>
            )}
        </div>
      </section>

      <style>{`
        .submission-card { background: white; padding: 16px; border-radius: 16px; margin-bottom: 12px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .submission-type { font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
      `}</style>
    </div>
  );
};

export default RegionalPlanning;
