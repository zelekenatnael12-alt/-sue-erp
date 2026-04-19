import { useState } from 'react';
import './CapacityWorkflow.css'; // Reusing the same structural CSS for the 3-tier visual

interface TerritoryEntry {
  id: string;
  territoryType: 'SUB_REGION' | 'AREA';
  territoryName: string;
  status: 'PENDING_SCHOOL_MINISTRY' | 'APPROVED' | 'REJECTED';
}

export default function TerritoryWorkflow() {
  // Tier 3: National Master Map KPIs (Initial state: 0)
  const [officialSubRegions, setOfficialSubRegions] = useState(0);
  const [officialAreas, setOfficialAreas] = useState(0);

  // Tier 2: School Ministry Approval Inbox
  const [pendingRequests, setPendingRequests] = useState<TerritoryEntry[]>([]);
  const [animatingTicketId, setAnimatingTicketId] = useState<string | null>(null);

  // Tier 1: Regional Staff Data Entry (Initial state: '')
  const [inputType, setInputType] = useState<'SUB_REGION' | 'AREA'>('SUB_REGION');
  const [inputName, setInputName] = useState<string>('');
  const [isTier1Locked, setIsTier1Locked] = useState(false);

  // Handlers
  const submitTerritory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputName.trim()) return;

    const newRequest: TerritoryEntry = {
      id: Math.random().toString(36).substring(7),
      territoryType: inputType,
      territoryName: inputName.trim(),
      status: 'PENDING_SCHOOL_MINISTRY'
    };

    setPendingRequests([...pendingRequests, newRequest]);
    setIsTier1Locked(true); // Lock Tier 1
  };

  const clearTier1 = () => {
    setInputType('SUB_REGION');
    setInputName('');
    setIsTier1Locked(false);
  };

  const approveTerritory = (req: TerritoryEntry) => {
    // 1. Trigger Animation for this specific ticket
    setAnimatingTicketId(req.id);

    // 2. Wait for animation to finish before updating state
    setTimeout(() => {
      // Add mathematically to Tier 3
      if (req.territoryType === 'SUB_REGION') {
        setOfficialSubRegions(prev => prev + 1);
      } else if (req.territoryType === 'AREA') {
        setOfficialAreas(prev => prev + 1);
      }

      // Destroy ticket in Tier 2
      setPendingRequests(prev => prev.filter(r => r.id !== req.id));
      setAnimatingTicketId(null);
      
      // Re-enable Tier 1
      clearTier1();
    }, 600); // matches the .cwf-anim-approve animation
  };

  const rejectTerritory = (reqId: string) => {
    // Destroy ticket in Tier 2
    setPendingRequests(prev => prev.filter(r => r.id !== reqId));
    // Re-enable Tier 1
    clearTier1();
  };

  return (
    <div className="cwf-container">
      
      {/* ──────────────────────────────────────────────────────────── */}
      {/* TIER 3: NATIONAL MASTER MAP (THE TARGET) ──────────────────── */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="cwf-tier cwf-tier-3">
        <div className="cwf-tier-header">
          <h2>Tier 3: National Master Map</h2>
          <span className="cwf-badge cwf-badge-purple">GLOBAL DATABASE</span>
        </div>
        <div className="cwf-kpi-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="cwf-kpi-card">
            <span className="material-symbols-outlined cwf-kpi-icon">map</span>
            <div className="cwf-kpi-content">
              <span className="cwf-kpi-value">{officialSubRegions}</span>
              <span className="cwf-kpi-label">Official Sub-Regions</span>
            </div>
          </div>
          <div className="cwf-kpi-card">
            <span className="material-symbols-outlined cwf-kpi-icon">pin_drop</span>
            <div className="cwf-kpi-content">
              <span className="cwf-kpi-value">{officialAreas}</span>
              <span className="cwf-kpi-label">Official Areas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="cwf-flow-arrow material-symbols-outlined">straight</div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TIER 2: SCHOOL MINISTRY INBOX (THE GATEKEEPER) ──────────── */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="cwf-tier cwf-tier-2">
        <div className="cwf-tier-header">
          <h2>Tier 2: School Ministry Inbox</h2>
          <span className="cwf-badge cwf-badge-blue">GATEKEEPER</span>
        </div>
        
        <div className="cwf-inbox">
          {pendingRequests.length === 0 ? (
             <div className="cwf-empty-state">
               <span className="material-symbols-outlined">inbox</span>
               <p>ምንም መዘግብ አልተገኘም</p>
               <span className="cwf-empty-sub">(No Pending Approvals)</span>
             </div>
          ) : (
            pendingRequests.map(req => (
              <div 
                key={req.id} 
                className={`cwf-ticket ${animatingTicketId === req.id ? 'cwf-anim-approve' : ''}`}
              >
                <div className="cwf-ticket-info">
                  <div className="cwf-ticket-title">New Territory Verification</div>
                  <div className="cwf-ticket-metrics">
                    <span className="cwf-t-metric"><strong>{req.territoryType.replace('_', '-')}</strong>: <span style={{ color: '#2563eb' }}>{req.territoryName}</span></span>
                  </div>
                </div>
                <div className="cwf-ticket-actions">
                  <button 
                    className="cwf-btn cwf-btn-approve" 
                    onClick={() => approveTerritory(req)}
                    disabled={animatingTicketId === req.id}
                  >
                    <span className="material-symbols-outlined">verified</span>
                    Verify & Approve
                  </button>
                  <button 
                    className="cwf-btn cwf-btn-reject" 
                    onClick={() => rejectTerritory(req.id)}
                    disabled={animatingTicketId === req.id}
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    Reject & Return
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="cwf-flow-arrow material-symbols-outlined">straight</div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* TIER 1: REGIONAL STAFF DATA ENTRY (THE SOURCE) ──────────── */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className={`cwf-tier cwf-tier-1 ${isTier1Locked ? 'cwf-locked' : ''}`}>
        <div className="cwf-tier-header">
          <h2>Tier 1: Territory Registration</h2>
          <span className="cwf-badge cwf-badge-green">REGIONAL SUBMISSION</span>
        </div>
        
        <form className="cwf-form" onSubmit={submitTerritory}>
          <div className="cwf-form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="cwf-form-group">
              <label>Territory Type</label>
              <select 
                className="cwf-select"
                value={inputType}
                onChange={(e) => setInputType(e.target.value as 'SUB_REGION' | 'AREA')}
                disabled={isTier1Locked}
              >
                <option value="SUB_REGION">Sub-Region</option>
                <option value="AREA">Area</option>
              </select>
            </div>
            
            <div className="cwf-form-group">
              <label>የአካባቢ/የንዑስ ክልል ስም (Territory Name)</label>
              <input 
                type="text" 
                value={inputName} 
                onChange={(e) => setInputName(e.target.value)} 
                disabled={isTier1Locked}
                placeholder="e.g. Gamo Area"
                required
              />
            </div>
          </div>
          
          <div className="cwf-form-actions">
            <button 
              type="submit" 
              className="cwf-btn cwf-btn-submit" 
              disabled={isTier1Locked || !inputName.trim()}
            >
              <span className="material-symbols-outlined">publish</span>
              Submit for Verification
            </button>
            {isTier1Locked && (
               <div className="cwf-lock-msg">
                 <span className="material-symbols-outlined">lock</span>
                 Form locked pending School Ministry review.
               </div>
            )}
          </div>
        </form>
      </div>

    </div>
  );
}
