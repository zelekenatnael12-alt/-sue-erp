import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Users, 
  School as SchoolIcon, 
  Plus, 
  Activity, 
  Search,
  Filter,
  PlusCircle,
  X,
} from 'lucide-react';
import { regionalApi } from '../../api/regionalApi';
import '../../pages/schoolministry/Ministry.css'; // Reuse Bento styles

const RegionalAreas: React.FC = () => {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subRegion: '',
    zone: '',
    town: '',
    contactPerson: '',
    fellowshipsCount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await regionalApi.fetchRegionalAreas();
      setAreas(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await regionalApi.addRegionalArea(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        subRegion: '',
        zone: '',
        town: '',
        contactPerson: '',
        fellowshipsCount: 0
      });
      loadData();
    } catch (err: any) {
      alert('Failed to create area: ' + err.message);
    }
  };

  const filteredAreas = areas.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subRegion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.town?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRegisteredAreas = areas.length;
  const totalAreaStaff = areas.reduce((sum, a) => sum + (a.staffCount || 0), 0);
  const totalSchools = areas.reduce((sum, a) => sum + (a.schoolsCount || 0), 0);
  const totalMinistryImpact = areas.reduce((sum, a) => sum + (a.associatesCount || 0) + (a.volunteersCount || 0), 0);

  if (loading) return <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>Loading Regional Areas...</div>;

  return (
    <div className="ministry-main">
      {/* Header */}
      <div className="ministry-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Regional Areas Management</h1>
            <p>Track staffing, schools, and ministry reach across all areas.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
            style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <Plus className="w-4 h-4" />
            Add Area
          </button>
        </div>
      </div>

      {/* Stats Summary - Metric Grid */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label" style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin className="w-4 h-4" />
            Registered Areas
          </div>
          <div className="metric-value">{totalRegisteredAreas}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label" style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users className="w-4 h-4" />
            Area Staff
          </div>
          <div className="metric-value">{totalAreaStaff}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SchoolIcon className="w-4 h-4" />
            Total Schools
          </div>
          <div className="metric-value">{totalSchools}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity className="w-4 h-4" />
            Ministry Impact
          </div>
          <div className="metric-value">{totalMinistryImpact}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="ministry-card" style={{ padding: '20px', display: 'flex', gap: '16px', borderBottom: 'none' }}>
        <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
           <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '12px', width: '16px', color: '#64748b' }} />
              <input 
                type="text" 
                placeholder="Search areas by name, sub-region or town..."
                style={{ paddingLeft: '40px', width: '100%', height: '42px', background: '#020617', border: '1px solid #1e293b', borderRadius: '10px', color: 'white' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
        <button className="btn-approve" style={{ width: 'auto' }}>
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Areas Table */}
      <div className="ministry-card">
        <table className="ministry-table">
          <thead>
            <tr>
              <th>Area Name</th>
              <th>Sub Region</th>
              <th>Geography</th>
              <th style={{ textAlign: 'center' }}>Staff</th>
              <th style={{ textAlign: 'center' }}>Schools</th>
              <th style={{ textAlign: 'center' }}>Ministry Reach</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAreas.map((area) => (
              <tr key={area.id}>
                <td>
                  <div style={{ fontWeight: '700', color: '#f1f5f9' }}>{area.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{area.contactPerson || 'No contact person'}</div>
                </td>
                <td style={{ color: '#cbd5e1' }}>{area.subRegion}</td>
                <td>
                   <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                     {area.zone && <div>Zone: {area.zone}</div>}
                     {area.town && <div>Town: {area.town}</div>}
                     {!area.zone && !area.town && '---'}
                   </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="dept-tag" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                    {area.staffCount || 0}
                  </span>
                </td>
                <td style={{ textAlign: 'center', fontWeight: '700', color: '#f1f5f9' }}>{area.schoolsCount || 0}</td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '700', color: '#f1f5f9' }}>{(area.associatesCount || 0) + (area.volunteersCount || 0)}</div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>
                    {area.associatesCount || 0} Assoc. | {area.volunteersCount || 0} Vol.
                  </div>
                </td>
                <td>
                  <span className="dept-tag" style={{ 
                    background: area.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                    color: area.status === 'ACTIVE' ? '#10b981' : '#f59e0b' 
                  }}>
                    {area.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAreas.length === 0 && (
          <div className="empty-data">No areas found matching your search.</div>
        )}
      </div>

      {/* Add Area Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="ministry-card" style={{ width: '100%', maxWidth: '500px', margin: 0 }}>
            <div className="ministry-card-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <PlusCircle style={{ color: '#0ea5e9' }} />
                <span>Add New Area</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#64748b' }}>
                <X />
              </button>
            </div>
            
            <form onSubmit={handleCreateArea} style={{ padding: '24px' }}>
              <div className="form-field">
                <label>Area Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. West Hawassa Area"
                  style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white' }}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label>Sub Region</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Sidama"
                    style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white' }}
                    value={formData.subRegion}
                    onChange={e => setFormData({ ...formData, subRegion: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Fellowships</label>
                  <input 
                    type="number" 
                    style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white' }}
                    value={formData.fellowshipsCount}
                    onChange={e => setFormData({ ...formData, fellowshipsCount: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-field">
                  <label>Zone</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white' }}
                    value={formData.zone}
                    onChange={e => setFormData({ ...formData, zone: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Town/Location</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white' }}
                    value={formData.town}
                    onChange={e => setFormData({ ...formData, town: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-field">
                <label>Coordinator / Contact Person</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '12px', background: '#020617', border: '1px solid #334155', borderRadius: '10px', color: 'white' }}
                  value={formData.contactPerson}
                  onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#1e293b', color: '#94a3b8', fontWeight: '700' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionalAreas;
