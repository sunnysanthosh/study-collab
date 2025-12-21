const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('studycollab_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('studycollab_token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('studycollab_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP error! status: ${response.status}`,
        };
      }

      return { data };
    } catch (error: any) {
      return {
        error: error.message || 'Network error occurred',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);

// Auth API
export const authApi = {
  register: async (name: string, email: string, password: string) => {
    return api.post<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/api/auth/register', { name, email, password });
  },

  login: async (email: string, password: string) => {
    return api.post<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/api/auth/login', { email, password });
  },

  refresh: async (refreshToken: string) => {
    return api.post<{ accessToken: string }>('/api/auth/refresh', {
      refreshToken,
    });
  },

  logout: async () => {
    return api.post('/api/auth/logout');
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    return api.get('/api/users/profile');
  },

  updateProfile: async (updates: {
    name?: string;
    email?: string;
    password?: string;
    avatar_url?: string;
  }) => {
    return api.put('/api/users/profile', updates);
  },
};

// Topic API
export const topicApi = {
  getTopics: async (filters?: {
    search?: string;
    subject?: string;
    difficulty?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    
    const query = params.toString();
    return api.get(`/api/topics${query ? `?${query}` : ''}`);
  },

  getTopic: async (id: string) => {
    return api.get(`/api/topics/${id}`);
  },

  createTopic: async (topic: {
    title: string;
    description?: string;
    subject?: string;
    difficulty?: string;
    tags?: string[];
  }) => {
    return api.post('/api/topics', topic);
  },

  joinTopic: async (id: string) => {
    return api.post(`/api/topics/${id}/join`);
  },

  leaveTopic: async (id: string) => {
    return api.post(`/api/topics/${id}/leave`);
  },
};

// Message API
export const messageApi = {
  getMessages: async (topicId: string, limit = 50, offset = 0) => {
    return api.get(`/api/messages/topic/${topicId}?limit=${limit}&offset=${offset}`);
  },

  createMessage: async (topicId: string, content: string) => {
    return api.post('/api/messages', { topic_id: topicId, content });
  },
};

