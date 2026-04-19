import React, { useState, useEffect } from 'react';
import { areaApi } from '../../api/areaApi';

const MyAssets: React.FC = () => {
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportingAsset, setReportingAsset] = useState<any>(null);
    const [issueNote, setIssueNote] = useState('');

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const data = await areaApi.fetchMyAssets();
            setAssets(data);
        } catch (error) {
            console.error('Failed to fetch my assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReportIssue = async () => {
        if (!issueNote) return;
        try {
            await areaApi.reportAssetIssue(reportingAsset.id, issueNote);
            setReportingAsset(null);
            setIssueNote('');
            fetchAssets();
        } catch (error) {
            alert('Failed to report issue');
        }
    };

    if (loading) return <div className="loading-small">Loading stewardship...</div>;

    return (
        <div className="stewardship-section">
            <h3 className="stewardship-title">My Stewardship</h3>
            <div className="stewardship-list">
                {assets.map(asset => (
                    <div key={asset.id} className="stewardship-card">
                        <div className="stewardship-info">
                            <span className="steward-asset-name">{asset.name}</span>
                            <span className="steward-asset-serial">SN: {asset.serialNumber}</span>
                        </div>
                        <button 
                            className={`steward-action-btn ${asset.condition === 'REPAIR_NEEDED' ? 'steward-action-btn--active' : ''}`}
                            onClick={() => setReportingAsset(asset)}
                            disabled={asset.condition === 'REPAIR_NEEDED'}
                        >
                            <span className="material-symbols-outlined">build</span>
                            {asset.condition === 'REPAIR_NEEDED' ? 'Issue Reported' : 'Report Need'}
                        </button>
                    </div>
                ))}
                {assets.length === 0 && (
                    <div className="empty-stewardship">
                        <span className="material-symbols-outlined">inventory_2</span>
                        <p>No assets currently assigned to you.</p>
                    </div>
                )}
            </div>

            {reportingAsset && (
                <div className="mobile-overlay" onClick={() => setReportingAsset(null)}>
                    <div className="mobile-sheet" onClick={e => e.stopPropagation()}>
                        <div className="sheet-handle"></div>
                        <h3>Report Maintenance</h3>
                        <p className="sheet-subtext">Issue with {reportingAsset.name}</p>
                        
                        <div className="sheet-form-group">
                            <label>Describe the concern</label>
                            <textarea 
                                className="mobile-textarea"
                                placeholder="e.g. Engine making strange noise, front tire flat..."
                                value={issueNote}
                                onChange={e => setIssueNote(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '100px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="sheet-btn-secondary" style={{ flex: 1 }} onClick={() => setReportingAsset(null)}>Cancel</button>
                            <button className="sheet-btn-primary" style={{ flex: 2 }} onClick={handleReportIssue}>Submit Report</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .stewardship-section { margin-top: 24px; }
                .stewardship-title { font-size: 0.85rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 12px; }
                .stewardship-card {
                    background: #fff;
                    padding: 16px;
                    border-radius: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border: 1px solid #f1f5f9;
                    margin-bottom: 12px;
                }
                .stewardship-info { display: flex; flex-direction: column; }
                .steward-asset-name { font-weight: 800; color: #1e293b; font-size: 0.95rem; }
                .steward-asset-serial { font-size: 0.75rem; color: #64748b; }
                .steward-action-btn {
                    background: #f1f5f9;
                    border: none;
                    color: #64748b;
                    padding: 8px 12px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    cursor: pointer;
                }
                .steward-action-btn--active { background: #fee2e2; color: #dc2626; }
                .empty-stewardship { padding: 32px; text-align: center; color: #94a3b8; background: #fff; border-radius: 20px; border: 1px dashed #e2e8f0; }

                .mobile-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
                    z-index: 1000; display: flex; align-items: flex-end;
                }
                .mobile-sheet {
                    background: #fff; width: 100%; padding: 24px;
                    border-radius: 32px 32px 0 0; box-shadow: 0 -10px 25px rgba(0,0,0,0.1);
                }
                .sheet-handle {
                    width: 40px; height: 4px; background: #e2e8f0;
                    border-radius: 2px; margin: 0 auto 20px;
                }
                .sheet-subtext { color: #64748b; font-size: 0.85rem; margin-bottom: 20px; }
                .sheet-btn-primary { background: #2563eb; color: #fff; border: none; padding: 16px; border-radius: 16px; font-weight: 800; cursor: pointer; }
                .sheet-btn-secondary { background: #f1f5f9; color: #64748b; border: none; padding: 16px; border-radius: 16px; font-weight: 800; cursor: pointer; }
            `}</style>
        </div>
    );
};

export default MyAssets;
