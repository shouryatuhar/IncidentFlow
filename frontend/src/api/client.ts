const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const getToken = (): string | null => {
  return localStorage.getItem('incidentflow_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('incidentflow_token', token);
};

export const clearToken = (): void => {
  localStorage.removeItem('incidentflow_token');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = data?.error?.message || data?.message || 'An unexpected error occurred';
    const details = data?.error?.details || data?.details;
    if (response.status === 401) {
      // If unauthorized, token is expired/invalid
      // only clear token if not hitting login or register
      if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        clearToken();
      }
    }
    throw new ApiError(errorMessage, response.status, details);
  }

  return data.data !== undefined ? data.data : data;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};
