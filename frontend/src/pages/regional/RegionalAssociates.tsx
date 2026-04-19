import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Calendar, 
  MapPin, 
  UserCheck,
  MoreVertical,
  Download
} from 'lucide-react';
import { subRegionalApi } from '../../api/subRegionalApi';
import '../../pages/schoolministry/Ministry.css'; // Reuse premium styles

const RegionalAssociates: React.FC = () => {
  const [associates, setAssociates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await subRegionalApi.getNetwork();
      setAssociates(data.associates);
    } catch (err: any) {
      console.error('Failed to load associates:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const areas = ['All', ...Array.from(new Set(associates.map(a => a.registeredBy?.area).filter(Boolean)))];

  const filteredAssociates = associates.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         a.registeredBy?.area?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterArea === 'All' || a.registeredBy?.area === filterArea;
    return matchesSearch && matchesFilter;
  });

  const totalAssociates = associates.length;
  const activeAssociates = associates.filter(a => a.status === 'APPROVED').length;

  if (loading) return <div className="p-12 text-center text-gray-500">Synchronizing Regional Talent...</div>;

  return (
    <div className="ministry-main">
      {/* Header */}
      <div className="ministry-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Regional Associates Directory</h1>
            <p>Detailed overview of certified associates and their background across the region.</p>
          </div>
          <button className="btn-primary" style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats QuickView */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users className="w-4 h-4" />
            Total Talent
          </div>
          <div className="metric-value">{totalAssociates}</div>
          <div className="metric-trend">Across {areas.length - 1} areas</div>
        </div>

        <div className="metric-card">
          <div className="metric-label" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck className="w-4 h-4" />
            Certified Status
          </div>
          <div className="metric-value">{activeAssociates}</div>
          <div className="metric-trend trend-up">100% Validation</div>
        </div>

        <div className="metric-card">
          <div className="metric-label" style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin className="w-4 h-4" />
            Primary Reach
          </div>
          <div className="metric-value" style={{ fontSize: '24px' }}>{filterArea === 'All' ? 'Regional' : filterArea}</div>
          <div className="metric-trend">Current Focus</div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="ministry-card" style={{ padding: '20px', display: 'flex', gap: '16px', borderBottom: 'none' }}>
        <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
           <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '12px', width: '16px', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search by name or area..."
                style={{ paddingLeft: '40px', width: '100%', height: '42px', background: '#020617', border: '1px solid #1e293b', borderRadius: '10px', color: 'white' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
        <div className="form-field" style={{ width: '200px', marginBottom: 0 }}>
          <select 
            style={{ height: '42px' }}
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
          >
            {areas.map(area => <option key={area} value={area}>{area}</option>)}
          </select>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="ministry-card">
        <table className="ministry-table">
          <thead>
            <tr>
              <th>Associate</th>
              <th>Contact & Reach</th>
              <th>Background Detail</th>
              <th>Registered By</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredAssociates.map((assoc) => (
              <tr key={assoc.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                      {assoc.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#f1f5f9' }}>{assoc.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar className="w-3 h-3" />
                        {new Date(assoc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#cbd5e1' }}>
                      <Phone className="w-3 h-3 text-blue-400" />
                      {assoc.phone || '---'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {assoc.registeredBy?.area || 'Unassigned'}
                    </div>
                  </div>
                </td>
                <td>
                  <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '240px', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
                    {assoc.backgroundInfo || 'No background provided.'}
                  </p>
                </td>
                <td>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0' }}>{assoc.registeredBy?.full_name || 'System'}</div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#475569', fontWeight: '800' }}>Coordinator</div>
                </td>
                <td>
                  <span className="dept-tag" style={{ background: assoc.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: assoc.status === 'APPROVED' ? '#10b981' : '#f59e0b' }}>
                    {assoc.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button style={{ color: '#475569' }}><MoreVertical className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAssociates.length === 0 && (
          <div className="empty-data">
            <p>No associates found in this area.</p>
            <button style={{ color: '#38bdf8', fontSize: '12px', fontWeight: '700' }} onClick={() => { setSearchTerm(''); setFilterArea('All'); }}>Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionalAssociates;
