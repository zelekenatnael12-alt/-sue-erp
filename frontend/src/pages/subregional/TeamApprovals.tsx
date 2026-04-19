import React, { useState, useEffect } from 'react';
import { subRegionalApi } from '../../api/subRegionalApi';
import '../area/AreaPortal.css';
import './SubRegional.css';

const TeamApprovals: React.FC = () => {
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
      const result = await subRegionalApi.fetchPendingApprovals();
      setData(result);
    } catch (e) {}
    setLoading(false);
  };

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedItem || !reviewType) return;
    setActionLoading(true);
    try {
      await subRegionalApi.reviewSubmission(reviewType, selectedItem.id, { status, comments });
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
         <h1 className="area-form-title">Team Approvals</h1>
      </header>

      <div className="form-toggle sticky-tabs">
        <button 
          className={`toggle-btn ${tab === 'submissions' ? 'toggle-btn--active' : ''}`}
          onClick={() => setTab('submissions')}
        >
          📄 Plans & Reports
        </button>
        <button 
          className={`toggle-btn ${tab === 'personnel' ? 'toggle-btn--active' : ''}`}
          onClick={() => setTab('personnel')}
        >
          👤 Personnel
        </button>
      </div>

      <div className="approvals-content">
        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading queue...</p>
        ) : tab === 'submissions' ? (
          <div className="inbox-list" style={{ padding: '0 16px' }}>
            {[...data.plans.map(p => ({...p, _type: 'plan'})), ...data.reports.map(r => ({...r, _type: 'report'}))].map((item: any) => (
              <div key={`${item._type}-${item.id}`} className="inbox-item" onClick={() => openReview(item, item._type)}>
                <div className="inbox-item__info">
                   <span className="inbox-item__title">{item.title || item.projectName}</span>
                   <span className="inbox-item__date">By {item.author?.name} • {new Date(item.createdAt || item.submittedAt).toLocaleDateString()}</span>
                </div>
                <span className="submission-type" style={{ background: item._type === 'plan' ? '#dcfce7' : '#dbeafe', color: item._type === 'plan' ? '#166534' : '#1e40af' }}>
                  {item._type.toUpperCase()}
                </span>
              </div>
            ))}
            {data.plans.length === 0 && data.reports.length === 0 && <p className="empty-msg">No pending submissions.</p>}
          </div>
        ) : (
          <div className="inbox-list" style={{ padding: '0 16px' }}>
            {data.associates.map((item: any) => (
              <div key={item.id} className="inbox-item" onClick={() => openReview(item, 'associate')}>
                <div className="inbox-item__info">
                   <span className="inbox-item__title">{item.name}</span>
                   <span className="inbox-item__date">Registered by {item.registeredBy?.name}</span>
                </div>
                <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>person_search</span>
              </div>
            ))}
            {data.associates.length === 0 && <p className="empty-msg">No pending personnel.</p>}
          </div>
        )}
      </div>

      {/* Review Bottom Sheet */}
      {selectedItem && (
        <div className="mobile-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="mobile-modal-sheet" onClick={e => e.stopPropagation()}>
             <div className="modal-drag-handle" />
             <h3 className="modal-title">Review Submission</h3>
             
             <div className="review-preview-scroll">
                {reviewType === 'associate' ? (
                  <div className="personnel-preview">
                    <img src={selectedItem.photoUrl || `https://ui-avatars.com/api/?name=${selectedItem.name}`} alt="Associate" className="preview-photo" />
                    <h4>{selectedItem.name}</h4>
                    <p><strong>Phone:</strong> {selectedItem.phone}</p>
                    <p><strong>Background:</strong> {selectedItem.background}</p>
                  </div>
                ) : (
                  <div className="data-preview">
                     <h4>{selectedItem.title || selectedItem.projectName}</h4>
                     <p className="preview-content">{selectedItem.content || selectedItem.narrative || 'No content provided.'}</p>
                     {selectedItem.expenseAmount > 0 && (
                       <div className="preview-expense">
                          <span>Verified Expense:</span>
                          <strong>{selectedItem.expenseAmount} ETB</strong>
                       </div>
                     )}
                     {selectedItem.receiptUrl && <img src={`/erp${selectedItem.receiptUrl}`} alt="Receipt" className="preview-receipt" />}
                  </div>
                )}
             </div>

             <div className="mobile-input-group" style={{ marginTop: '20px' }}>
                <label className="mobile-label">Manager Comments</label>
                <textarea 
                  className="mobile-textarea" 
                  placeholder="Provide feedback or reasons for rejection..."
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                />
             </div>

             <div className="modal-actions">
                <button className="mobile-submit-btn" style={{ background: '#ef4444' }} onClick={() => handleReview('REJECTED')} disabled={actionLoading}>
                   ✕ Request Revision
                </button>
                <button className="mobile-submit-btn" style={{ background: '#10b981' }} onClick={() => handleReview('APPROVED')} disabled={actionLoading}>
                   ✓ Approve
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
        .empty-msg { text-align: center; color: #94a3b8; margin-top: 40px; font-weight: 700; }
        .mobile-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: flex-end;
          z-index: 1000;
        }
        .mobile-modal-sheet {
          width: 100%;
          background: white;
          border-radius: 24px 24px 0 0;
          padding: 16px 24px 48px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }
        .modal-drag-handle {
          width: 40px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          margin: 0 auto 16px;
        }
        .review-preview-scroll {
          max-height: 40vh;
          overflow-y: auto;
          background: #f8fafc;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #f1f5f9;
        }
        .preview-photo { width: 80px; height: 80px; border-radius: 40px; object-fit: cover; margin-bottom: 12px; }
        .preview-content { font-size: 0.9rem; line-height: 1.5; color: #475569; white-space: pre-wrap; }
        .preview-expense { margin-top: 12px; font-size: 0.9rem; color: #1e293b; background: #e0f2fe; padding: 8px; border-radius: 8px; }
        .preview-receipt { width: 100%; margin-top: 12px; border-radius: 8px; }
        .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default TeamApprovals;
