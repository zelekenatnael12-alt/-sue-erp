import { useState, useEffect } from 'react';
import { api, CapacityRequest } from '../api/api';
import { useAuth } from '../context/AuthContext';
import './CapacityWorkflow.css';

export default function CapacityWorkflow() {
  const { user } = useAuth();
  
  // Data State
  const [requests, setRequests] = useState<CapacityRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State (Tier 1)
  const [roleRequested, setRoleRequested] = useState('');
  const [location, setLocation] = useState('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Logic
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getCapacityRequests();
      setRequests(data);
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleRequested || !location || !justification) return;

    try {
      setIsSubmitting(true);
      await api.createCapacityRequest({ roleRequested, location, justification });
      
      // Reset form
      setRoleRequested('');
      setLocation('');
      setJustification('');
      
      // Refresh list
      await fetchRequests();
    } catch (err: any) {
      alert('Error creating request: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.approveCapacityRequest(id);
      await fetchRequests();
    } catch (err: any) {
      alert('Approval failed: ' + err.message);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.rejectCapacityRequest(id);
      await fetchRequests();
    } catch (err: any) {
      alert('Rejection failed: ' + err.message);
    }
  };

  // Role Checks
  const isAreaStaff = user?.role === 'AREA_STAFF';
  const isSubRegional = user?.role === 'SUB_REGIONAL' || user?.role === 'COORDINATOR';
  const isNational = ['NATIONAL', 'EXECUTIVE', 'ADMIN'].includes(user?.role || '');

  // Helper for status badges
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING_SUB_REGION': return <span className="cwf-badge cwf-badge-blue">SUB-REGION REVIEW</span>;
      case 'PENDING_NATIONAL': return <span className="cwf-badge cwf-badge-purple">NATIONAL REVIEW</span>;
      case 'APPROVED': return <span className="cwf-badge cwf-badge-green">APPROVED</span>;
      case 'REJECTED': return <span className="cwf-badge cwf-badge-red">REJECTED</span>;
      default: return <span className="cwf-badge">{status}</span>;
    }
  };

  return (
    <div className="cwf-container">
      
      {/* ──────────────────────────────────────────────────────────── */}
      {/* TIER 3: NATIONAL APEX (MASTER ROLL-UP) ──────────────────── */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="cwf-tier cwf-tier-3">
        <div className="cwf-tier-header">
          <h2>Tier 3: National Capacity Orchestration</h2>
          <span className="cwf-badge cwf-badge-purple">EXECUTIVE APEX</span>
        </div>
        <div className="cwf-kpi-grid">
          <div className="cwf-kpi-card">
            <span className="material-symbols-outlined cwf-kpi-icon">group_add</span>
            <div className="cwf-kpi-content">
              <span className="cwf-kpi-value">{requests.filter(r => r.status === 'APPROVED').length}</span>
              <span className="cwf-kpi-label">Approved Placements</span>
            </div>
          </div>
          <div className="cwf-kpi-card">
            <span className="material-symbols-outlined cwf-kpi-icon">pending_actions</span>
            <div className="cwf-kpi-content">
              <span className="cwf-kpi-value">{requests.filter(r => r.status.startsWith('PENDING')).length}</span>
              <span className="cwf-kpi-label">In-Flight Requests</span>
            </div>
          </div>
          <div className="cwf-kpi-card">
            <span className="material-symbols-outlined cwf-kpi-icon">domain</span>
            <div className="cwf-kpi-content">
              <span className="cwf-kpi-value">{new Set(requests.map(r => r.location)).size}</span>
              <span className="cwf-kpi-label">Active Growth Nodes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="cwf-flow-arrow material-symbols-outlined">straight</div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TIER 2: APPROVAL INBOX (GATEKEEPER) ─────────────────────── */}
      {/* ──────────────────────────────────────────────────────────── */}
      {(isSubRegional || isNational) && (
        <div className="cwf-tier cwf-tier-2">
          <div className="cwf-tier-header">
            <h2>{isNational ? 'National HQ Inbox' : 'Sub-Regional Approval Inbox'}</h2>
            <span className="cwf-badge cwf-badge-blue">GATEKEEPER</span>
          </div>
          
          <div className="cwf-inbox">
            {loading ? <p>Loading requests...</p> : 
             requests.length === 0 ? (
               <div className="cwf-empty-state">
                 <span className="material-symbols-outlined">inbox</span>
                 <p>ምንም መዘግብ አልተገኘም (No Pending Approvals)</p>
               </div>
             ) : (
               requests.filter(r => (isSubRegional && r.status === 'PENDING_SUB_REGION') || (isNational && r.status === 'PENDING_NATIONAL')).map(req => (
                <div key={req.id} className="cwf-ticket">
                  <div className="cwf-ticket-info">
                    <div className="cwf-ticket-title">{req.roleRequested} @ {req.location}</div>
                    <div className="cwf-ticket-metrics">
                      <p><strong>Justification:</strong> {req.justification}</p>
                      <p style={{fontSize: '0.8rem', color: '#64748b'}}>Submitted by: {req.requester?.full_name} ({req.requester?.email})</p>
                    </div>
                  </div>
                  <div className="cwf-ticket-actions">
                    <button className="cwf-btn cwf-btn-approve" onClick={() => handleApprove(req.id)}>
                      <span className="material-symbols-outlined">check_circle</span>
                      {isSubRegional ? 'Forward to National' : 'Final Approve'}
                    </button>
                    <button className="cwf-btn cwf-btn-reject" onClick={() => handleReject(req.id)}>
                      <span className="material-symbols-outlined">cancel</span>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TIER 1: AREA STAFF DATA ENTRY (THE SOURCE) ──────────────── */}
      {/* ──────────────────────────────────────────────────────────── */}
      {isAreaStaff && (
        <div className="cwf-tier cwf-tier-1">
          <div className="cwf-tier-header">
            <h2>Tier 1: Capacity Expansion Request</h2>
            <span className="cwf-badge cwf-badge-green">DATA SOURCE</span>
          </div>
          
          <form className="cwf-form" onSubmit={handleSubmit}>
            <div className="cwf-form-grid">
              <div className="cwf-form-group">
                <label>የተጠየቀው የሥራ ድርሻ (Role Requested)</label>
                <input 
                  type="text" 
                  value={roleRequested} 
                  onChange={(e) => setRoleRequested(e.target.value)} 
                  placeholder="e.g. Field Associate, Volunteer Lead"
                  required
                />
              </div>
              
              <div className="cwf-form-group">
                <label>የትግበራ ቦታ (Target Location)</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  placeholder="e.g. Arba Minch Area, Hawassa Node"
                  required
                />
              </div>
              
              <div className="cwf-form-group" style={{gridColumn: 'span 2'}}>
                <label>ማብራሪያ/አስፈላጊነት (Justification)</label>
                <textarea 
                  value={justification} 
                  onChange={(e) => setJustification(e.target.value)} 
                  placeholder="Explain why this capacity expansion is needed..."
                  required
                  rows={3}
                  style={{width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0'}}
                />
              </div>
            </div>
            
            <div className="cwf-form-actions">
              <button 
                type="submit" 
                className="cwf-btn cwf-btn-submit" 
                disabled={isSubmitting || !roleRequested || !location || !justification}
              >
                <span className="material-symbols-outlined">send</span>
                {isSubmitting ? 'Submitting...' : 'Submit Expansion Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MY REQUESTS SECTION (Always visible for accountability) */}
      <div className="cwf-tier" style={{marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem'}}>
         <div className="cwf-tier-header">
            <h3>Request History & Tracking</h3>
         </div>
         <div className="cwf-inbox">
            {requests.length === 0 ? <p className="cwf-empty-sub">No request history found.</p> : 
              requests.map(req => (
                <div key={req.id} className="cwf-ticket" style={{opacity: req.status === 'APPROVED' || req.status === 'REJECTED' ? 0.7 : 1}}>
                  <div className="cwf-ticket-info">
                    <div className="cwf-ticket-title">{req.roleRequested} @ {req.location}</div>
                    <div style={{fontSize: '0.8rem', color: '#64748b'}}>ID: #{req.id} • Submitted: {new Date(req.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="cwf-ticket-actions">
                    {getStatusBadge(req.status)}
                  </div>
                </div>
              ))
            }
         </div>
      </div>

    </div>
  );
}
