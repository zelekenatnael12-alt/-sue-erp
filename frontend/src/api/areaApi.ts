/**
 * Area Staff Portal - API Service
 * Handles specialized data entry for field staff
 */

const API_BASE = '/erp/api'; 

async function areaRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('sue_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const areaApi = {
  // Schools
  registerSchool: (data: any) => areaRequest<any>('/schools', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getSchoolRegistry: () => areaRequest<any[]>('/area/schools'),
  getSchoolDetail: (id: number) => areaRequest<any>(`/area/schools/${id}`),
  verifySchool: (id: number, status: 'VERIFIED' | 'REJECTED') => areaRequest<any>(`/area/schools/${id}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // Personnel
  registerVolunteer: (data: any) => areaRequest<any>('/personnel/volunteer', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  registerAssociate: (data: any) => areaRequest<any>('/personnel/associate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // PSR (Personal Support Raise)
  addDonor: (data: any) => areaRequest<any>('/psr/donors', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  getDonors: () => areaRequest<any[]>('/psr/donors'),

  logPledge: (data: any) => areaRequest<any>('/pledges', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Weekly Progress
  logWeeklyProgress: (data: any) => areaRequest<any>('/weekly-progress', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Plans & Reports
  submitPlan: (data: any) => areaRequest<any>('/plans', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  submitReport: (formData: FormData) => fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: formData
  }).then(res => res.json()),

  updateReport: (id: number, formData: FormData) => fetch(`${API_BASE}/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body: formData
  }).then(res => res.json()),

  getSubmissions: () => areaRequest<{ reports: any[], plans: any[] }>('/area/submissions'),

  // ID Services
  requestPhysicalId: (data: any) => areaRequest<any>('/id-requests', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Assets
  fetchMyAssets: () => areaRequest<any[]>('/assets/me'),
  reportAssetIssue: (assetId: string, note: string) => areaRequest<any>(`/assets/${assetId}/issue`, {
    method: 'PATCH',
    body: JSON.stringify({ note })
  }),
};
