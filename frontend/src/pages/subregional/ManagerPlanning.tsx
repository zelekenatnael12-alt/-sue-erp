import { useState, useEffect } from 'react';
import CardWizard, { WizardStep } from '../../components/area/CardWizard';
import { subRegionalApi } from '../../api/subRegionalApi';
import '../area/AreaForms.css';

const ManagerPlanning = () => {
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<{ reports: any[], plans: any[] }>({ reports: [], plans: [] });
  
  const [reportData, setReportData] = useState({
    title: '',
    narrative: '',
    expenseAmount: '',
    receipt: null as File | null
  });
  const [error, setError] = useState('');

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
      title: 'Report Context',
      question: 'Identify this management period.',
      component: <input className="mobile-input" placeholder="e.g. Q1 Sub-Regional Review" value={reportData.title} onChange={e => setReportData({...reportData, title: e.target.value})} />
    },
    {
      title: 'Operational Narrative',
      question: 'Summarize sub-regional ministry health.',
      description: 'Highlight Area-level successes and coordination challenges.',
      component: <textarea className="mobile-textarea" placeholder="Ministry is thriving in Area X but..." value={reportData.narrative} onChange={e => setReportData({...reportData, narrative: e.target.value})} />
    },
    {
      title: 'Financial Claim',
      question: 'Total sub-regional operational expense.',
      component: <input className="mobile-input" type="number" placeholder="0.00 ETB" value={reportData.expenseAmount} onChange={e => setReportData({...reportData, expenseAmount: e.target.value})} />
    },
    {
      title: 'Verification',
      question: 'Capture primary receipt.',
      component: (
        <div className="mobile-input-group">
          <input type="file" accept="image/*" capture="environment" id="mgr-receipt" style={{ display: 'none' }} onChange={e => setReportData({...reportData, receipt: e.target.files?.[0] || null})} />
          <label htmlFor="mgr-receipt" className="mobile-submit-btn" style={{ background: '#fff', color: '#2563eb', border: '2px dashed #2563eb', boxShadow: 'none' }}>
            {reportData.receipt ? '✅ Receipt Captured' : '📷 Capture Receipt'}
          </label>
        </div>
      )
    }
  ];

  return (
    <div className="area-form-page">
      <header className="area-form-header">
         <h1 className="area-form-title">Manager Planning</h1>
      </header>

      <CardWizard steps={steps} onSubmit={handleSubmit} loading={loading} error={error} />

      <section style={{ padding: '24px 16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>History Board</h3>
        <div className="submissions-list">
          {[...submissions.reports, ...submissions.plans]
            .sort((a,b) => new Date(b.createdAt || b.submittedAt).getTime() - new Date(a.createdAt || a.submittedAt).getTime())
            .map((s, i) => (
              <div key={i} className="submission-card">
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="submission-type" style={{ background: '#fef3c7', color: '#92400e' }}>REGIONAL PENDING</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(s.createdAt || s.submittedAt).toLocaleDateString()}</span>
                 </div>
                 <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{s.title || s.projectName}</h4>
              </div>
            ))}
        </div>
      </section>

      <style>{`
        .submission-card { background: white; padding: 16px; border-radius: 16px; margin-bottom: 12px; border: 1px solid #f1f5f9; }
        .submission-type { font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default ManagerPlanning;
