// API Service for Admin Dashboard

import { ADMIN_API_BASE_URL, API_BASE_URL } from '../utils/constants';
import type { 
  ApiResponse, 
  PagedResult, 
  User, 
  Resource, 
  ResourceType,
  Booking, 
  DashboardStats,
  UserSearchFilters,
  BookingSearchFilters,
  CreateUserForm,
  UpdateUserForm,
  CreateResourceForm,
  UpdateResourceForm
} from '../types/admin';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = ADMIN_API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Get headers with authentication
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Always get the latest token from localStorage
    this.token = localStorage.getItem('token');
    
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
          throw new Error('Unauthorized - Please login again');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    // Use direct API call for login (not admin API)
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.token) {
      this.setToken(data.token);
    }

    return {
      success: true,
      data: data,
      message: data.message || 'Login successful',
      errors: [],
      timestamp: new Date().toISOString()
    };
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  // Dashboard
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/admin/dashboard');
  }

  // Users
  async getUsers(filters?: UserSearchFilters): Promise<ApiResponse<PagedResult<User>>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    
    return this.request<PagedResult<User>>(endpoint);
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${id}`);
  }

  async createUser(userData: CreateUserForm): Promise<ApiResponse<User>> {
    return this.request<User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: UpdateUserForm): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async updateUserRole(id: string, role: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  }

  // Resources
  async getResources(page: number = 1, pageSize: number = 100): Promise<ApiResponse<PagedResult<Resource>>> {
    return this.request<PagedResult<Resource>>(`/admin/resources?page=${page}&pageSize=${pageSize}`);
  }

  async getResourceById(id: number): Promise<ApiResponse<Resource>> {
    return this.request<Resource>(`/admin/resources/${id}`);
  }

  async createResource(resourceData: CreateResourceForm): Promise<ApiResponse<Resource>> {
    return this.request<Resource>('/admin/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData),
    });
  }

  async updateResource(id: number, resourceData: UpdateResourceForm): Promise<ApiResponse<Resource>> {
    return this.request<Resource>(`/admin/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData),
    });
  }

  async deleteResource(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/resources/${id}`, {
      method: 'DELETE',
    });
  }

  async getResourceTypes(): Promise<ApiResponse<ResourceType[]>> {
    try {
      return await this.request<ResourceType[]>('/admin/resource-types');
    } catch (error) {
      // Fallback data if API is not available
      console.warn('Resource types API not available, using fallback data:', error);
      return {
        success: true,
        data: [
          { resourceTypeId: 1, name: 'DropInDesk' },
          { resourceTypeId: 2, name: 'MeetingRoom' },
          { resourceTypeId: 3, name: 'VRset' },
          { resourceTypeId: 4, name: 'AIserver' }
        ],
        message: 'Using fallback data',
        errors: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  // Bookings
  async getBookings(filters?: BookingSearchFilters): Promise<ApiResponse<PagedResult<Booking>>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/bookings?${queryString}` : '/admin/bookings';
    
    return this.request<PagedResult<Booking>>(endpoint);
  }

  async getBookingById(id: number): Promise<ApiResponse<Booking>> {
    return this.request<Booking>(`/admin/bookings/${id}`);
  }

  async cancelBooking(id: number): Promise<string> {
    const url = `${API_BASE_URL}/bookings/cancel/${id}`;
    const token = this.token;
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Unauthorized - Please login again');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Backend returns string "Success" directly, not JSON
      const textData = await response.text();
      return textData;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getBookingStats(): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/admin/bookings/stats');
  }

  // System
  async cleanupSystem(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/admin/system/cleanup', {
      method: 'POST',
    });
  }

  async getSystemLogs(): Promise<ApiResponse<unknown[]>> {
    return this.request<unknown[]>('/admin/system/logs');
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default apiService;
