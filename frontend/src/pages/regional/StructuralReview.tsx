import React, { useState, useEffect } from 'react';
import { regionalApi } from '../../api/regionalApi';
import './Regional.css';

const StructuralReview: React.FC = () => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [successMode, setSuccessMode] = useState(false);

  const [editData, setEditData] = useState({
    name: '',
    boundaries: ''
  });

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const data = await regionalApi.fetchAreaProposals();
      setProposals(data);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (area: any) => {
    setSelectedArea(area);
    setEditData({ name: area.name, boundaries: area.boundaries || '' });
  };

  const handleCharter = async () => {
    try {
      await regionalApi.charterArea(selectedArea.id, editData);
      setSuccessMode(true);
      setTimeout(() => {
        setSuccessMode(false);
        setSelectedArea(null);
        fetchProposals();
      }, 2000);
    } catch (error) {
      alert('Failed to charter area. Check your connection.');
    }
  };

  if (loading) return <div className="loading-container">Mapping territorial shifts...</div>;

  return (
    <div className="structural-page">
      <header className="regional-header">
        <h1 className="regional-greeting">Structural Review</h1>
        <p className="regional-subtext">Area Chartering & Growth Workspace</p>
      </header>

      {successMode ? (
        <div className="charter-success-animation">
            <span className="material-symbols-outlined success-icon">verified_user</span>
            <h2>Area Chartered!</h2>
            <p>The boundaries are set. Territory is now ACTIVE.</p>
        </div>
      ) : (
        <div className="proposal-list">
          <h3 className="section-subtitle">PENDING CHARTERS ({proposals.length})</h3>
          {proposals.map(proposal => (
            <div key={proposal.id} className="proposal-card" onClick={() => handleOpenEdit(proposal)}>
              <div className="proposal-main">
                <span className="proposal-name">{proposal.name}</span>
                <span className="proposal-proposer">Proposed by {proposal.proposedBy.fullName}</span>
              </div>
              <span className="material-symbols-outlined">edit_square</span>
            </div>
          ))}
          {proposals.length === 0 && (
            <div className="empty-state-card">
              <span className="material-symbols-outlined">map</span>
              <p>No pending area proposals in your region at this time.</p>
            </div>
          )}
        </div>
      )}

      {selectedArea && !successMode && (
        <div className="mobile-overlay" onClick={() => setSelectedArea(null)}>
          <div className="mobile-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            <h3>Chartering Worksheet</h3>
            <p className="sheet-subtext">Reviewing proposal for <strong>{selectedArea.name}</strong></p>
            
            <div className="mobile-input-group">
              <label className="mobile-label">Final Area Name</label>
              <input 
                className="mobile-input" 
                value={editData.name} 
                onChange={e => setEditData({...editData, name: e.target.value})}
              />
            </div>

            <div className="mobile-input-group">
              <label className="mobile-label">Jurisdiction Boundaries</label>
              <textarea 
                className="mobile-textarea" 
                value={editData.boundaries} 
                onChange={e => setEditData({...editData, boundaries: e.target.value})}
                placeholder="List major landmarks, towns, or districts..."
              />
            </div>

            <div className="mobile-input-group">
              <label className="mobile-label">Original Justification (ReadOnly)</label>
              <p className="justification-text">{selectedArea.justification}</p>
            </div>

            <button className="charter-btn" onClick={handleCharter}>
              ✓ Charter Area
            </button>
            <button className="sheet-btn-secondary" onClick={() => setSelectedArea(null)} style={{ marginTop: '12px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        .section-subtitle { font-size: 0.75rem; font-weight: 900; color: #64748b; margin-bottom: 12px; }
        .proposal-card {
            background: #fff;
            padding: 20px;
            border-radius: 20px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid #f1f5f9;
        }
        .proposal-name { display: block; font-weight: 800; color: #1e293b; font-size: 1rem; }
        .proposal-proposer { font-size: 0.75rem; color: #64748b; }
        .justification-text { font-size: 0.8rem; color: #475569; font-style: italic; background: #f8fafc; padding: 12px; border-radius: 8px; }
        .charter-btn {
            width: 100%;
            padding: 18px;
            border-radius: 16px;
            background: #2563eb;
            color: #fff;
            border: none;
            font-weight: 800;
            font-size: 1rem;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .charter-success-animation {
            text-align: center;
            padding: 60px 24px;
            animation: fadeIn 0.5s ease-out;
        }
        .success-icon { font-size: 4rem; color: #22c55e; margin-bottom: 16px; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default StructuralReview;
