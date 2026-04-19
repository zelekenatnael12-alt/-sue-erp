import { useState, useEffect } from 'react';
import { api, Announcement } from '../../api/api';
import './AdminAnnouncements.css';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state for Create/Edit
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target: 'ALL' as 'ALL' | 'COORDINATOR' | 'EXECUTIVE',
    isActive: true
  });
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ title: '', content: '', target: 'ALL', isActive: true });
    setShowModal(true);
  };

  const openEditModal = (a: Announcement) => {
    setEditingId(a.id);
    setFormData({
      title: a.title,
      content: a.content,
      target: a.target,
      isActive: a.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingId) {
        await api.updateAnnouncement(editingId, formData);
      } else {
        await api.createAnnouncement(formData);
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const toggleStatus = async (a: Announcement) => {
    try {
      await api.updateAnnouncement(a.id, { isActive: !a.isActive });
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  if (loading && announcements.length === 0) return <div className="aa-loading">Loading announcements...</div>;

  return (
    <div className="aa">
      <div className="aa__header">
        <div>
          <h1 className="aa__title">Announcements</h1>
          <p className="aa__subtitle">Broadcast important news and updates to coordinators and executives.</p>
        </div>
        <button className="btn btn--primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">add</span>
          New Announcement
        </button>
      </div>

      {error && <div className="aa__error card">{error}</div>}

      <div className="aa__grid">
        {announcements.length === 0 ? (
          <div className="aa__empty card">
            <span className="material-symbols-outlined">campaign</span>
            <p>No announcements yet. Click "New Announcement" to get started.</p>
          </div>
        ) : (
          announcements.map(a => (
            <div className={`aa__card card ${!a.isActive ? 'aa__card--inactive' : ''}`} key={a.id}>
              <div className="aa__card-header">
                <div>
                  <span className={`aa__target aa__target--${a.target.toLowerCase()}`}>{a.target}</span>
                  <h3 className="aa__card-title">{a.title}</h3>
                </div>
                <div className="aa__card-meta">
                  <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="aa__card-body">
                <p>{a.content}</p>
              </div>
              <div className="aa__card-footer">
                <button 
                  className={`aa__status-btn ${a.isActive ? 'aa__status-btn--active' : ''}`}
                  onClick={() => toggleStatus(a)}
                >
                  <span className="material-symbols-outlined">
                    {a.isActive ? 'visibility' : 'visibility_off'}
                  </span>
                  {a.isActive ? 'Active' : 'Draft'}
                </button>
                <div className="aa__actions">
                  <button onClick={() => openEditModal(a)} title="Edit">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="aa__action--danger" onClick={() => handleDelete(a.id)} title="Delete">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="aa__modal-overlay">
          <div className="aa__modal card">
            <div className="aa__modal-header">
              <h2>{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>
              <button onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="aa__form">
              <div className="aa__form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="E.g., Quarter 3 Planning Deadline"
                  required 
                />
              </div>
              <div className="aa__form-group">
                <label>Content</label>
                <textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  placeholder="Details of the announcement..."
                  rows={4}
                  required 
                />
              </div>
              <div className="aa__form-row">
                <div className="aa__form-group">
                  <label>Target Audience</label>
                  <select 
                    value={formData.target} 
                    onChange={e => setFormData({...formData, target: e.target.value as any})}
                  >
                    <option value="ALL">Everyone</option>
                    <option value="COORDINATOR">Coordinators Only</option>
                    <option value="EXECUTIVE">Executives Only</option>
                  </select>
                </div>
                <div className="aa__form-group">
                  <label>Status</label>
                  <div className="aa__checkbox-wrapper">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={formData.isActive} 
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <label htmlFor="isActive">Show immediately</label>
                  </div>
                </div>
              </div>
              <div className="aa__modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : (editingId ? 'Save Changes' : 'Post Announcement')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
