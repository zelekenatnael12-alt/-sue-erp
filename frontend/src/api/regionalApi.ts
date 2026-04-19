import { apiClient } from './apiClient';

export const regionalApi = {
  getDashboardStats: () => apiClient<any>('/regional/dashboard'),
  
  fetchRegionalAssets: () => apiClient<any[]>('/assets/regional'),
  assignAsset: (assetId: string, userId: number | null) => apiClient<any>(`/assets/${assetId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ userId })
  }),
  reportAssetIssue: (assetId: string, note: string) => apiClient<any>(`/assets/${assetId}/issue`, {
    method: 'PATCH',
    body: JSON.stringify({ note })
  }),

  // Future endpoints
  getAdvisoryTeam: () => apiClient<any[]>('/regional/advisory'),
  registerAdvisoryMember: (data: any) => apiClient<any>('/regional/advisory', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateAdvisoryMember: (id: string, data: any) => apiClient<any>(`/regional/advisory/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  getStructuralSubRegions: () => apiClient<any[]>('/regional/structure'),

  fetchAreaProposals: () => apiClient<any[]>('/areas/pending'),
  charterArea: (id: string, data: any) => apiClient<any>(`/areas/${id}/charter`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  fetchRegionalAreas: () => apiClient<any[]>('/regional/areas'),
  addRegionalArea: (data: any) => apiClient<any>('/regional/areas', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  fetchRegionalTreasury: () => apiClient<any>('/finance/regional-ledger'),

  // Oversight & Approvals
  fetchPendingApprovals: () => apiClient<any>('/regional/approvals/all'),
  reviewSubmission: (type: string, id: number | string, data: any) => apiClient<any>(`/workflows/${type}/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
};
