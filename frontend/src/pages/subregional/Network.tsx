import React, { useState, useEffect } from 'react';
import { subRegionalApi } from '../../api/subRegionalApi';
import '../area/AreaPortal.css';

const Network: React.FC = () => {
  const [network, setNetwork] = useState<{ areaStaff: any[], associates: any[] }>({ areaStaff: [], associates: [] });
  const [loading, setLoading] = useState(true);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);

  useEffect(() => {
    fetchNetwork();
  }, []);

  const fetchNetwork = async () => {
    try {
      const data = await subRegionalApi.getNetwork();
      setNetwork(data);
    } catch (e) {}
    setLoading(false);
  };

  // Group associates by area
  const groupedAssociates = network.associates.reduce((acc: any, curr: any) => {
    const area = curr.registeredBy?.area || 'Unassigned';
    if (!acc[area]) acc[area] = [];
    acc[area].push(curr);
    return acc;
  }, {});

  const areas = Array.from(new Set([...network.areaStaff.map(s => s.area), ...Object.keys(groupedAssociates)])).filter(Boolean);

  return (
    <div className="area-form-page">
      <header className="area-form-header">
         <h1 className="area-form-title">Network Directory</h1>
      </header>

      <div className="network-list" style={{ padding: '0 16px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading network...</p>
        ) : areas.map(areaName => (
          <div key={areaName} className="area-section">
             <div className="area-header" onClick={() => setExpandedArea(expandedArea === areaName ? null : areaName)}>
                <span className="material-symbols-outlined">map</span>
                <span className="area-name">{areaName}</span>
                <span className="material-symbols-outlined">{expandedArea === areaName ? 'expand_less' : 'expand_more'}</span>
             </div>

             {expandedArea === areaName && (
               <div className="area-staff-list animate-slide-down">
                  {/* Area Staff */}
                  {network.areaStaff.filter(s => s.area === areaName).map(staff => (
                    <div key={staff.id} className="staff-card">
                       <div className="staff-info">
                          <span className="staff-role-label">AREA STAFF</span>
                          <span className="staff-name">{staff.name}</span>
                       </div>
                       <a href={`tel:${staff.phone}`} className="call-btn">
                          <span className="material-symbols-outlined">call</span>
                       </a>
                    </div>
                  ))}

                  {/* Associates */}
                  {(groupedAssociates[areaName] || []).map((assoc: any) => (
                    <div key={assoc.id} className="staff-card" style={{ borderLeft: '4px solid #94a3b8' }}>
                       <div className="staff-info">
                          <span className="staff-role-label" style={{ color: '#94a3b8' }}>ASSOCIATE</span>
                          <span className="staff-name">{assoc.name}</span>
                       </div>
                       <a href={`tel:${assoc.phone}`} className="call-btn" style={{ background: '#f1f5f9', color: '#64748b' }}>
                          <span className="material-symbols-outlined">call</span>
                       </a>
                    </div>
                  ))}
               </div>
             )}
          </div>
        ))}
      </div>

      <style>{`
        .area-section { background: white; border-radius: 16px; margin-bottom: 12px; border: 1px solid #f1f5f9; overflow: hidden; }
        .area-header { padding: 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .area-name { font-weight: 800; color: #1e293b; flex: 1; }
        .area-staff-list { background: #f8fafc; padding: 8px 16px 16px; border-top: 1px solid #f1f5f9; }
        .staff-card { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 12px; margin-top: 8px; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; }
        .staff-role-label { font-size: 0.6rem; font-weight: 900; color: #2563eb; letter-spacing: 1px; }
        .staff-name { display: block; font-weight: 700; color: #1e293b; }
        .call-btn { width: 40px; height: 40px; border-radius: 20px; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; text-decoration: none; }
        .animate-slide-down { animation: slideDown 0.2s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Network;
