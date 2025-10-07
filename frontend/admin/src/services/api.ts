// API configuration and services for Admin panel
const API_BASE_URL = 'http://localhost:5074/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    users: {
      list: '/user',
      students: '/user/students',
      mentors: '/user/mentors',
      getById: (id: number) => `/user/${id}`,
      updateStatus: (id: number) => `/user/${id}/status`,
      updateRole: (id: number) => `/user/${id}/role`,
      approve: (id: number) => `/user/${id}/approve`,
      delete: (id: number) => `/user/${id}`,
    },
    mentor: {
      management: '/mentor/management',
      ban: (id: number) => `/mentor/${id}/ban`,
      unban: (id: number) => `/mentor/${id}/unban`,
      updateStatus: (id: number) => `/mentor/${id}/status`,
      statistics: '/mentor/statistics',
    },
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      refreshToken: '/auth/refresh-token',
    }
  }
};

// HTTP client with error handling
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('admin_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('admin_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('admin_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Unauthorized access. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);