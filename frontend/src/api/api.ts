import { apiClient } from './apiClient';

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiClient<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: { email: string; password: string; name: string; role?: string; region?: string; subRegion?: string; area?: string; accessCode?: string }) =>
    apiClient<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () => apiClient<{ message: string }>('/auth/logout', { method: 'POST' }),

  me: () => apiClient<User>('/auth/me'),
  getUsers: () => apiClient<User[]>('/admin/users'),
  updateProfile: (data: Partial<User>) => apiClient<User>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient<{ user: User }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),


  // Area Staff
  getAreaDashboardStats: () => apiClient<any>('/area/dashboard-stats'),
  getAreaSyncHealth: () => apiClient<{ failures: number }>('/area/sync-health'),

  // Associate Staff
  getAssociateDashboard: () => apiClient<any>('/associate/dashboard'),

  // Unified Planning & Reporting
  getPlansUnified: () => apiClient<any>('/plans'),
  createPlanUnified: (data: any) => apiClient<any>('/plans', { method: 'POST', body: JSON.stringify(data) }),
  getReportsUnified: () => apiClient<any>('/reports'),
  createReportUnified: (data: any) => apiClient<any>('/reports', { method: 'POST', body: JSON.stringify(data) }),
  reviewWorkflow: (type: string, id: number, data: any) => apiClient<any>(`/workflows/${type}/${id}/review`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Admin
  getAdminOverview: () => apiClient<any>('/admin/overview'),
  
  getAdminUsers: () => apiClient<User[]>('/admin/users'),
  createAdminUser: (data: Partial<User> & { password?: string; subRegion?: string; area?: string }) => 
    apiClient<User>('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminUser: (id: number, data: Partial<User> & { subRegion?: string; area?: string }) => 
    apiClient<User>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAdminUser: (id: number) => 
    apiClient<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' }),

  // Announcements
  getAnnouncements: () => apiClient<Announcement[]>('/announcements'),
  createAnnouncement: (data: Partial<Announcement>) => 
    apiClient<Announcement>('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  updateAnnouncement: (id: number, data: Partial<Announcement>) => 
    apiClient<Announcement>(`/announcements/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAnnouncement: (id: number) => 
    apiClient<{ message: string }>(`/announcements/${id}`, { method: 'DELETE' }),

  // Events
  getEvents: () => apiClient<Event[]>('/events'),
  createEvent: (data: Partial<Event>) => 
    apiClient<Event>('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: number, data: Partial<Event>) => 
    apiClient<Event>(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEvent: (id: number) => 
    apiClient<{ message: string }>(`/events/${id}`, { method: 'DELETE' }),

  // Staff
  getVolunteers: () => apiClient<any[]>('/volunteers'),
  getStaff: () => apiClient<Staff[]>('/staff'),
  createStaff: (data: Partial<Staff>) => 
    apiClient<Staff>('/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id: number, data: Partial<Staff>) => 
    apiClient<Staff>(`/staff/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStaff: (id: number) => 
    apiClient<{ message: string }>(`/staff/${id}`, { method: 'DELETE' }),

  // Financials
  getFinancials: () => apiClient<FinancialRecord[]>('/financials'),
  createFinancialRecord: (data: Partial<FinancialRecord>) => 
    apiClient<FinancialRecord>('/financials', { method: 'POST', body: JSON.stringify(data) }),
  updateFinancialRecord: (id: number, data: Partial<FinancialRecord>) => 
    apiClient<FinancialRecord>(`/financials/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFinancialRecord: (id: number) => 
    apiClient<{ message: string }>(`/financials/${id}`, { method: 'DELETE' }),

  // Export
  getExportUrl: (type: 'reports' | 'users' | 'financials' | 'events') => 
    `/erp/api/admin/export?type=${type}`,

  // Newsletter
  getNewsletters: () => apiClient<Newsletter[]>('/newsletters'),
  createNewsletter: (data: Partial<Newsletter>) => 
    apiClient<Newsletter>('/newsletters', { method: 'POST', body: JSON.stringify(data) }),
  updateNewsletter: (id: number, data: Partial<Newsletter>) => 
    apiClient<Newsletter>(`/newsletters/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteNewsletter: (id: number) => 
    apiClient<{ message: string }>(`/newsletters/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => apiClient<Record<string, string>>('/settings'),
  updateSettings: (settings: Record<string, any>) => 
    apiClient<{ message: string }>('/settings', { method: 'PATCH', body: JSON.stringify(settings) }),

  // Plans
  saveDraft: (data: PlanDraftPayload) =>
    apiClient<ProjectPlan>('/plan/draft', { method: 'POST', body: JSON.stringify(data) }),

  getDraft: (id: number) => apiClient<ProjectPlan>(`/plan/draft/${id}`),

  getMyPlans: () => apiClient<ProjectPlan[]>('/plan/my'),

  submitPlan: (planId: number) =>
    apiClient<{ plan: ProjectPlan; report: Report }>('/plan/submit', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }),

  submitMonthlyReport: (data: { planId: number, reportMonth: string, reportYear: number, budgetSpent: number, narrative: string, actualsMatrix?: any }) =>
    apiClient<Report>('/monthly-report', { method: 'POST', body: JSON.stringify(data) }),

  // Reports
  getReports: () => apiClient<Report[]>('/reports'),

  getReport: (id: number) => apiClient<Report>(`/reports/${id}`),

  approveReport: (id: number) =>
    apiClient<Report>(`/reports/${id}/approve`, { method: 'PATCH' }),

  rejectReport: (id: number) =>
    apiClient<Report>(`/reports/${id}/reject`, { method: 'PATCH' }),

  // Dashboard
  getDashboardStats: () => apiClient<DashboardStats>('/dashboard/stats'),
  getAdminAnalytics: () => apiClient<any>('/admin/analytics'),
  getExecutiveAnalytics: () => apiClient<ExecutiveAnalyticsPayload>('/executive/analytics'),
  getAiInsights: () => apiClient<AiInsights>('/analytics/ai-insights'),
  getDeploymentTree: () => apiClient<DeploymentRegion[]>('/deployment-tree'),

  // Capacity Workflow
  getCapacityRequests: () => apiClient<CapacityRequest[]>('/capacity'),
  createCapacityRequest: (data: Partial<CapacityRequest>) => 
    apiClient<CapacityRequest>('/capacity', { method: 'POST', body: JSON.stringify(data) }),
  approveCapacityRequest: (id: number) => 
    apiClient<CapacityRequest>(`/capacity/${id}/approve`, { method: 'PATCH' }),
  rejectCapacityRequest: (id: number) => 
    apiClient<CapacityRequest>(`/capacity/${id}/reject`, { method: 'PATCH' }),

  // Notifications
  getNotifications: () => apiClient<Notification[]>('/notifications'),
  markNotificationAsRead: (id: string) => 
    apiClient<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Finance & HR
  getMinistryLedger: () => apiClient<any[]>('/finance/ministry-ledger'),
  provisionUser: (data: any) => 
    apiClient<{ user: any; tempPassword: string }>('/hr/provision', { method: 'POST', body: JSON.stringify(data) }),

  // Executive Veto
  executeVeto: (actionId: number, actionType: 'PLAN' | 'EXPENSE', justification: string) =>
    apiClient<any>('/executive/veto', {
      method: 'POST',
      body: JSON.stringify({ actionId, actionType, justification })
    }),

  getNationalBreakdown: (metric: string) =>
    apiClient<any[]>(`/national/breakdown/${metric}`),
    
  getNationalDashboard: () => apiClient<any>('/national/dashboard'),
  getMissionPulse: () => apiClient<any[]>('/mission-pulse'),

  // Capacity Hub
  getCapacityDashboard: () => apiClient<any>('/capacity/dashboard'),
  getCapacitySections: () => apiClient<any[]>('/reports/capacity-sections'),

  // Partnership Hub
  getPsrHealth: () => apiClient<any[]>('/finance/psr-health'),
  getDonorConflicts: () => apiClient<any[]>('/donors/conflicts'),
  resolveDonorConflict: (donorId: string, staffId: number) =>
    apiClient<any>('/donors/conflicts/resolve', {
      method: 'PATCH',
      body: JSON.stringify({ donorId, winningStaffId: staffId })
    }),

  getCommunicationsLog: () => apiClient<any[]>('/communications/log'),
  getMediaDashboard: () => apiClient<any>('/media/dashboard'),

  // Staff Portal
  getStaffHistory: () => apiClient<any[]>('/staff/my-department-reports'),
  submitDepartmentalReport: (data: any) => 
    apiClient<any>('/reports/departmental', { method: 'POST', body: JSON.stringify(data) }),

  // Admin & Migration
  getSyncHealth: () => apiClient<any>('/admin/sync-health'),
  migrateStaff: (staffList: any[]) => 
    apiClient<any>('/admin/migrate/staff', { method: 'POST', body: JSON.stringify({ staffList }) }),
  migrateAssets: (assetList: any[]) => 
    apiClient<any>('/admin/migrate/assets', { method: 'POST', body: JSON.stringify({ assetList }) }),

  // School Ministry
  getMinistryNationalDashboard: () => apiClient<any>('/ministry/national-dashboard'),
  getPendingRat: () => apiClient<any[]>('/ministry/rat/pending'),
  approveRat: (id: string) => 
    apiClient<any>(`/ministry/rat/${id}/approve`, { method: 'PATCH' }),

  // Upload
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('media', file);
    return fetch('/erp/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(r => r.json());
  },
};

// Types
export interface User {
  id: number;
  email: string;
  full_name: string;
  name: string;
  role: string;
  region?: string;
  subRegion?: string;
  area?: string;
  isActive?: boolean;
  mustChangePassword?: boolean;
  idNumber?: string;
  photoUrl?: string;
  phone?: string;
  emergencyContact?: string;
  bloodType?: string;
  title?: string;
  titleAm?: string;
  firstNameAm?: string;
  lastNameAm?: string;
  fullNameAmharic?: string;
  roleAmharic?: string;
  department?: string;
  departmentAm?: string;
  officeAddress?: string;
  nationality?: string;
  issueDate?: string;
  expireDate?: string;
}

export interface ProjectPlan {
  id: number;
  projectName: string;
  projectType: string;
  description?: string;
  orgStructure?: string;
  leadRoles?: string;
  totalStaff?: number;
  totalHighSchools?: number;
  suFellowshipSchools?: number;
  fellowshipNotSuSchools?: number;
  noFellowshipSchools?: number;
  middleSchools?: number;
  fullTimeStaffCount?: number;
  associateStaffCount?: number;
  volunteerCount?: number;
  estimatedBudget?: number;
  location?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  createdAt: string;
  updatedAt: string;
  coordinatorId: number;
  matrixActivities?: MatrixActivity[];
  reports?: Report[];
}

export interface MatrixActivity {
  id: number;
  planId: number;
  activity: string;
  target?: number;
  m1?: number;
  m2?: number;
  m3?: number;
  m4?: number;
  m5?: number;
  m6?: number;
  m7?: number;
  m8?: number;
  m9?: number;
  m10?: number;
  m11?: number;
  m12?: number;
}

export interface Report {
  id: number;
  title: string;
  dateSubmitted: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'REQUIRES_CORRECTION' | 'DRAFT';
  type: 'PLAN_APPROVAL' | 'MONTHLY_UPDATE';
  reportMonth?: string;
  reportYear?: number;
  budgetSpent?: number;
  narrative?: string;
  actualsMatrix?: string;
  submittedAt?: string;
  decidedAt?: string;
  coordinatorId: number;
  coordinator?: User;
  projectPlanId: number;
  projectPlan?: ProjectPlan;
}

export interface Notification {
  id: string;
  type: 'MISSION_PULSE' | 'SYSTEM' | 'APPROVAL' | string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  totalUsers: number;
  recentReports: Report[];
  totalVolunteers: { count: number; trend: string };
  schoolsReached: { count: number; trend: string };
  budgetRequested: { total: string; currency: string; status: string };
  regionalProgress: { region: string; actualPercent: number }[];
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  target: 'ALL' | 'COORDINATOR' | 'EXECUTIVE';
  isActive: boolean;
  region?: string;
  subRegion?: string;
  area?: string;
  authorId: number;
  author?: { full_name: string; role: string };
  createdAt: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  location?: string;
  type: 'GENERAL' | 'TRAINING' | 'OUTREACH';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: number;
  full_name: string;
  position: string;
  email?: string;
  phone?: string;
  department?: string;
  joinedDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialRecord {
  id: number;
  title: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  description?: string;
  projectId?: number;
  reportId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Newsletter {
  id: number;
  title: string;
  content: string;
  author?: string;
  publishDate: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}

export interface PlanDraftPayload {
  id?: number;
  projectName: string;
  projectType: string;
  description?: string;
  orgStructure?: string;
  leadRoles?: string;
  totalStaff?: number;

  // Baseline - Schools
  totalHighSchools?: number;
  suFellowshipSchools?: number;
  fellowshipNotSuSchools?: number;
  noFellowshipSchools?: number;
  middleSchools?: number;

  // Baseline - Personnel
  fullTimeStaffCount?: number;
  associateStaffCount?: number;
  volunteerCount?: number;

  // Matrix Activities
  matrixActivities?: Array<{
    category: string;
    activityName: string;
    targetMeskerem: number;
    targetTikimt: number;
    targetHidar: number;
    targetTahsas: number;
    targetTir: number;
    targetYekatit: number;
    targetMegabit: number;
    targetMiyazia: number;
    targetGinbot: number;
    targetSene: number;
    targetHamle: number;
    targetNehase: number;
    budgetRequired: number;
  }>;
}

export interface AdminOverview {
  users: { total: number; coordinators: number; executives: number; admins: number };
  reports: { total: number; pending: number; approved: number };
  plans: { total: number; draft: number; submitted: number };
  recentReports: Array<{
    id: number;
    title: string;
    dateSubmitted: string;
    status: string;
    coordinator?: { id: number; name: string; email: string; region: string };
    projectPlan?: { projectName: string; projectType: string };
  }>;
  recentUsers: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    region: string | null;
    createdAt: string;
  }>;
  regionBreakdown: Array<{ region: string; count: number }>;
  quickStats: {
    totalVolunteers: { count: number; trend: string };
    schoolsReached: { count: number; trend: string };
    budgetRequested: { total: string; currency: string; status: string };
  };
}

export interface AiInsights {
  strengths: string[];
  focusAreas: string[];
  coordinatorReminders: Array<{ region: string; reminder: string }>;
}

export interface ExecutiveAnalyticsPayload {
  matrixData: {
    totalTarget: number;
    totalActual: number;
  };
  financials: {
    requested: number;
    spent: number;
  };
  pendingReports: Array<{
    id: number;
    region: string;
    director: string;
    period: string;
    status: string;
  }>;
  staffPlacements: Array<{
    location: string;
    roleNeeded: string;
    status: string;
    candidate: string;
  }>;
}

export interface CapacityRequest {
  id: number;
  roleRequested: string;
  location: string;
  justification: string;
  status: 'PENDING_SUB_REGION' | 'PENDING_NATIONAL' | 'APPROVED' | 'REJECTED';
  requesterId: number;
  requester?: User;
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentStaff {
  id: number;
  full_name: string;
  role: string;
  email: string;
  avatar: string;
}

export interface DeploymentArea {
  name: string;
  type: 'AREA';
  staff: DeploymentStaff[];
}

export interface DeploymentSubRegion {
  name: string;
  type: 'SUB_REGION';
  staff: DeploymentStaff[];
  areas: DeploymentArea[];
}

export interface DeploymentRegion {
  name: string;
  type: 'REGION';
  staff: DeploymentStaff[];
  subRegions: DeploymentSubRegion[];
}
