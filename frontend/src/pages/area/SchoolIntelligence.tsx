import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { areaApi } from '../../api/areaApi';
import './SchoolIntelligence.css';

interface SchoolDetail {
  id: number;
  name: string;
  location: string;
  status: string;
  memberCount: number;
  smallGroupCount: number;
  verificationStatus: string;
  registeredBy: { name: string; email: string };
  leaders: Array<{ name: string; role: string; phone: string }>;
  verifiedAt?: string;
}

const SchoolIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<SchoolDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<SchoolDetail | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const data = await areaApi.getSchoolRegistry();
      setSchools(data);
    } catch (err) {
      console.error('Failed to fetch school registry', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number, status: 'VERIFIED' | 'REJECTED') => {
    setActionLoading(true);
    try {
      await areaApi.verifySchool(id, status);
      await fetchSchools();
      setSelectedSchool(null);
    } catch (err) {
      alert('Verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="intel-loading">Gathering school intelligence...</div>;

  return (
    <div className="school-intel">
      <header className="intel-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1>School Intelligence Browser</h1>
        <p>Registry of ministry impact across your area.</p>
      </header>

      <div className="intel-grid">
        <aside className="school-list-sidebar">
          <div className="list-search">
            <span className="material-symbols-outlined search-icon">search</span>
            <input type="text" placeholder="Search schools..." />
          </div>
          <div className="registry-list">
            {schools.map(school => (
              <div 
                key={school.id} 
                className={`registry-card ${selectedSchool?.id === school.id ? 'active' : ''}`}
                onClick={() => setSelectedSchool(school)}
              >
                <div className="registry-card__main">
                  <h4>{school.name}</h4>
                  <span className={`status-pill ${school.status.toLowerCase()}`}>
                    {school.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="registry-card__stats">
                  <span>👥 {school.memberCount}</span>
                  <span>🌱 {school.smallGroupCount}</span>
                  <span className={`verify-pill ${school.verificationStatus.toLowerCase()}`}>
                    {school.verificationStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="school-detail-view">
          {selectedSchool ? (
            <div className="detail-container">
              <section className="detail-section">
                <div className="detail-hero">
                  <div className="hero-content">
                    <h2>{selectedSchool.name}</h2>
                    <p className="registered-by">
                      Registered by <strong>{selectedSchool.registeredBy.name}</strong>
                    </p>
                  </div>
                  {selectedSchool.verificationStatus === 'PENDING' && (
                    <div className="verification-actions">
                      <button 
                        className="verify-btn" 
                        disabled={actionLoading}
                        onClick={() => handleVerify(selectedSchool.id, 'VERIFIED')}
                      >
                        Verify Data
                      </button>
                      <button 
                        className="reject-btn" 
                        disabled={actionLoading}
                        onClick={() => handleVerify(selectedSchool.id, 'REJECTED')}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <div className="detail-stats-bar">
                <div className="stat-box">
                  <label>Student Impact</label>
                  <p>{selectedSchool.memberCount} Members</p>
                </div>
                <div className="stat-box">
                  <label>Active Growth</label>
                  <p>{selectedSchool.smallGroupCount} Small Groups</p>
                </div>
                <div className="stat-box">
                  <label>Verification</label>
                  <p className={`status-${selectedSchool.verificationStatus.toLowerCase()}`}>
                    {selectedSchool.verificationStatus}
                  </p>
                </div>
              </div>

              <section className="detail-section">
                <h3>School Leadership Team</h3>
                <div className="leaders-grid">
                  {selectedSchool.leaders.map((leader, i) => (
                    <div key={i} className="leader-card">
                      <div className="leader-avatar">{leader.name[0]}</div>
                      <div className="leader-info">
                        <p className="leader-name">{leader.name}</p>
                        <p className="leader-role">{leader.role.replace('_', ' ')}</p>
                        <p className="leader-phone">{leader.phone}</p>
                      </div>
                    </div>
                  ))}
                  {selectedSchool.leaders.length === 0 && (
                    <p className="empty-text">No leadership data recorded for this school.</p>
                  )}
                </div>
              </section>

              <section className="detail-section">
                <h3>Verification Audit Trail</h3>
                <div className="audit-card">
                  {selectedSchool.verifiedAt ? (
                    <p>Verified on <strong>{new Date(selectedSchool.verifiedAt).toLocaleDateString()}</strong></p>
                  ) : (
                    <p>Awaiting institutional verification from Area Coordinator.</p>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="empty-selection">
              <span className="material-symbols-outlined">query_stats</span>
              <h3>Select a school to view granular intelligence</h3>
              <p>Verify field reports, audit leadership teams, and track ministry vibrancy.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SchoolIntelligence;
