import React, { useState, useEffect } from 'react';
import { regionalApi } from '../../api/regionalApi';
import './Regional.css';

const AdvisoryBoard: React.FC = () => {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        church: '',
        profession: '',
        phone: '',
        termStart: '',
        termNumber: '1'
    });

    useEffect(() => {
        fetchBoard();
    }, []);

    const fetchBoard = async () => {
        try {
            const data = await regionalApi.getAdvisoryTeam();
            setMembers(data);
        } catch (err) {
            console.error('Failed to fetch board:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await regionalApi.registerAdvisoryMember(formData);
            setShowForm(false);
            setFormData({ fullName: '', church: '', profession: '', phone: '', termStart: '', termNumber: '1' });
            fetchBoard();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const getTermStatus = (member: any) => {
        const end = new Date(member.termEnd);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const years = Math.floor(diffDays / 365);
        
        if (diffDays < 0) return { label: 'Expired', class: 'expired' };
        if (diffDays < 180) return { label: 'Expiring Soon', class: 'urgent' };
        return { label: `Term ${member.termNumber}: ${years}y remaining`, class: 'active' };
    };

    if (loading) return <div className="loading-container">Retrieving board records...</div>;

    return (
        <div className="advisory-board-page">
            <header className="regional-header">
                <h1 className="regional-greeting">Advisory Board</h1>
                <p className="regional-subtext">Governance & Term Management</p>
                <button className="mobile-submit-btn" style={{ marginTop: '16px' }} onClick={() => setShowForm(true)}>
                    + Register Member
                </button>
            </header>

            <div className="board-list">
                {members.map(member => {
                    const status = getTermStatus(member);
                    return (
                        <div key={member.id} className="member-card">
                            <div className="member-info">
                                <h4 className="member-name">{member.fullName}</h4>
                                <div className="member-meta">
                                    <span className="member-org">⛪ {member.church}</span>
                                    <span className="member-job">💼 {member.profession}</span>
                                </div>
                            </div>
                            <div className={`term-badge term--${status.class}`}>
                                {status.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {showForm && (
                <div className="mobile-overlay" onClick={() => setShowForm(false)}>
                    <div className="mobile-sheet" onClick={e => e.stopPropagation()}>
                        <div className="sheet-handle"></div>
                        <h3>Board Registration</h3>
                        {error && <div className="error-banner">{error}</div>}
                        
                        <form onSubmit={handleRegister} className="sheet-form">
                            <div className="mobile-input-group">
                                <label className="mobile-label">Full Name</label>
                                <input className="mobile-input" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                            </div>
                            <div className="mobile-input-group">
                                <label className="mobile-label">Church/Denomination</label>
                                <input className="mobile-input" value={formData.church} onChange={e => setFormData({...formData, church: e.target.value})} />
                            </div>
                            <div className="mobile-input-group">
                                <label className="mobile-label">Profession</label>
                                <input className="mobile-input" value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} />
                            </div>
                            <div className="mobile-input-group">
                                <label className="mobile-label">Phone</label>
                                <input className="mobile-input" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                            </div>
                            <div className="mobile-input-group">
                                <label className="mobile-label">Term Start Date</label>
                                <input className="mobile-input" type="date" value={formData.termStart} onChange={e => setFormData({...formData, termStart: e.target.value})} required />
                            </div>
                            <div className="mobile-input-group">
                                <label className="mobile-label">Term Number</label>
                                <select className="mobile-select" value={formData.termNumber} onChange={e => setFormData({...formData, termNumber: e.target.value})}>
                                    <option value="1">Term 1 (First Appointment)</option>
                                    <option value="2">Term 2 (Re-appointment)</option>
                                </select>
                            </div>
                            <button className="mobile-submit-btn" type="submit">Complete Registry</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .member-card {
                    background: #fff;
                    padding: 16px;
                    border-radius: 20px;
                    margin-bottom: 12px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }
                .member-name { font-weight: 800; color: #1e293b; margin: 0 0 4px 0; }
                .member-meta { display: flex; flex-direction: column; gap: 4px; }
                .member-org, .member-job { font-size: 0.8rem; color: #64748b; }
                .term-badge {
                    margin-top: 12px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 4px 12px;
                    border-radius: 100px;
                    display: inline-block;
                }
                .term--active { background: #dcfce7; color: #166534; }
                .term--urgent { background: #fef3c7; color: #92400e; }
                .term--expired { background: #fee2e2; color: #991b1b; }
                .error-banner { background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 12px; margin-bottom: 16px; font-size: 0.8rem; }
            `}</style>
        </div>
    );
};

export default AdvisoryBoard;
