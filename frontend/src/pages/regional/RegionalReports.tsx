import React, { useState, useEffect } from 'react';
import { regionalApi } from '../../api/regionalApi';
import '../area/AreaPortal.css';
import '../subregional/SubRegional.css';

const RegionalReports: React.FC = () => {
  const [tab, setTab] = useState<'submissions' | 'personnel'>('submissions');
  const [data, setData] = useState<{ associates: any[], reports: any[], plans: any[] }>({ associates: [], reports: [], plans: [] });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reviewType, setReviewType] = useState<'plan' | 'report' | 'associate' | null>(null);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await regionalApi.fetchPendingApprovals();
      setData(result);
    } catch (e) {
      console.error('Failed to fetch regional approvals:', e);
    }
    setLoading(false);
  };

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedItem || !reviewType) return;
    setActionLoading(true);
    try {
      await regionalApi.reviewSubmission(reviewType, selectedItem.id, { status, comments });
      setSelectedItem(null);
      setComments('');
      fetchData();
    } catch (e) {
      alert('Failed to submit review');
    }
    setActionLoading(false);
  };

  const openReview = (item: any, type: 'plan' | 'report' | 'associate') => {
    setSelectedItem(item);
    setReviewType(type);
  };

  return (
    <div className="area-form-page">
      <header className="area-form-header">
         <h1 className="area-form-title">Regional Oversight</h1>
         <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 800 }}>PENDING REGIONAL REVIEW</p>
      </header>

      <div className="form-toggle sticky-tabs" style={{ marginBottom: '16px' }}>
        <button 
          className={`toggle-btn ${tab === 'submissions' ? 'toggle-btn--active' : ''}`}
          onClick={() => setTab('submissions')}
        >
          📂 Regional Portfolio
        </button>
        <button 
          className={`toggle-btn ${tab === 'personnel' ? 'toggle-btn--active' : ''}`}
          onClick={() => setTab('personnel')}
        >
          👥 Regional Talent
        </button>
      </div>

      <div className="approvals-content">
        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '40px' }}>Syncing queue...</p>
        ) : tab === 'submissions' ? (
          <div className="inbox-list" style={{ padding: '0 16px' }}>
            {[...data.plans.map(p => ({...p, _type: 'plan'})), ...data.reports.map(r => ({...r, _type: 'report'}))].map((item: any) => (
              <div key={`${item._type}-${item.id}`} className="inbox-item" onClick={() => openReview(item, item._type)}>
                <div className="inbox-item__info">
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="inbox-item__title">{item.title || item.projectName}</span>
                      {['PENDING', 'PENDING_REVIEW', 'SUBMITTED'].includes(item.status) && (
                        <span style={{ fontSize: '0.65rem', background: '#fff7ed', color: '#c2410c', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, border: '1px solid #ffedd5' }}>
                          ACTING AS MANAGER
                        </span>
                      )}
                   </div>
                   <span className="inbox-item__date">By {item.author?.full_name || item.author?.name} • {new Date(item.dateSubmitted || item.submittedAt || item.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className="submission-type" style={{ background: item._type === 'plan' ? '#eff6ff' : '#f0fdf4', color: item._type === 'plan' ? '#1d4ed8' : '#15803d' }}>
                    {item._type.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>{item.status}</span>
                </div>
              </div>
            ))}
            {data.plans.length === 0 && data.reports.length === 0 && <p className="empty-msg">No submissions requiring regional review.</p>}
          </div>
        ) : (
          <div className="inbox-list" style={{ padding: '0 16px' }}>
            {data.associates.map((item: any) => (
              <div key={item.id} className="inbox-item" onClick={() => openReview(item, 'associate')}>
                <div className="inbox-item__info">
                   <span className="inbox-item__title">{item.name}</span>
                   <span className="inbox-item__date">Registered by {item.registeredBy?.full_name || item.registeredBy?.name}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                   <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>person_pin</span>
                   <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>{item.status}</span>
                </div>
              </div>
            ))}
            {data.associates.length === 0 && <p className="empty-msg">No pending talent registrations.</p>}
          </div>
        )}
      </div>

      {/* Review Bottom Sheet */}
      {selectedItem && (
        <div className="mobile-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="mobile-modal-sheet" onClick={e => e.stopPropagation()}>
             <div className="modal-drag-handle" />
             <h3 className="modal-title">
               {['PENDING', 'PENDING_REVIEW', 'SUBMITTED'].includes(selectedItem.status) ? 'Sub-Regional Step-In' : 'Regional Audit'}
             </h3>
             
             <div className="review-preview-scroll">
                {reviewType === 'associate' ? (
                  <div className="personnel-preview">
                    <img src={selectedItem.photoUrl || `https://ui-avatars.com/api/?name=${selectedItem.name}`} alt="Associate" className="preview-photo" />
                    <h4>{selectedItem.name}</h4>
                    <p><strong>Phone:</strong> {selectedItem.phone}</p>
                    <p><strong>Region/Area:</strong> {selectedItem.region} / {selectedItem.area}</p>
                  </div>
                ) : (
                  <div className="data-preview">
                     <h4>{selectedItem.title || selectedItem.projectName}</h4>
                     <p className="preview-content">{selectedItem.content || selectedItem.narrative || 'No detailed content provided.'}</p>
                     {(selectedItem.expenseAmount > 0 || selectedItem.ministryExpended > 0) && (
                       <div className="preview-expense">
                          <span>Reported Expenditure:</span>
                          <strong>{selectedItem.expenseAmount || selectedItem.ministryExpended} ETB</strong>
                       </div>
                     )}
                     {selectedItem.receiptUrl && <img src={`/erp${selectedItem.receiptUrl}`} alt="Receipt" className="preview-receipt" />}
                  </div>
                )}
             </div>

             <div className="mobile-input-group" style={{ marginTop: '20px' }}>
                <label className="mobile-label">Regional Director Comments</label>
                <textarea 
                  className="mobile-textarea" 
                  placeholder="Official feedback..."
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                />
             </div>

             <div className="modal-actions">
                <button className="mobile-submit-btn" style={{ background: '#ef4444' }} onClick={() => handleReview('REJECTED')} disabled={actionLoading}>
                   ✕ Request Revision
                </button>
                <button className="mobile-submit-btn" style={{ background: '#2563eb' }} onClick={() => handleReview('APPROVED')} disabled={actionLoading}>
                   ✓ Regional Approval
                </button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .sticky-tabs {
          position: sticky;
          top: 0;
          background: #f8fafc;
          padding: 12px 16px;
          z-index: 10;
        }
        .empty-msg { text-align: center; color: #94a3b8; margin-top: 40px; font-weight: 700; font-size: 0.9rem; }
        .inbox-item { background: white; padding: 16px; border-radius: 20px; margin-bottom: 12px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .inbox-item__title { display: block; font-weight: 800; font-size: 0.95rem; color: #1e293b; margin-bottom: 2px; }
        .inbox-item__date { font-size: 0.75rem; color: #64748b; }
      `}</style>
    </div>
  );
};

export default RegionalReports;
