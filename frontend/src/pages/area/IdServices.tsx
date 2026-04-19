import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { areaApi } from '../../api/areaApi';
import './AreaForms.css';

const IdServices: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('FIRST_TIME');
  const [error, setError] = useState('');

  const handleRequest = async () => {
    setLoading(true);
    setError('');
    try {
      await areaApi.requestPhysicalId({ reason });
      setSuccess(true);
      setShowModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="area-form-page">
      <header className="area-form-header">
        <button className="back-btn" onClick={() => navigate('/area/home')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="area-form-title">ID Services</h1>
      </header>

      {/* Digital ID Display */}
      <div className="digital-id-container">
        <div className="digital-id-card">
          <div className="id-card-glow" />
          <div className="id-header">
             <img src="/erp/logo.png" alt="SUE" className="id-logo" />
             <div className="id-brand">Scripture Union Ethiopia</div>
          </div>
          <div className="id-body">
            <div className="id-photo-frame">
              <img src={user?.photoUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="Profile" className="id-photo" />
            </div>
            <div className="id-info">
              <h2 className="id-name">{user?.name || 'Area Staff User'}</h2>
              <p className="id-role">{user?.role?.replace('_', ' ')}</p>
              <div className="id-details">
                <div className="id-detail-item">
                  <small>STAFF ID</small>
                  <span>{user?.idNumber || `AS-${user?.id?.toString().padStart(4, '0')}`}</span>
                </div>
                <div className="id-detail-item">
                  <small>SCOPE</small>
                  <span>{user?.area || 'Field Office'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="id-footer">
            <span className="id-status-badge">ACTIVE PERSONNEL</span>
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', padding: '0 20px' }}>
        This glowing digital ID is your official electronic verification in the field.
      </p>

      {success && <div style={{ color: '#059669', padding: '12px', background: '#d1fae5', borderRadius: '12px', margin: '16px', textAlign: 'center', fontWeight: 600 }}>Request Submitted Successfully!</div>}
      {error && <div style={{ color: '#ef4444', padding: '12px', background: '#fee2e2', borderRadius: '12px', margin: '16px', textAlign: 'center' }}>{error}</div>}

      <button className="mobile-submit-btn" style={{ margin: '20px 0' }} onClick={() => setShowModal(true)}>
        Request Physical / PDF ID
      </button>

      {showModal && (
        <div className="mobile-modal-overlay">
          <div className="mobile-modal-sheet">
             <h3 className="modal-title">ID Replacement Request</h3>
             <p className="modal-desc">Why do you need a new physical/printable ID card?</p>
             
             <div className="mobile-input-group">
                <select className="mobile-select" value={reason} onChange={e => setReason(e.target.value)}>
                  <option value="FIRST_TIME">First Time Issue</option>
                  <option value="LOST">Lost / Damaged</option>
                  <option value="EXPIRED">ID Expired</option>
                </select>
             </div>

             <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '20px' }}>
                <button className="mobile-submit-btn" style={{ background: '#f1f5f9', color: '#475569', boxShadow: 'none' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button className="mobile-submit-btn" onClick={handleRequest} disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .digital-id-container {
          padding: 24px 0;
          perspective: 1000px;
        }
        .digital-id-card {
          width: 320px;
          height: 500px;
          margin: 0 auto;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 24px;
          position: relative;
          color: white;
          padding: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .id-card-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(37,99,235,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .id-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }
        .id-logo {
          width: 40px;
          height: 40px;
        }
        .id-brand {
          font-weight: 900;
          font-size: 0.9rem;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .id-photo-frame {
          width: 140px;
          height: 140px;
          margin: 0 auto 24px;
          background: rgba(255,255,255,0.05);
          padding: 8px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .id-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
        }
        .id-name {
          font-size: 1.5rem;
          font-weight: 800;
          text-align: center;
          margin: 0 0 4px 0;
        }
        .id-role {
          text-align: center;
          font-weight: 700;
          color: #2563eb;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 2px;
          margin: 0 0 32px 0;
        }
        .id-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .id-detail-item small {
          display: block;
          font-size: 0.6rem;
          color: #64748b;
          font-weight: 900;
          margin-bottom: 2px;
        }
        .id-detail-item span {
          font-size: 0.85rem;
          font-weight: 700;
        }
        .id-footer {
          margin-top: auto;
          text-align: center;
        }
        .id-status-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 6px 16px;
          border-radius: 40px;
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 1px;
        }
        
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
          padding: 32px 24px 48px;
          animation: slideUp 0.3s ease-out;
        }
        .modal-title {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0 0 8px 0;
        }
        .modal-desc {
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 24px;
        }
      `}</style>
    </div>
  );
};

export default IdServices;
