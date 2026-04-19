import { apiClient } from './apiClient';

export const subRegionalApi = {
  // Events
  createEvent: (data: any) => apiClient<any>('/events', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Schools (Proxy Entry)
  proxySchoolEntry: (data: any) => apiClient<any>('/schools/proxy', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Personnel (Direct Registration)
  registerAssociateDirect: (data: any) => apiClient<any>('/personnel/associate/direct', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Area Management
  proposeArea: (data: any) => apiClient<any>('/areas/propose', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Gatekeeper Hub (Approvals)
  fetchPendingApprovals: () => apiClient<any>('/sub-regional/approvals/all'),

  reviewSubmission: (type: string, id: number | string, data: any) => apiClient<any>(`/workflows/${type}/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  // Manager Planning & Reporting
  submitManagerReport: (formData: FormData) => apiClient<any>('/reports/sub-regional', {
    method: 'POST',
    body: formData
  }),

  getManagerSubmissions: () => apiClient<{ reports: any[], plans: any[] }>('/sub-regional/submissions'),

  // Network Directory
  getNetwork: () => apiClient<{ areaStaff: any[], associates: any[] }>('/sub-regional/network'),
};
