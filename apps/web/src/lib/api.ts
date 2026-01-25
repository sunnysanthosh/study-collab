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
    if (typeof window !== 'undefined' && typeof localStorage?.getItem === 'function') {
      this.token = localStorage.getItem('studycollab_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined' && typeof localStorage?.setItem === 'function') {
      localStorage.setItem('studycollab_token', token);
    } else if (typeof window !== 'undefined' && typeof localStorage?.removeItem === 'function') {
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

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
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

  logout: async (refreshToken?: string | null) => {
    return api.post('/api/auth/logout', { refreshToken });
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
    category?: string;
    subject?: string;
    difficulty?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
    sort?: 'created_at' | 'title' | 'popularity';
    order?: 'asc' | 'desc';
    createdFrom?: string;
    createdTo?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
    if (filters?.limit !== undefined) params.append('limit', String(filters.limit));
    if (filters?.offset !== undefined) params.append('offset', String(filters.offset));
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.order) params.append('order', filters.order);
    if (filters?.createdFrom) params.append('created_from', filters.createdFrom);
    if (filters?.createdTo) params.append('created_to', filters.createdTo);
    
    const query = params.toString();
    return api.get(`/api/topics${query ? `?${query}` : ''}`);
  },

  getTopic: async (id: string) => {
    return api.get(`/api/topics/${id}`);
  },

  createTopic: async (topic: {
    title: string;
    description?: string;
    category?: string;
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

  getFavorites: async () => {
    return api.get('/api/topics/favorites/list');
  },

  addFavorite: async (id: string) => {
    return api.post(`/api/topics/${id}/favorite`);
  },

  removeFavorite: async (id: string) => {
    return api.delete(`/api/topics/${id}/favorite`);
  },
};

// Admin API
export const adminApi = {
  getStats: async () => {
    return api.get<{ stats: { totalUsers: number; activeTopics: number; pendingRequests: number; onlineNow: number; totalMessages: number } }>('/api/admin/stats');
  },
  getUsers: async (limit = 50, offset = 0) => {
    return api.get<{ users: AdminUser[]; limit: number; offset: number }>(`/api/admin/users?limit=${limit}&offset=${offset}`);
  },
  updateUser: async (id: string, updates: { name?: string; email?: string; role?: string }) => {
    return api.patch<{ user: AdminUser }>(`/api/admin/users/${id}`, updates);
  },
  deleteUser: async (id: string) => {
    return api.delete<{ message: string }>(`/api/admin/users/${id}`);
  },
  getTopics: async (limit = 50, offset = 0) => {
    return api.get<{ topics: AdminTopic[]; limit: number; offset: number }>(`/api/admin/topics?limit=${limit}&offset=${offset}`);
  },
  deleteTopic: async (id: string) => {
    return api.delete<{ message: string }>(`/api/admin/topics/${id}`);
  },
  getHealth: async () => {
    return api.get<{ status: string; timestamp: string }>('/health');
  },
  getActivityLogs: async (limit = 50, offset = 0) => {
    return api.get<{ logs: AdminActivityLog[]; limit: number; offset: number }>(`/api/admin/activity-logs?limit=${limit}&offset=${offset}`);
  },
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AdminTopic {
  id: string;
  title: string;
  created_at: string;
  creator_name: string | null;
  member_count: string;
  message_count: string;
}

export interface AdminActivityLog {
  id: string;
  admin_user_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  admin_name?: string | null;
}

// Message API
export const messageApi = {
  getMessages: async (topicId: string, limit = 50, offset = 0) => {
    return api.get(`/api/messages/topic/${topicId}?limit=${limit}&offset=${offset}`);
  },

  createMessage: async (topicId: string, content: string) => {
    return api.post(`/api/messages/topic/${topicId}`, { content });
  },

  editMessage: async (messageId: string, content: string) => {
    return api.put(`/api/messages/${messageId}`, { content });
  },

  deleteMessage: async (messageId: string) => {
    return api.delete(`/api/messages/${messageId}`);
  },

  addReaction: async (messageId: string, emoji: string) => {
    return api.post(`/api/messages/${messageId}/reactions`, { emoji });
  },

  getReactions: async (messageId: string) => {
    return api.get(`/api/messages/${messageId}/reactions`);
  },
};

// File API
export const fileApi = {
  uploadFile: async (
    file: File,
    type: string = 'general',
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = api.getToken();

    return new Promise<{ data?: any; error?: string }>((resolve) => {
      const request = new XMLHttpRequest();
      request.open('POST', `${API_URL}/api/files/upload`);
      if (token) {
        request.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      request.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = (event.loaded / event.total) * 100;
          onProgress(percent);
        }
      };

      request.onload = () => {
        try {
          const response = JSON.parse(request.responseText);
          if (request.status >= 200 && request.status < 300) {
            resolve({ data: response });
          } else {
            resolve({ error: response.error || 'Upload failed' });
          }
        } catch {
          resolve({ error: 'Upload failed' });
        }
      };

      request.onerror = () => {
        resolve({ error: 'Upload failed' });
      };

      request.send(formData);
    });
  },

  uploadAvatar: async (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = api.getToken();

    return new Promise<{ data?: any; error?: string }>((resolve) => {
      const request = new XMLHttpRequest();
      request.open('POST', `${API_URL}/api/files/avatar`);
      if (token) {
        request.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      request.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = (event.loaded / event.total) * 100;
          onProgress(percent);
        }
      };

      request.onload = () => {
        try {
          const response = JSON.parse(request.responseText);
          if (request.status >= 200 && request.status < 300) {
            resolve({ data: response });
          } else {
            resolve({ error: response.error || 'Upload failed' });
          }
        } catch {
          resolve({ error: 'Upload failed' });
        }
      };

      request.onerror = () => {
        resolve({ error: 'Upload failed' });
      };

      request.send(formData);
    });
  },

  getFileUrl: (path: string) => {
    return `${API_URL}${path}`;
  },
};

// Notification API
export const notificationApi = {
  getNotifications: async (limit = 50, offset = 0) => {
    return api.get(`/api/notifications?limit=${limit}&offset=${offset}`);
  },

  getUnreadCount: async () => {
    return api.get('/api/notifications/unread-count');
  },

  markAsRead: async (notificationId: string) => {
    return api.put(`/api/notifications/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    return api.put('/api/notifications/read-all');
  },

  deleteNotification: async (notificationId: string) => {
    return api.delete(`/api/notifications/${notificationId}`);
  },
};

