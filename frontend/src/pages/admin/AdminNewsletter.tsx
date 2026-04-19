import { useState, useEffect } from 'react';
import { api, Newsletter } from '../../api/api';
import './AdminNewsletter.css';

export default function AdminNewsletter() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    publishDate: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED'
  });
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    setLoading(true);
    try {
      const data = await api.getNewsletters();
      setNewsletters(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch newsletters');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      author: '',
      publishDate: new Date().toISOString().split('T')[0],
      status: 'DRAFT'
    });
    setShowModal(true);
  };

  const openEditModal = (n: Newsletter) => {
    setEditingId(n.id);
    setFormData({
      title: n.title,
      content: n.content,
      author: n.author || '',
      publishDate: new Date(n.publishDate).toISOString().split('T')[0],
      status: n.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingId) {
        await api.updateNewsletter(editingId, formData);
      } else {
        await api.createNewsletter(formData);
      }
      setShowModal(false);
      fetchNewsletters();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this newsletter edition?')) return;
    try {
      await api.deleteNewsletter(id);
      fetchNewsletters();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const toggleStatus = async (n: Newsletter) => {
    try {
      const newStatus = n.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await api.updateNewsletter(n.id, { status: newStatus });
      fetchNewsletters();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  if (loading && newsletters.length === 0) return <div className="an-loading">Loading newsletters...</div>;

  return (
    <div className="an">
      <div className="an__header">
        <div>
          <h1 className="an__title">Newsletter Center</h1>
          <p className="an__subtitle">Draft and publish periodic newsletters for all members and coordinates.</p>
        </div>
        <button className="btn btn--primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">post_add</span>
          New Edition
        </button>
      </div>

      {error && <div className="an__error card">{error}</div>}

      <div className="an__list">
        {newsletters.length === 0 ? (
          <div className="an__empty card">
            <span className="material-symbols-outlined">newspaper</span>
            <p>No newsletters created yet. Start by drafting your first edition.</p>
          </div>
        ) : (
          newsletters.map(n => (
            <div className={`an__card card ${n.status === 'DRAFT' ? 'an__card--draft' : ''}`} key={n.id}>
              <div className="an__card-header">
                <span className={`an__status-pill an__status-pill--${n.status.toLowerCase()}`}>
                  {n.status}
                </span>
                <span className="an__date">{new Date(n.publishDate).toLocaleDateString()}</span>
              </div>
              <h3 className="an__card-title">{n.title}</h3>
              <p className="an__card-excerpt">{n.content.substring(0, 150)}...</p>
              <div className="an__card-footer">
                <span className="an__author">By {n.author || 'Editorial Team'}</span>
                <div className="an__actions">
                  <button onClick={() => openEditModal(n)} title="Edit">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button onClick={() => toggleStatus(n)} title={n.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}>
                    <span className="material-symbols-outlined">
                      {n.status === 'PUBLISHED' ? 'unpublished' : 'publish'}
                    </span>
                  </button>
                  <button className="an__action--danger" onClick={() => handleDelete(n.id)} title="Delete">
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
        <div className="an__modal-overlay">
          <div className="an__modal card">
            <div className="an__modal-header">
              <h2>{editingId ? 'Edit Newsletter Edition' : 'Create New Newsletter'}</h2>
              <button onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="an__form">
              <div className="an__form-group">
                <label>Edition Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="E.g., Quarterly Highlights - Q1 2026"
                  required 
                />
              </div>
              
              <div className="an__form-row">
                <div className="an__form-group">
                  <label>Author / Source</label>
                  <input 
                    type="text" 
                    value={formData.author} 
                    onChange={e => setFormData({...formData, author: e.target.value})}
                    placeholder="E.g., National Office"
                  />
                </div>
                <div className="an__form-group">
                  <label>Publish Date</label>
                  <input 
                    type="date" 
                    value={formData.publishDate} 
                    onChange={e => setFormData({...formData, publishDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="an__form-group">
                <label>Content (Full Story)</label>
                <textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  placeholder="Write the newsletter content here..."
                  rows={10}
                  required
                />
              </div>

              <div className="an__form-group">
                <label>Status</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="DRAFT">Draft (Internal Only)</option>
                  <option value="PUBLISHED">Published (Visible to All)</option>
                </select>
              </div>

              <div className="an__modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Edition')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
