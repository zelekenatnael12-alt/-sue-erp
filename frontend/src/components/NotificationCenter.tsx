import React, { useState, useEffect } from 'react';
import { api, Notification } from '../api/api';

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 min poll
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Notify fetch error', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notification-center-container" style={{ position: 'relative' }}>
      <button 
        className="nav-action-btn" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: unreadCount > 0 ? 'rgba(244, 63, 94, 0.1)' : 'transparent', border: '1px solid #1e293b', borderRadius: '12px', padding: '8px 16px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <span style={{ fontSize: '18px' }}>🔔</span>
        {unreadCount > 0 && <span style={{ background: '#f43f5e', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '100px', fontWeight: 800 }}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div style={{ position: 'absolute', top: '50px', right: '0', width: '320px', background: '#020617', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 1000, overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>Notifications</h4>
            <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12px' }} onClick={() => setIsOpen(false)}>Close</button>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>No alerts yet</div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  style={{ padding: '16px', borderBottom: '1px solid #0f172a', background: n.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.03)', opacity: n.isRead ? 0.6 : 1, transition: '0.2s' }}
                  onClick={() => markAsRead(n.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: n.type === 'VETO' ? '#f43f5e' : '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{n.type}</span>
                    <span style={{ fontSize: '10px', color: '#475569' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{n.title}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>{n.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
