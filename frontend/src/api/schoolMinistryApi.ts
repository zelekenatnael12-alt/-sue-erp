/**
 * API Wrapper for School Ministry Director operations
 */

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const fetchMinistryDashboard = async () => {
  const resp = await fetch('/api/ministry/national-dashboard', { headers: getHeaders() });
  if (!resp.ok) throw new Error('Failed to fetch dashboard data');
  return resp.json();
};

export const fetchPendingRATs = async () => {
  const resp = await fetch('/api/ministry/rat/pending', { headers: getHeaders() });
  if (!resp.ok) throw new Error('Failed to fetch pending RAT members');
  return resp.json();
};

export const approveRAT = async (id: string) => {
  const resp = await fetch(`/api/ministry/rat/${id}/approve`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  if (!resp.ok) throw new Error('Failed to approve RAT member');
  return resp.json();
};

export const deployStaff = async (userId: number, subDepartment: string) => {
  const resp = await fetch('/api/ministry/deploy', {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ userId, subDepartment })
  });
  if (!resp.ok) throw new Error('Failed to deploy staff');
  return resp.json();
};

export const broadcastAnnouncement = async (data: { message: string, target: string }) => {
  const resp = await fetch('/api/communications/broadcast', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!resp.ok) throw new Error('Failed to broadcast announcement');
  return resp.json();
};
