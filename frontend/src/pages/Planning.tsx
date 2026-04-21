import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import './Planning.css';

export default function Planning() {
  useAuth();
  const [activeTab, setActiveTab] = useState<'strategy' | 'approvals'>('strategy');
  const [stratType, setStratType] = useState<'plan' | 'report'>('plan');
  
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [teamSubmissions, setTeamSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [stratTitle, setStratTitle] = useState('');
  const [stratContent, setStratContent] = useState('');

  // Approval Modal State
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [reviewComments, setReviewComments] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const p: any = await api.getPlansUnified();
      const r: any = await api.getReportsUnified();
      
      const combinedMy = [
        ...p.mySubmissions.map((x:any)=>({...x, _type:'plan'})), 
        ...r.mySubmissions.map((x:any)=>({...x, _type:'report'}))
      ];
      const combinedTeam = [
        ...p.teamSubmissions.map((x:any)=>({...x, _type:'plan'})), 
        ...r.teamSubmissions.map((x:any)=>({...x, _type:'report'}))
      ];
      
      combinedMy.sort((a,b) => new Date(b.createdAt || b.dateSubmitted || b.submittedAt || 0).getTime() - new Date(a.createdAt || a.dateSubmitted || a.submittedAt || 0).getTime());
      combinedTeam.sort((a,b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
      
      setMySubmissions(combinedMy);
      setTeamSubmissions(combinedTeam);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [activeTab]);

  const handleSubmitStrategy = async (status: string) => {
    if (!stratTitle.trim()) return;
    try {
      const payload = { title: stratTitle, content: stratContent, status };
      if (stratType === 'plan') {
         await api.createPlanUnified(payload);
      } else {
         await api.createReportUnified(payload);
      }
      setStratTitle(''); setStratContent('');
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleOpenReview = async (doc: any) => {
    setSelectedDoc(doc);
    try {
       await api.reviewWorkflow(doc._type, doc.id, { isView: true });
    } catch (e) { console.error(e); }
  };

  const handleReviewAction = async (status: string) => {
    if (!selectedDoc) return;
    try {
       await api.reviewWorkflow(selectedDoc._type, selectedDoc.id, { status, comments: reviewComments });
       setSelectedDoc(null);
       setReviewComments('');
       loadData();
    } catch (e) { console.error(e); }
  }

  return (
    <div className="plan-module">
      <div className="plan-tabs">
        <button className={`plan-tab ${activeTab === 'strategy' ? 'plan-tab--active' : ''}`} onClick={() => setActiveTab('strategy')}>
          <span className="material-symbols-outlined">edit_document</span> My Strategy
        </button>
        <button className={`plan-tab ${activeTab === 'approvals' ? 'plan-tab--active' : ''}`} onClick={() => setActiveTab('approvals')}>
           <span className="material-symbols-outlined">inbox</span> Team Approvals
        </button>
      </div>

      {loading ? <p>Loading Data...</p> : (
         <>
           {activeTab === 'strategy' && (
             <div className="tab-content strat-tab">
               <div className="strat-toggle">
                  <button className={stratType === 'plan' ? 'active' : ''} onClick={() => setStratType('plan')}>Annual Plan</button>
                  <button className={stratType === 'report' ? 'active' : ''} onClick={() => setStratType('report')}>Progress Report</button>
               </div>

               <div className="accordion">
                  <div className="acc-section">
                     <div className="acc-header">Section 1: Setup Details</div>
                     <div className="acc-content">
                       <input className="huge-input" placeholder="Title of your document..." value={stratTitle} onChange={e => setStratTitle(e.target.value)} />
                       <textarea className="huge-textarea" placeholder="Detailed objective metrics, budget, and timeline..." value={stratContent} onChange={e => setStratContent(e.target.value)} />
                     </div>
                  </div>
               </div>

               <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                  <button className="huge-btn-green" onClick={() => handleSubmitStrategy('PENDING')}>Submit to Manager</button>
                  <button className="btn btn--outline" style={{width: '100%', padding: '1rem', fontSize: '1.05rem'}} onClick={() => handleSubmitStrategy('DRAFT')}>Save as Draft</button>
               </div>

               <div className="history-board">
                  <h3>Submission History</h3>
                  {mySubmissions.map(s => (
                     <div key={s.id + s._type} className="history-card">
                       <div>
                         <strong style={{textTransform:'capitalize'}}>{s._type}</strong>: {s.title || s.projectName}
                         <div style={{fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem'}}>
                            Submitted: {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : 'N/A'}
                         </div>
                       </div>
                       <span className="ibx-badge">{s.status}</span>
                     </div>
                  ))}
               </div>
             </div>
           )}

           {activeTab === 'approvals' && (
             <div className="tab-content app-tab">
                <h3>Manager Inbox</h3>
                <div className="inbox-list">
                  {teamSubmissions.map(s => (
                    <div key={s.id + s._type} className="inbox-card" onClick={() => handleOpenReview(s)}>
                       <div className="ibx-title">{s.title || s.projectName}</div>
                       <div className="ibx-meta">
                         <span style={{display:'flex', alignItems:'center', gap:'4px'}}><span className="material-symbols-outlined" style={{fontSize: '14px'}}>person</span> {s.author?.full_name}</span>
                         <span>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : ''}</span>
                       </div>
                       <span className="ibx-badge">{s.status}</span>
                    </div>
                  ))}
                  {teamSubmissions.length === 0 && <p style={{color: '#64748b', fontStyle: 'italic'}}>No pending submissions from your team.</p>}
                </div>
             </div>
           )}
         </>
      )}

      {selectedDoc && (
         <div className="bottom-sheet" onClick={() => setSelectedDoc(null)}>
            <div className="sheet-content" onClick={e => e.stopPropagation()}>
               <button className="close-sheet" onClick={() => setSelectedDoc(null)}>
                  <span className="material-symbols-outlined">close</span>
               </button>
               <h2 style={{marginTop: 0, paddingRight: '2rem'}}>{selectedDoc.title || selectedDoc.projectName}</h2>
               <div className="timeline">
                  <div className="timeline-item active">
                    <span className="material-symbols-outlined">send</span> Submitted: {selectedDoc.submittedAt ? new Date(selectedDoc.submittedAt).toLocaleString() : 'Recently'}
                  </div>
                  <div className="timeline-item active">
                    <span className="material-symbols-outlined">visibility</span> Viewed: Just Now
                  </div>
                  {selectedDoc.decidedAt && (
                  <div className="timeline-item">
                    <span className="material-symbols-outlined">gavel</span> Decided: {new Date(selectedDoc.decidedAt).toLocaleString()}
                  </div>
                  )}
               </div>

               <div style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', minHeight: '150px', maxHeight: '30vh', overflowY: 'auto' }}>
                 <p style={{marginTop: 0, fontWeight: 600}}>Content:</p>
                 <p style={{whiteSpace: 'pre-wrap', color: 'var(--color-text-muted)'}}>{selectedDoc.content}</p>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{fontWeight: 600}}>Manager Comments:</label>
                  <textarea className="huge-textarea" style={{minHeight: '80px', padding: '0.75rem'}} value={reviewComments} onChange={e => setReviewComments(e.target.value)} placeholder="Provide your feedback..."></textarea>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem' }}>
                 <button className="huge-btn-red" onClick={() => handleReviewAction('REJECTED')}>✕ Request Revision</button>
                 <button className="huge-btn-green" onClick={() => handleReviewAction('APPROVED')}>✓ Approve</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
