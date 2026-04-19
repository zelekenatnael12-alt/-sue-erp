import React, { useState, useEffect } from 'react';
import { regionalApi } from '../../api/regionalApi';
import './Regional.css';

const AssetRegistry: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assetList, teamList] = await Promise.all([
        regionalApi.fetchRegionalAssets(),
        // We'll use a generic team fetch if available, or just use the assets' holders
        fetch('/erp/api/sub-regional/network').then(res => res.json()).then(data => {
            // Flatten the network to get all users in region
            const users: any[] = [];
            data.forEach((sr: any) => {
                sr.areas.forEach((area: any) => {
                    if (area.staff) users.push(area.staff);
                });
            });
            return users;
        }).catch(() => [])
      ]);
      setAssets(assetList);
      setTeam(teamList);
    } catch (error) {
      console.error('Failed to fetch asset registry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (userId: string) => {
    try {
      await regionalApi.assignAsset(selectedAsset.id, userId ? parseInt(userId) : null);
      setSelectedAsset(null);
      fetchData();
    } catch (error) {
      alert('Failed to reassign asset');
    }
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-container">Scanning regional archives...</div>;

  return (
    <div className="asset-registry-page">
      <header className="regional-header">
        <h1 className="regional-greeting">Asset Registry</h1>
        <input 
          type="text" 
          className="mobile-search-bar" 
          placeholder="Search by name or serial..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </header>

      <div className="asset-list">
        {filteredAssets.map(asset => (
          <div key={asset.id} className="asset-card" onClick={() => setSelectedAsset(asset)}>
            <div className="asset-card-main">
              <span className="asset-name">{asset.name}</span>
              <span className="asset-serial">SN: {asset.serialNumber}</span>
            </div>
            <div className="asset-card-footer">
              <span className={`asset-condition cond--${asset.condition.toLowerCase().replace('_', '-')}`}>
                {asset.condition}
              </span>
              <span className="asset-holder">
                {asset.currentHolder ? `${asset.currentHolder.firstName} ${asset.currentHolder.lastName}` : 'UNASSIGNED'}
              </span>
            </div>
          </div>
        ))}
        {filteredAssets.length === 0 && <div className="empty-state">No assets found matching your search.</div>}
      </div>

      {selectedAsset && (
        <div className="mobile-overlay" onClick={() => setSelectedAsset(null)}>
          <div className="mobile-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            <h3>Manage {selectedAsset.name}</h3>
            <p className="sheet-subtext">SN: {selectedAsset.serialNumber}</p>
            
            <div className="sheet-form-group">
              <label>Reassign Stewardship</label>
              <select 
                className="mobile-select"
                value={selectedAsset.currentHolderId || ''}
                onChange={e => handleAssign(e.target.value)}
              >
                <option value="">-- Unassigned --</option>
                {team.map(user => (
                  <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                ))}
              </select>
            </div>

            <button className="sheet-btn-secondary" onClick={() => setSelectedAsset(null)}>Done</button>
          </div>
        </div>
      )}

      <style>{`
        .mobile-search-bar {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-top: 12px;
          font-size: 0.9rem;
        }
        .asset-card {
          background: #fff;
          padding: 16px;
          border-radius: 20px;
          margin-bottom: 12px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .asset-card-main {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
        }
        .asset-name { font-weight: 800; color: #1e293b; }
        .asset-serial { font-size: 0.75rem; color: #64748b; font-family: monospace; }
        .asset-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .asset-condition {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 100px;
        }
        .cond--new { background: #dcfce7; color: #166534; }
        .cond--good { background: #e0f2fe; color: #075985; }
        .cond--repair-needed { background: #fee2e2; color: #991b1b; }
        .asset-holder { font-size: 0.75rem; font-weight: 700; color: #2563eb; }
        
        /* Mobile Sheet */
        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          display: flex;
          align-items: flex-end;
        }
        .mobile-sheet {
          width: 100%;
          background: #fff;
          border-radius: 32px 32px 0 0;
          padding: 24px;
          animation: slideUp 0.3s ease-out;
        }
        .sheet-handle {
          width: 40px;
          height: 4px;
          background: #e2e8f0;
          border-radius: 2px;
          margin: 0 auto 16px;
        }
        .sheet-subtext { color: #64748b; font-size: 0.85rem; margin-bottom: 24px; }
        .sheet-form-group { margin-bottom: 24px; }
        .sheet-form-group label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; margin-bottom: 8px; text-transform: uppercase; }
        .mobile-select { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .sheet-btn-secondary { width: 100%; padding: 16px; border-radius: 16px; background: #f1f5f9; border: none; font-weight: 800; color: #64748b; }
        
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default AssetRegistry;
