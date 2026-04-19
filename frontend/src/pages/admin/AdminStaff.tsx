import { useState, useEffect } from 'react';
import { api, Staff } from '../../api/api';
import './AdminStaff.css';

const DEPARTMENTS = ['Finance', 'Programs', 'Administration', 'Field Coordination', 'IT Support', 'Communications', 'Human Resources'];

const AdminStaff = ({ isExecutive: _isExecutive }: { isExecutive?: boolean }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    position: '',
    email: '',
    phone: '',
    department: '',
    joinedDate: '',
    isActive: true
  });
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await api.getStaff();
      setStaff(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch staff list');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      full_name: '',
      position: '',
      email: '',
      phone: '',
      department: DEPARTMENTS[0],
      joinedDate: new Date().toISOString().split('T')[0],
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (s: Staff) => {
    setEditingId(s.id);
    setFormData({
      full_name: s.full_name,
      position: s.position,
      email: s.email || '',
      phone: s.phone || '',
      department: s.department || DEPARTMENTS[0],
      joinedDate: new Date(s.joinedDate).toISOString().split('T')[0],
      isActive: s.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingId) {
        await api.updateStaff(editingId, formData);
      } else {
        await api.createStaff(formData);
      }
      setShowModal(false);
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await api.deleteStaff(id);
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const toggleStatus = async (s: Staff) => {
    try {
      await api.updateStaff(s.id, { isActive: !s.isActive });
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  if (loading && staff.length === 0) return <div className="as-loading">Loading staff directory...</div>;

  return (
    <div className="as">
      <div className="as__header">
        <div>
          <h1 className="as__title">Staff Directory</h1>
          <p className="as__subtitle">Manage organization staff members, positions, and contact information.</p>
        </div>
        <button className="btn btn--primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">person_add</span>
          Add Staff Member
        </button>
      </div>

      {error && <div className="as__error card">{error}</div>}

      <div className="as__grid">
        {staff.length === 0 ? (
          <div className="as__empty card">
            <span className="material-symbols-outlined">groups</span>
            <p>No staff members added yet.</p>
          </div>
        ) : (
          staff.map(s => (
            <div className={`as__card card ${!s.isActive ? 'as__card--inactive' : ''}`} key={s.id}>
              <div className="as__card-top">
                <div className="as__avatar">{(s.full_name || 'S')[0].toUpperCase()}</div>
                <div className="as__basic-info">
                  <h3 className="as__name">{s.full_name}</h3>
                  <span className="as__position">{s.position}</span>
                </div>
                <button 
                  className={`as__status-indicator ${s.isActive ? 'as__status-indicator--active' : ''}`}
                  onClick={() => toggleStatus(s)}
                  title={s.isActive ? 'Active Member' : 'Inactive'}
                />
              </div>
              
              <div className="as__card-content">
                <div className="as__info-item">
                  <span className="material-symbols-outlined">business_center</span>
                  <span>{s.department || 'General'}</span>
                </div>
                {s.email && (
                  <div className="as__info-item">
                    <span className="material-symbols-outlined">mail</span>
                    <a href={`mailto:${s.email}`}>{s.email}</a>
                  </div>
                )}
                {s.phone && (
                  <div className="as__info-item">
                    <span className="material-symbols-outlined">call</span>
                    <span>{s.phone}</span>
                  </div>
                )}
                <div className="as__info-item">
                  <span className="material-symbols-outlined">calendar_today</span>
                  <span>Joined {new Date(s.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="as__card-actions">
                <button className="btn btn--outline btn--sm" onClick={() => openEditModal(s)}>
                  <span className="material-symbols-outlined">edit</span>
                  Edit
                </button>
                <button className="btn btn--outline btn--sm as__btn--danger" onClick={() => handleDelete(s.id)}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="as__modal-overlay">
          <div className="as__modal card">
            <div className="as__modal-header">
              <h2>{editingId ? 'Edit Staff Details' : 'Add New Staff Member'}</h2>
              <button onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="as__form">
              <div className="as__form-row">
                <div className="as__form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={formData.full_name} 
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    placeholder="John Doe"
                    required 
                  />
                </div>
                <div className="as__form-group">
                  <label>Position</label>
                  <input 
                    type="text" 
                    value={formData.position} 
                    onChange={e => setFormData({...formData, position: e.target.value})}
                    placeholder="E.g., Senior Program Coordinator"
                    required 
                  />
                </div>
              </div>
              
              <div className="as__form-row">
                <div className="as__form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="as__form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="as__form-row">
                <div className="as__form-group">
                  <label>Department</label>
                  <select 
                    value={formData.department} 
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="as__form-group">
                  <label>Joined Date</label>
                  <input 
                    type="date" 
                    value={formData.joinedDate} 
                    onChange={e => setFormData({...formData, joinedDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="as__checkbox-wrapper">
                <input 
                  type="checkbox" 
                  id="staffStatus"
                  checked={formData.isActive} 
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                />
                <label htmlFor="staffStatus">Currently Active</label>
              </div>

              <div className="as__modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Staff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;
