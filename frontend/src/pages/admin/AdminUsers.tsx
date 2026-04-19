import { useState, useEffect } from 'react';
import { api, User } from '../../api/api';
import IdCardGenerator from '../../components/IdCardGenerator';
import './AdminUsers.css';

const REGIONS = [
  'Addis Ababa & Surroundings',
  'Central Ethiopia Region',
  'East Region',
  'North Region',
  'North East Region',
  'North West Region',
  'South East Region',
  'South Ethiopia Region',
  'South West Region',
  'West Region'
];

const AdminUsers = ({ isExecutive }: { isExecutive?: boolean }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'COORDINATOR' | 'EXECUTIVE' | 'ADMIN'>('ALL');
  
  // Modal state
  const [editingUser, setEditingUser] = useState<Partial<User> & { password?: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setModalLoading(true);
    try {
      if (isCreating) {
        if (!isExecutive && (editingUser.role === 'ADMIN' || editingUser.role === 'EXECUTIVE')) {
          throw new Error('Only Executive can create Admin or Executive users');
        }
        await api.createAdminUser(editingUser);
      } else {
        await api.updateAdminUser(editingUser.id!, editingUser);
      }
      setEditingUser(null);
      setIsCreating(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || (isCreating ? 'Creation failed' : 'Update failed'));
    } finally {
      setModalLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !editingUser) return;
    const formData = new FormData();
    formData.append('media', e.target.files[0]);

    setModalLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setEditingUser({ ...editingUser, photoUrl: `${BASE_URL}${data.path}` });
    } catch (err: any) {
      alert(err.message || 'Photo upload failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      await api.updateAdminUser(user.id, { isActive: !user.isActive });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Toggle status failed');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this user? This may fail if they have related records.')) return;
    
    try {
      await api.deleteAdminUser(id);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Delete failed. Consider deactivating the user instead.');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading && users.length === 0) return <div className="au-loading">Loading users...</div>;

  return (
    <div className="au">
      <div className="au__header">
        <div>
          <h1 className="au__title">User Management</h1>
          <p className="au__subtitle">Manage roles, regions, and access for all system users.</p>
        </div>
        <button className="btn btn--primary" onClick={() => {
          setIsCreating(true);
          setEditingUser({ name: '', email: '', role: 'COORDINATOR', region: '', isActive: true, password: '' });
          setActiveTab(1);
        }}>
          <span className="material-symbols-outlined">person_add</span>
          Create New User
        </button>
      </div>

      <div className="au__controls card">
        <div className="au__filters">
          <div className="au__search">
            <span className="material-symbols-outlined">search</span>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="au__select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
          >
            <option value="ALL">All Roles</option>
            <option value="COORDINATOR">Coordinators</option>
            <option value="SUB_REGIONAL">Sub-Regional Staff</option>
            <option value="AREA_STAFF">Area Staff</option>
            <option value="ASSOCIATE">Associate Staff</option>
            <option value="EXECUTIVE">Executives</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
        <div className="au__stats">
          Total: <strong>{filteredUsers.length}</strong>
        </div>
      </div>

      {error && <div className="au__error card">{error}</div>}

      <div className="au__table-card card">
        <div className="au__table-wrapper">
          <table className="au__table">
            <thead>
              <tr>
                <th>User</th>
                <th>ID Number</th>
                <th>Role</th>
                <th>Region</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="au__empty">No users found</td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="au__user-cell">
                        <div className="au__avatar">{(u.name || u.email)[0].toUpperCase()}</div>
                        <div className="au__user-info">
                          <strong>{u.name || 'No Name'}</strong>
                          <span>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><code className="au__id-code">{u.idNumber || '—'}</code></td>
                    <td>
                      <span className={`au__role au__role--${u.role.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.region || '—'}</td>
                    <td>
                      <button 
                        className={`au__status-toggle ${u.isActive ? 'au__status-toggle--active' : ''}`}
                        onClick={() => handleToggleStatus(u)}
                        title={u.isActive ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="au__actions">
                        <button className="au__action-btn" onClick={() => { setIsCreating(false); setEditingUser(u); setActiveTab(1); }} title="Edit">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <IdCardGenerator staff={u} />
                        <button className="au__action-btn au__action-btn--danger" onClick={() => handleDeleteUser(u.id)} title="Delete">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Re-architected Tabbed Modal */}
      {editingUser && (
        <div className="au__modal-overlay">
          <div className="au__modal card">
            
            <div className="au__modal-header">
              <h2>{isCreating ? 'Create New User' : 'Edit User'}</h2>
              <button className="au__close" onClick={() => { setEditingUser(null); setIsCreating(false); }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="au__tabs">
              <button 
                type="button" 
                className={`au__tab ${activeTab === 1 ? 'au__tab--active' : ''}`} 
                onClick={() => setActiveTab(1)}
              >
                1. Core Account
              </button>
              <button 
                type="button" 
                className={`au__tab ${activeTab === 2 ? 'au__tab--active' : ''}`} 
                onClick={() => setActiveTab(2)}
              >
                2. Role & Geography
              </button>
              <button 
                type="button" 
                className={`au__tab ${activeTab === 3 ? 'au__tab--active' : ''}`} 
                onClick={() => setActiveTab(3)}
              >
                3. ID Card Identity
              </button>
              <button 
                type="button" 
                className={`au__tab ${activeTab === 4 ? 'au__tab--active' : ''}`} 
                onClick={() => setActiveTab(4)}
              >
                4. Auxiliary Data
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="au__form">
              <div className="au__tab-content">
                
                {/* ════════════ TAB 1: Core Account ════════════ */}
                {activeTab === 1 && (
                  <div className="au__tab-pane">
                    <div className="au__form-row">
                      <div className="au__form-group">
                        <label>Full Name</label>
                        <input 
                          type="text" 
                          value={editingUser.name || ''} 
                          onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="au__form-group">
                        <label>Email Address</label>
                        <input 
                          type="email" 
                          value={editingUser.email || ''} 
                          onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                          required 
                        />
                      </div>
                    </div>

                    {isCreating ? (
                      <div className="au__form-row">
                        <div className="au__form-group">
                          <label>Initial Password</label>
                          <input 
                            type="password" 
                            value={editingUser.password || ''} 
                            onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                            required={isCreating}
                            minLength={6}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="au__alert au__alert--info">
                        Password updates for existing users must be done via their individual profile settings or a password reset link.
                      </div>
                    )}
                  </div>
                )}

                {/* ════════════ TAB 2: Role & Geography ════════════ */}
                {activeTab === 2 && (
                  <div className="au__tab-pane">
                    <div className="au__form-row">
                      <div className="au__form-group">
                        <label>System Role</label>
                        <select 
                          value={editingUser.role || 'COORDINATOR'} 
                          onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                        >
                          <option value="COORDINATOR">Regional Coordinator</option>
                          <option value="SUB_REGIONAL">Sub-Regional Staff</option>
                          <option value="AREA_STAFF">Area Staff</option>
                          <option value="ASSOCIATE">Associate Staff</option>
                          {isExecutive && <option value="ADMIN">System Admin</option>}
                          {isExecutive && <option value="EXECUTIVE">Executive / Director</option>}
                        </select>
                      </div>

                      {['COORDINATOR', 'SUB_REGIONAL', 'AREA_STAFF'].includes(editingUser.role || '') && (
                        <div className="au__form-group">
                          <label>Primary Region</label>
                          <select 
                            value={editingUser.region || ''} 
                            onChange={e => setEditingUser({ ...editingUser, region: e.target.value })}
                            required
                          >
                            <option value="">Select Region</option>
                            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="au__form-row">
                      {['SUB_REGIONAL', 'AREA_STAFF'].includes(editingUser.role || '') && (
                        <div className="au__form-group">
                          <label>Sub-Region Assignment</label>
                          <input 
                            type="text" 
                            placeholder="Enter territory"
                            value={editingUser.subRegion || ''} 
                            onChange={e => setEditingUser({ ...editingUser, subRegion: e.target.value })}
                            required
                          />
                        </div>
                      )}

                      {editingUser.role === 'AREA_STAFF' && (
                        <div className="au__form-group">
                          <label>Local Area</label>
                          <input 
                            type="text" 
                            placeholder="Enter local area"
                            value={editingUser.area || ''} 
                            onChange={e => setEditingUser({ ...editingUser, area: e.target.value })}
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ════════════ TAB 3: ID Card Identity ════════════ */}
                {activeTab === 3 && (
                  <div className="au__tab-pane">
                    <div className="au__form-row">
                      <div className="au__form-group au__file-upload">
                        <label>Staff Portrait Photograph</label>
                        <div className="au__file-drop">
                          {editingUser.photoUrl ? (
                             <img src={editingUser.photoUrl} alt="Preview" className="au__file-preview" />
                          ) : (
                             <span className="material-symbols-outlined au__file-icon">account_circle</span>
                          )}
                          <div className="au__file-text">
                            <span>Upload New Portrait</span>
                            <small>JPEG or PNG (1:1 Ratio recommended)</small>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={modalLoading}
                            className="au__file-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="au__form-row">
                      <div className="au__form-group">
                        <label>Title (English)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Mr., Dr., Rev."
                          value={editingUser.title || ''} 
                          onChange={e => setEditingUser({...editingUser, title: e.target.value})}
                        />
                      </div>
                      <div className="au__form-group">
                        <label>Title (Amharic)</label>
                        <input 
                          type="text" 
                          placeholder="ለምሳሌ፡ አቶ፣ ዶ/ር"
                          value={editingUser.titleAm || ''} 
                          onChange={e => setEditingUser({...editingUser, titleAm: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="au__form-row">
                      <div className="au__form-group">
                        <label>First Name (Amharic)</label>
                        <input 
                          type="text" 
                          placeholder="ለምሳሌ፡ አበበ"
                          value={editingUser.firstNameAm || ''} 
                          onChange={e => setEditingUser({...editingUser, firstNameAm: e.target.value})}
                        />
                      </div>
                      <div className="au__form-group">
                        <label>Last Name (Amharic)</label>
                        <input 
                          type="text" 
                          placeholder="ለምሳሌ፡ በቀለ"
                          value={editingUser.lastNameAm || ''} 
                          onChange={e => setEditingUser({...editingUser, lastNameAm: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="au__form-row">
                      <div className="au__form-group">
                        <label>Department (English)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. School Ministry"
                          value={editingUser.department || ''} 
                          onChange={e => setEditingUser({...editingUser, department: e.target.value})}
                        />
                      </div>
                      <div className="au__form-group">
                        <label>Department (Amharic)</label>
                        <input 
                          type="text" 
                          placeholder="ለምሳሌ፡ የትምህርት ቤት አገልግሎት"
                          value={editingUser.departmentAm || ''} 
                          onChange={e => setEditingUser({...editingUser, departmentAm: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="au__form-row">
                      <div className="au__form-group">
                        <label>Role Print Override (Amharic)</label>
                        <input 
                          type="text" 
                          placeholder="ለምሳሌ፡ ክልላዊ አስተባባሪ"
                          value={editingUser.roleAmharic || ''} 
                          onChange={e => setEditingUser({...editingUser, roleAmharic: e.target.value})}
                        />
                      </div>
                      <div className="au__form-group">
                        <label>Staff ID Assignment</label>
                        <input 
                          type="text" 
                          placeholder="Leave empty for auto-generation"
                          value={editingUser.idNumber || ''} 
                          onChange={e => setEditingUser({...editingUser, idNumber: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ════════════ TAB 4: Auxiliary Data ════════════ */}
                {activeTab === 4 && (
                  <div className="au__tab-pane">
                    <div className="au__form-row">
                      <div className="au__form-group">
                        <label>Office Address</label>
                        <input 
                          type="text" 
                          placeholder="HEAD OFFICE / ዋና ቢሮ"
                          value={editingUser.officeAddress || ''} 
                          onChange={e => setEditingUser({...editingUser, officeAddress: e.target.value})}
                        />
                      </div>
                      <div className="au__form-group">
                        <label>Nationality</label>
                        <input 
                          type="text" 
                          placeholder="ETHIOPIAN / ኢትዮጵያዊ"
                          value={editingUser.nationality || ''} 
                          onChange={e => setEditingUser({...editingUser, nationality: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="au__form-row">
                      <div className="au__form-group">
                        <label>Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="+251..."
                          value={editingUser.phone || ''} 
                          onChange={e => setEditingUser({...editingUser, phone: e.target.value})}
                        />
                      </div>
                      <div className="au__form-group">
                        <label>Emergency Contact</label>
                        <input 
                          type="text" 
                          placeholder="Name & Number"
                          value={editingUser.emergencyContact || ''} 
                          onChange={e => setEditingUser({...editingUser, emergencyContact: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="au__form-row">
                      <div className="au__form-group">
                        <label>ID Issue Date</label>
                        <input 
                          type="date"
                          value={editingUser.issueDate ? editingUser.issueDate.substring(0, 10) : ''}
                          onChange={e => setEditingUser({...editingUser, issueDate: e.target.value})}
                        />
                      </div>
                      <div className="au__form-group">
                        <label>ID Expiry Date</label>
                        <input 
                          type="date"
                          value={editingUser.expireDate ? editingUser.expireDate.substring(0, 10) : ''}
                          onChange={e => setEditingUser({...editingUser, expireDate: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="au__form-row">
                      <div className="au__form-group">
                        <label>Blood Type</label>
                        <input 
                          type="text" 
                          placeholder="e.g. O+"
                          value={editingUser.bloodType || ''} 
                          onChange={e => setEditingUser({...editingUser, bloodType: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="au__modal-footer">
                {activeTab > 1 ? (
                  <button type="button" className="btn btn--outline" onClick={() => setActiveTab(activeTab - 1)}>
                    &larr; Previous
                  </button>
                ) : (
                  <button type="button" className="btn btn--outline" onClick={() => { setEditingUser(null); setIsCreating(false); }}>
                    Cancel
                  </button>
                )}

                {activeTab < 4 ? (
                  <button type="button" className="btn btn--primary" onClick={() => setActiveTab(activeTab + 1)}>
                    Next Step &rarr;
                  </button>
                ) : (
                  <button type="submit" className="btn btn--primary" disabled={modalLoading}>
                    <span className="material-symbols-outlined">save</span>
                    {modalLoading ? 'Saving...' : (isCreating ? 'Create Account' : 'Save All Changes')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
