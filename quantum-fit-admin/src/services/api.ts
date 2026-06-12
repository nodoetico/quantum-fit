import axios from 'axios';
import { API_URL } from '../config/api';
import type { AuthResponse, LoginInput, User, Class, Reward } from '../types';
import type { LandingContent, Testimonial, Plan, Banner, GalleryImage, Gym, Course, BuffetItem, NewsItem, PointsConfig, SiteConfig } from '../types';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor to add Authorization header from localStorage (for mobile API compatibility)
// In production, the httpOnly cookie is used instead
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<{ success: boolean; data: AuthResponse; message: string }>('/auth/login', data);
    return response.data.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<{ data: User }>('/auth/me');
    return response.data.data;
  },

  getUsersCount: async (): Promise<{ success: boolean; data: { total: number } }> => {
    const response = await api.get('/auth/users/count');
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await api.get<{ data: User[] }>('/auth/users');
    return response.data.data;
  },

  createUser: async (data: { name: string; email: string; password: string; role: string; isVip: boolean }): Promise<User> => {
    const response = await api.post<{ data: User }>('/auth/users', data);
    return response.data.data;
  },

  updateUserRole: async (userId: string, role: string): Promise<User> => {
    const response = await api.put<{ data: User }>(`/auth/users/${userId}/role`, { role });
    return response.data.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/auth/users/${userId}`);
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
};

export const bookingsService = {
  getAll: async (params?: {
    status?: string;
    classId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/admin/bookings/${id}`);
    return response.data;
  },

  create: async (data: { userId: string; classId: string }) => {
    const response = await api.post('/admin/bookings', data);
    return response.data;
  },

  update: async (id: string, data: { status?: string; attended?: boolean }) => {
    const response = await api.put(`/admin/bookings/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/bookings/${id}`);
  },

  getStats: async () => {
    const response = await api.get('/admin/bookings/stats/resumen');
    return response.data;
  },
};

export const classesService = {
  getAll: async (params?: {
    activityType?: string;
    difficultyLevel?: string;
    instructorId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/admin/classes', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/admin/classes/${id}`);
    return response.data;
  },

  create: async (data: Partial<Class>) => {
    const response = await api.post('/admin/classes', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Class>) => {
    const response = await api.put(`/admin/classes/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/classes/${id}`);
  },

  getStats: async () => {
    const response = await api.get('/admin/classes/stats/resumen');
    return response.data;
  },
};

export const landingService = {
  getContent: async (): Promise<LandingContent[]> => {
    const response = await api.get<{ success: boolean; data: LandingContent[] }>('/landing/content/admin');
    return response.data.data;
  },

  createContent: async (data: Partial<LandingContent>): Promise<LandingContent> => {
    const response = await api.post<{ success: boolean; data: LandingContent }>('/landing/content', data);
    return response.data.data;
  },

  updateContent: async (id: string, data: Partial<LandingContent>): Promise<LandingContent> => {
    const response = await api.put<{ success: boolean; data: LandingContent }>(`/landing/content/${id}`, data);
    return response.data.data;
  },

  deleteContent: async (id: string): Promise<void> => {
    await api.delete(`/landing/content/${id}`);
  },

  getTestimonials: async (): Promise<Testimonial[]> => {
    const response = await api.get<{ success: boolean; data: Testimonial[] }>('/landing/testimonials/admin');
    return response.data.data;
  },

  createTestimonial: async (data: Partial<Testimonial>): Promise<Testimonial> => {
    const response = await api.post<{ success: boolean; data: Testimonial }>('/landing/testimonials', data);
    return response.data.data;
  },

  updateTestimonial: async (id: string, data: Partial<Testimonial>): Promise<Testimonial> => {
    const response = await api.put<{ success: boolean; data: Testimonial }>(`/landing/testimonials/${id}`, data);
    return response.data.data;
  },

  deleteTestimonial: async (id: string): Promise<void> => {
    await api.delete(`/landing/testimonials/${id}`);
  },

  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get<{ success: boolean; data: Plan[] }>('/landing/plans/admin');
    return response.data.data;
  },

  createPlan: async (data: Partial<Plan>): Promise<Plan> => {
    const response = await api.post<{ success: boolean; data: Plan }>('/landing/plans', data);
    return response.data.data;
  },

  updatePlan: async (id: string, data: Partial<Plan>): Promise<Plan> => {
    const response = await api.put<{ success: boolean; data: Plan }>(`/landing/plans/${id}`, data);
    return response.data.data;
  },

  deletePlan: async (id: string): Promise<void> => {
    await api.delete(`/landing/plans/${id}`);
  },

  getBanners: async (): Promise<Banner[]> => {
    const response = await api.get<{ success: boolean; data: Banner[] }>('/landing/banners/admin');
    return response.data.data;
  },

  createBanner: async (data: Partial<Banner>): Promise<Banner> => {
    const response = await api.post<{ success: boolean; data: Banner }>('/landing/banners', data);
    return response.data.data;
  },

  updateBanner: async (id: string, data: Partial<Banner>): Promise<Banner> => {
    const response = await api.put<{ success: boolean; data: Banner }>(`/landing/banners/${id}`, data);
    return response.data.data;
  },

  deleteBanner: async (id: string): Promise<void> => {
    await api.delete(`/landing/banners/${id}`);
  },

  getGallery: async (): Promise<GalleryImage[]> => {
    const response = await api.get<{ success: boolean; data: GalleryImage[] }>('/landing/gallery/admin');
    return response.data.data;
  },

  createGalleryImage: async (data: Partial<GalleryImage>): Promise<GalleryImage> => {
    const response = await api.post<{ success: boolean; data: GalleryImage }>('/landing/gallery', data);
    return response.data.data;
  },

  updateGalleryImage: async (id: string, data: Partial<GalleryImage>): Promise<GalleryImage> => {
    const response = await api.put<{ success: boolean; data: GalleryImage }>(`/landing/gallery/${id}`, data);
    return response.data.data;
  },

  deleteGalleryImage: async (id: string): Promise<void> => {
    await api.delete(`/landing/gallery/${id}`);
  },
};

export const rewardsService = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/admin/rewards', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/admin/rewards/${id}`);
    return response.data;
  },

  create: async (data: Partial<Reward>) => {
    const response = await api.post('/admin/rewards', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Reward>) => {
    const response = await api.put(`/admin/rewards/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/admin/rewards/${id}`);
    return response.data;
  },

  getRedemptions: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await api.get('/admin/rewards/redemptions', { params });
    return response.data;
  },

  updateRedemptionStatus: async (id: string, status: string) => {
    const response = await api.put(`/admin/rewards/redemptions/${id}/status`, { status });
    return response.data;
  },
};

export const gymService = {
  getAll: async (): Promise<Gym[]> => {
    const response = await api.get<{ success: boolean; data: Gym[] }>('/landing/gyms/admin');
    return response.data.data;
  },

  create: async (data: Partial<Gym>): Promise<Gym> => {
    const response = await api.post<{ success: boolean; data: Gym }>('/landing/gyms', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Gym>): Promise<Gym> => {
    const response = await api.put<{ success: boolean; data: Gym }>(`/landing/gyms/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/landing/gyms/${id}`);
  },
};

export const coursesService = {
  getAll: async (): Promise<Course[]> => {
    const response = await api.get<{ success: boolean; data: Course[] }>('/landing/courses/admin');
    return response.data.data;
  },
  create: async (data: Partial<Course>): Promise<Course> => {
    const response = await api.post<{ success: boolean; data: Course }>('/landing/courses', data);
    return response.data.data;
  },
  update: async (id: string, data: Partial<Course>): Promise<Course> => {
    const response = await api.put<{ success: boolean; data: Course }>(`/landing/courses/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/landing/courses/${id}`);
  },
};

export const buffetService = {
  getAll: async (): Promise<BuffetItem[]> => {
    const response = await api.get<{ success: boolean; data: BuffetItem[] }>('/landing/buffet/admin');
    return response.data.data;
  },
  create: async (data: Partial<BuffetItem>): Promise<BuffetItem> => {
    const response = await api.post<{ success: boolean; data: BuffetItem }>('/landing/buffet', data);
    return response.data.data;
  },
  update: async (id: string, data: Partial<BuffetItem>): Promise<BuffetItem> => {
    const response = await api.put<{ success: boolean; data: BuffetItem }>(`/landing/buffet/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/landing/buffet/${id}`);
  },
};

export const newsService = {
  getAll: async (): Promise<NewsItem[]> => {
    const response = await api.get<{ success: boolean; data: NewsItem[] }>('/landing/news/admin');
    return response.data.data;
  },
  create: async (data: Partial<NewsItem>): Promise<NewsItem> => {
    const response = await api.post<{ success: boolean; data: NewsItem }>('/landing/news', data);
    return response.data.data;
  },
  update: async (id: string, data: Partial<NewsItem>): Promise<NewsItem> => {
    const response = await api.put<{ success: boolean; data: NewsItem }>(`/landing/news/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/landing/news/${id}`);
  },
};

export const integrationService = {
  getStatus: async () => {
    const response = await api.get('/admin/integration/status');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/admin/integration/profile');
    return response.data;
  },

  syncUser: async (userId: string) => {
    const response = await api.post('/admin/integration/sync/user', { userId });
    return response.data;
  },
};

export const pointsConfigService = {
  getAll: async (): Promise<PointsConfig[]> => {
    const response = await api.get<{ success: boolean; data: PointsConfig[] }>('/admin/points-config');
    return response.data.data;
  },

  upsert: async (data: Partial<PointsConfig> & { activityKey: string; label: string; points: number; category: string }): Promise<PointsConfig> => {
    const response = await api.post<{ success: boolean; data: PointsConfig }>('/admin/points-config', data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/points-config/${id}`);
  },

  seedDefaults: async (): Promise<PointsConfig[]> => {
    const response = await api.post<{ success: boolean; data: PointsConfig[] }>('/admin/points-config/seed');
    return response.data.data;
  },
};

export const siteConfigService = {
  get: async (): Promise<SiteConfig> => {
    const response = await api.get<{ success: boolean; data: SiteConfig }>('/landing/site-config');
    return response.data.data;
  },
  update: async (data: Partial<SiteConfig>): Promise<SiteConfig> => {
    const response = await api.put<{ success: boolean; data: SiteConfig }>('/landing/site-config', data);
    return response.data.data;
  },
};

export default api;
