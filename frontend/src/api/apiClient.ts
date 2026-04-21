const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_PREFIX = '/api';

/**
 * Global API Client
 * Centralizes authentication, prefixing, and error handling.
 */
export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${API_PREFIX}${endpoint}`;
  
  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
  };

  // Only set Content-Type to JSON if explicitly not FormData (browser handles FormData boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Support secure cookies from Phase A
    });

    // Global interceptor for unauthorized sessions
    if (response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('sue_user'); // Clear stale UI state
        window.location.href = '/-sue-erp/login?expired=true';
      }
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}
