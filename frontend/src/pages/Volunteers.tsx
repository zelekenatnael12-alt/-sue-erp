import { useEffect, useState } from 'react';
import { api } from '../api/api';
import './Volunteers.css';

interface Volunteer {
  id: number;
  name: string;
  phone: string;
  verificationStatus: string;
  createdAt: string;
}

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      const data = await api.getVolunteers();
      setVolunteers(data);
    } catch (err) {
      console.error('Failed to load volunteers', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="volunteers-page"><div className="loading-shimmer">Synchronizing Personnel...</div></div>;

  return (
    <div className="volunteers-page">
      <div className="volunteers-page__header">
        <div>
          <h2 className="text-2xl font-bold">Field Volunteers</h2>
          <p className="text-muted">Manage your local volunteer network and track verification status.</p>
        </div>
      </div>

      <div className="card table-card mt-6">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map(v => (
                <tr key={v.id}>
                  <td className="font-bold">{v.name}</td>
                  <td>{v.phone || '---'}</td>
                  <td>
                    <span className={`status-badge ${v.verificationStatus === 'VERIFIED' ? 'status-badge--success' : 'status-badge--neutral'}`}>
                      {v.verificationStatus}
                    </span>
                  </td>
                  <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td className="text-right">
                    <button className="icon-btn text-muted hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
              {volunteers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No volunteers registered in your area yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Volunteers;
