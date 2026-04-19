import React from 'react';
import '../../pages/regional/Regional.css';

interface GovernanceAlertProps {
    members: any[];
}

const GovernanceAlert: React.FC<GovernanceAlertProps> = ({ members }) => {
    const expiringMembers = members.filter(member => {
        const end = new Date(member.termEnd);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const months = diffTime / (1000 * 60 * 60 * 24 * 30);
        return months > 0 && months <= 6;
    });

    if (expiringMembers.length === 0) return null;

    return (
        <div className="governance-alert-stack">
            {expiringMembers.map(member => (
                <div key={member.id} className="gov-alert">
                    <span className="material-symbols-outlined gov-alert-icon">warning</span>
                    <div className="gov-alert-content">
                        <h4 className="gov-alert-title">Succession Warning</h4>
                        <p className="gov-alert-text">
                            <strong>{member.fullName}</strong>'s board term expires on {new Date(member.termEnd).toLocaleDateString()}. Plan for succession.
                        </p>
                    </div>
                </div>
            ))}
            <style>{`
                .governance-alert-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .gov-alert {
                    background: #fff8eb;
                    border: 1px solid #fef3c7;
                    padding: 16px;
                    border-radius: 20px;
                    display: flex;
                    gap: 12px;
                }
                .gov-alert-icon { color: #f59e0b; }
                .gov-alert-title { font-size: 0.85rem; font-weight: 900; color: #92400e; margin: 0 0 2px 0; text-transform: uppercase; }
                .gov-alert-text { font-size: 0.8rem; color: #b45309; margin: 0; line-height: 1.4; }
            `}</style>
        </div>
    );
};

export default GovernanceAlert;
