import React, { useState, useEffect } from 'react';
import { regionalApi } from '../../api/regionalApi';
import '../area/AreaPortal.css';

const RegionalStrategy: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        regionalApi.getDashboardStats()
            .then(setStats)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-state">Syncing Regional Strategy...</div>;

    return (
        <div className="regional-strategy-page" style={{ padding: '16px', paddingBottom: '100px' }}>
            <header className="page-header" style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>Strategic Command</h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Regional reach and goal fulfillment tracking.</p>
            </header>

            <div className="strategy-grid" style={{ display: 'grid', gap: '16px' }}>
                {/* Ministry Reach */}
                <div className="strategy-card" style={{ background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Ministry Reach</h3>
                        <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>groups</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b' }}>{stats?.reach?.total || 0}</div>
                    <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Total children and youth reached this month across the region.</p>
                    <div className="progress-bar" style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', marginTop: '12px' }}>
                        <div style={{ width: `${Math.min(100, (stats?.reach?.total / (stats?.reach?.target || 10000)) * 100)}%`, background: '#2563eb', height: '100%', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.7rem', color: '#64748b' }}>
                        <span>Progress to Goal</span>
                        <span>{Math.round((stats?.reach?.total / (stats?.reach?.target || 10000)) * 100)}%</span>
                    </div>
                </div>

                {/* Performance by Sub-Region */}
                <div className="strategy-card" style={{ background: '#fff', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Sub-Regional Performance</h3>
                    <div className="sub-region-list" style={{ display: 'grid', gap: '12px' }}>
                        {Object.entries(stats?.subRegionBreakdown || {}).map(([name, val]: [string, any]) => (
                            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: '#475569' }}>{name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{val.raised || 0} ETB Raised</span>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: (val.growth > 0 ? '#10b981' : '#f59e0b') }}>
                                        {val.growth > 0 ? 'trending_up' : 'trending_flat'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Regional Health Index */}
                <div className="strategy-card" style={{ background: '#2563eb', color: '#fff', padding: '20px', borderRadius: '20px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px' }}>Regional Health Index</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>A-</div>
                    <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Operational health based on reporting compliance and asset stewardship.</p>
                </div>
            </div>
        </div>
    );
};

export default RegionalStrategy;
