import { useState, useEffect } from 'react';
import { api, Event } from '../../api/api';
import './AdminEvents.css';

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    type: 'GENERAL' as 'GENERAL' | 'TRAINING' | 'OUTREACH',
    isActive: true
  });
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      type: 'GENERAL',
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (e: Event) => {
    setEditingId(e.id);
    setFormData({
      title: e.title,
      description: e.description || '',
      date: new Date(e.date).toISOString().split('T')[0],
      location: e.location || '',
      type: e.type,
      isActive: e.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingId) {
        await api.updateEvent(editingId, formData);
      } else {
        await api.createEvent(formData);
      }
      setShowModal(false);
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.deleteEvent(id);
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const toggleStatus = async (e: Event) => {
    try {
      await api.updateEvent(e.id, { isActive: !e.isActive });
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  if (loading && events.length === 0) return <div className="ae-loading">Loading events...</div>;

  return (
    <div className="ae">
      <div className="ae__header">
        <div>
          <h1 className="ae__title">Events & Training</h1>
          <p className="ae__subtitle">Schedule and manage upcoming training sessions, outreach programs, and general events.</p>
        </div>
        <button className="btn btn--primary" onClick={openCreateModal}>
          <span className="material-symbols-outlined">event</span>
          Create Event
        </button>
      </div>

      {error && <div className="ae__error card">{error}</div>}

      <div className="ae__table-card card">
        <div className="ae__table-wrapper">
          <table className="ae__table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Type</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No events scheduled.
                  </td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event.id} className={!event.isActive ? 'ae__row--inactive' : ''}>
                    <td>
                      <div className="ae__event-info">
                        <strong>{event.title}</strong>
                        <p>{event.description}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`ae__badge ae__badge--${event.type.toLowerCase()}`}>
                        {event.type}
                      </span>
                    </td>
                    <td>
                      <div className="ae__date">
                        <span className="material-symbols-outlined">calendar_today</span>
                        {new Date(event.date).toLocaleDateString(undefined, { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td>
                      <div className="ae__location">
                        <span className="material-symbols-outlined">location_on</span>
                        {event.location || '—'}
                      </div>
                    </td>
                    <td>
                      <button 
                        className={`ae__status-toggle ${event.isActive ? 'ae__status-toggle--active' : ''}`}
                        onClick={() => toggleStatus(event)}
                      >
                        {event.isActive ? 'Publish' : 'Draft'}
                      </button>
                    </td>
                    <td>
                      <div className="ae__actions">
                        <button onClick={() => openEditModal(event)} title="Edit">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button className="ae__action--danger" onClick={() => handleDelete(event.id)} title="Delete">
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="ae__modal-overlay">
          <div className="ae__modal card">
            <div className="ae__modal-header">
              <h2>{editingId ? 'Edit Event' : 'Schedule New Event'}</h2>
              <button onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="ae__form">
              <div className="ae__form-group">
                <label>Event Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="E.g., Regional Coordinator Workshop"
                  required 
                />
              </div>
              <div className="ae__form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional details about the event..."
                  rows={3}
                />
              </div>
              <div className="ae__form-row">
                <div className="ae__form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    required 
                  />
                </div>
                <div className="ae__form-group">
                  <label>Event Type</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="GENERAL">General Event</option>
                    <option value="TRAINING">Training Session</option>
                    <option value="OUTREACH">Outreach Program</option>
                  </select>
                </div>
              </div>
              <div className="ae__form-group">
                <label>Location</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="Physical or virtual location"
                  required 
                />
              </div>
              <div className="ae__checkbox-wrapper">
                <input 
                  type="checkbox" 
                  id="eventStatus"
                  checked={formData.isActive} 
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                />
                <label htmlFor="eventStatus">Make this event visible on the public calendar</label>
              </div>
              <div className="ae__modal-footer">
                <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : (editingId ? 'Update Event' : 'Schedule Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
