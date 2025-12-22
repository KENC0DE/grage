import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'super_admin';
  garageName?: string;
  garageAddress?: string;
  garageLatitude?: number;
  garageLongitude?: number;
  serviceRadius?: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  subcategories?: Subcategory[];
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  categoryId: number;
  category?: Category;
  icon?: string;
  image?: string;
  estimatedDuration: number;
  priceMin: number;
  priceMax: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  id: number;
  requestNumber: string;
  customerId: number;
  customer?: User;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  categoryId: number;
  category?: Category;
  subcategoryId: number;
  subcategory?: Subcategory;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  addressFull: string;
  locationLatitude: number;
  locationLongitude: number;
  addressPin?: string;
  preferredDate: string;
  preferredTime: string;
  description: string;
  images?: string;
  status: 'pending' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  assignedToId?: number;
  assignedTo?: User;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
  actualCost: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  statusHistory?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  rating?: number;
  review?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  data: {
    user: User;
  };
}

// Auth API
export const authAPI = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: 'customer' | 'admin';
    garageName?: string;
    garageAddress?: string;
    garageLocation?: { coordinates: [number, number] };
    serviceRadius?: number;
  }) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put<ApiResponse<{ user: User }>>('/auth/updateprofile', data);
    return response.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put<AuthResponse>('/auth/updatepassword', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) => {
    const response = await api.get<ApiResponse<{ categories: Category[] }>>('/categories', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<{ category: Category }>>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: Partial<Category>) => {
    const response = await api.post<ApiResponse<{ category: Category }>>('/categories', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Category>) => {
    const response = await api.put<ApiResponse<{ category: Category }>>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<{}>>(`/categories/${id}`);
    return response.data;
  },
};

// Subcategories API
export const subcategoriesAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; category?: number; isActive?: boolean }) => {
    const response = await api.get<ApiResponse<{ subcategories: Subcategory[] }>>('/subcategories', { params });
    return response.data;
  },

  getByCategory: async (categoryId: number) => {
    const response = await api.get<ApiResponse<{ subcategories: Subcategory[]; category: Category }>>(`/categories/${categoryId}/subcategories`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<{ subcategory: Subcategory }>>(`/subcategories/${id}`);
    return response.data;
  },

  create: async (data: Partial<Subcategory>) => {
    const response = await api.post<ApiResponse<{ subcategory: Subcategory }>>('/subcategories', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Subcategory>) => {
    const response = await api.put<ApiResponse<{ subcategory: Subcategory }>>(`/subcategories/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ApiResponse<{}>>(`/subcategories/${id}`);
    return response.data;
  },
};

// Service Requests API
export const serviceRequestsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: number;
    subcategory?: number;
    priority?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    const response = await api.get<ApiResponse<{ serviceRequests: ServiceRequest[] }>>('/service-requests', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ApiResponse<{ serviceRequest: ServiceRequest }>>(`/service-requests/${id}`);
    return response.data;
  },

  create: async (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    categoryId: number;
    subcategoryId: number;
    address: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      fullAddress: string;
    };
    location: {
      coordinates: [number, number];
    };
    addressPin?: string;
    preferredDate: string;
    preferredTime: string;
    description: string;
    images?: string[];
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    const response = await api.post<ApiResponse<{ serviceRequest: ServiceRequest }>>('/service-requests', data);
    return response.data;
  },

  updateStatus: async (id: number, status: string, comment?: string) => {
    const response = await api.put<ApiResponse<{ serviceRequest: ServiceRequest }>>(`/service-requests/${id}/status`, {
      status,
      comment,
    });
    return response.data;
  },

  assign: async (id: number, garageId: number) => {
    const response = await api.put<ApiResponse<{ serviceRequest: ServiceRequest }>>(`/service-requests/${id}/assign`, {
      garageId,
    });
    return response.data;
  },

  addReview: async (id: number, rating: number, review?: string) => {
    const response = await api.post<ApiResponse<{ serviceRequest: ServiceRequest }>>(`/service-requests/${id}/review`, {
      rating,
      review,
    });
    return response.data;
  },

  cancel: async (id: number, cancellationReason?: string) => {
    const response = await api.delete<ApiResponse<{ serviceRequest: ServiceRequest }>>(`/service-requests/${id}`, {
      data: { cancellationReason },
    });
    return response.data;
  },

  getNearbyGarages: async (id: number, maxDistance?: number) => {
    const response = await api.get<ApiResponse<{ garages: User[]; serviceRequest: any }>>(`/service-requests/${id}/nearby-garages`, {
      params: { maxDistance },
    });
    return response.data;
  },
};

export default api;
