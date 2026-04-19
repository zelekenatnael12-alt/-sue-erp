import React, { useState, useEffect } from 'react';
import { regionalApi } from '../../api/regionalApi';
import './Regional.css';

const Treasury: React.FC = () => {
    const [ledger, setLedger] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showReceipts, setShowReceipts] = useState(false);

    useEffect(() => {
        fetchLedger();
    }, []);

    const fetchLedger = async () => {
        try {
            const data = await regionalApi.fetchRegionalTreasury();
            setLedger(data);
        } catch (error) {
            console.error('Failed to fetch treasury:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container">Auditing regional funds...</div>;

    return (
        <div className="treasury-page">
            <header className="regional-header">
                <h1 className="regional-greeting">Regional Treasury</h1>
                <p className="regional-subtext">Financial Autonomy & Audit</p>
            </header>

            <div className="balance-hero">
                <span className="balance-label">CURRENT RESERVE</span>
                <span className="balance-value">{ledger.currentBalance.toLocaleString()} ETB</span>
                <div className="balance-metrics">
                    <div className="metric">
                        <span className="metric-label">Raised</span>
                        <span className="metric-val text-green">+{ledger.totalRaised.toLocaleString()}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Spent</span>
                        <span className="metric-val text-red">-{ledger.totalExpended.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="treasury-sections">
                <h3 className="section-subtitle">SUB-REGION PERFORMANCE</h3>
                <div className="breakdown-list">
                    {ledger.subRegionBreakdown.map((sr: any) => (
                        <div key={sr.subRegion} className="sr-card">
                            <span className="sr-name">{sr.subRegion}</span>
                            <div className="sr-fin">
                                <span className="sr-raised">{sr.raised.toLocaleString()} ETB</span>
                                <span className="sr-expended">Spent: {sr.expended.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="audit-section" onClick={() => setShowReceipts(true)}>
                    <button className="audit-btn">
                        <span className="material-symbols-outlined">receipt_long</span>
                        View Regional Receipt Gallery
                    </button>
                    <p className="audit-hint">Click to verify all field report expenditures.</p>
                </div>
            </div>

            {showReceipts && (
                <div className="mobile-overlay" onClick={() => setShowReceipts(false)}>
                    <div className="mobile-sheet gallery-sheet" onClick={e => e.stopPropagation()}>
                        <div className="sheet-handle"></div>
                        <h3>Receipt Registry</h3>
                        <div className="receipt-grid">
                            {ledger.receipts.map((r: any) => (
                                <div key={r.id} className="receipt-item">
                                    <img src={`/erp${r.url}`} alt="Receipt" className="receipt-thumb" />
                                    <div className="receipt-meta">
                                        <span className="receipt-amt">{r.amount.toLocaleString()} ETB</span>
                                        <span className="receipt-who">{r.author}</span>
                                    </div>
                                </div>
                            ))}
                            {ledger.receipts.length === 0 && <p className="empty-gallery">No receipt images uploaded in this region yet.</p>}
                        </div>
                        <button className="sheet-btn-secondary" onClick={() => setShowReceipts(false)}>Close Archive</button>
                    </div>
                </div>
            )}

            <style>{`
                .balance-hero {
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    padding: 32px 24px;
                    border-radius: 32px;
                    color: #fff;
                    margin-bottom: 24px;
                    text-align: center;
                }
                .balance-label { font-size: 0.7rem; font-weight: 900; opacity: 0.6; letter-spacing: 1px; }
                .balance-value { display: block; font-size: 2.2rem; font-weight: 900; margin: 8px 0 24px 0; color: #10b981; }
                .balance-metrics { display: flex; justify-content: space-around; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; }
                .metric { display: flex; flex-direction: column; }
                .metric-label { font-size: 0.65rem; opacity: 0.6; font-weight: 800; }
                .metric-val { font-weight: 800; font-size: 1rem; }
                .text-green { color: #10b981; }
                .text-red { color: #f43f5e; }

                .sr-card {
                    background: #fff;
                    padding: 16px;
                    border-radius: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border: 1px solid #f1f5f9;
                    margin-bottom: 12px;
                }
                .sr-name { font-weight: 800; color: #1e293b; }
                .sr-fin { text-align: right; }
                .sr-raised { display: block; font-weight: 800; color: #059669; font-size: 0.9rem; }
                .sr-expended { font-size: 0.7rem; color: #64748b; }

                .audit-section { margin-top: 32px; text-align: center; }
                .audit-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 18px; background: #fff; border: 1.5px dashed #cbd5e1; border-radius: 16px; color: #475569; font-weight: 800; margin-bottom: 8px; }
                .audit-hint { font-size: 0.75rem; color: #94a3b8; }

                .gallery-sheet { height: 80vh; overflow-y: auto; }
                .receipt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
                .receipt-item { background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
                .receipt-thumb { width: 100%; height: 120px; object-fit: cover; }
                .receipt-meta { padding: 8px; }
                .receipt-amt { display: block; font-size: 0.75rem; font-weight: 900; color: #1e293b; }
                .receipt-who { font-size: 0.6rem; color: #64748b; }
            `}</style>
        </div>
    );
};

export default Treasury;
