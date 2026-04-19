import { useLocation } from 'react-router-dom';

const AdminPlaceholder = () => {
  const location = useLocation();
  const path = location.pathname.split('/').pop() || 'Overview';
  const title = path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', minHeight: '60vh', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
        {title.replace('-', ' ')}
      </h1>
      <p style={{ color: '#6b7280' }}>
        This section is currently under construction. More details will be added soon.
      </p>
    </div>
  );
};

export default AdminPlaceholder;
