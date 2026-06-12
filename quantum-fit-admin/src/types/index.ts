export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIP';
  isVip: boolean;
  avatarUrl?: string;
  points: number;
  isActive: boolean;
  memberSince: string;
  lastActive: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  instructorId?: string;
  instructorName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalSpots: number;
  bookedSpots: number;
  activityType: string;
  difficultyLevel: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  location?: string;
  gymZone?: string;
  isActive: boolean;
  isCancelled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  classId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  bookedAt: string;
  cancelledAt?: string;
  attended: boolean;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl' | 'role' | 'isVip'>;
  class?: Pick<Class, 'id' | 'name' | 'startTime' | 'endTime' | 'activityType' | 'instructorName'>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  bookings?: T[];
  classes?: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================
// LANDING PAGE TYPES
// ============================================

export interface LandingContent {
  id: string;
  section: string; // "hero", "about", "features", "contact"
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  text: string;
  photoUrl?: string;
  rating: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  period: string;
  currency: string;
  features: string[];
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  linkText?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  pointsCost: number;
  category: 'PRODUCTO' | 'BEBIDA' | 'DESCUENTO' | 'PROMOCION';
  stockTotal: number;
  stockAvailable: number;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RedeemedReward {
  id: string;
  userId: string;
  rewardId: string;
  status: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'CANCELLED';
  pointsSpent: number;
  pickupCode: string;
  pickupDeadline?: string;
  pickedUpAt?: string;
  notes?: string;
  fulfilledBy?: string;
  redeemedAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
  reward?: { id: string; name: string; pointsCost: number };
}

export interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
  category?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Gym {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  hours?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BuffetItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  author?: string;
  publishedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PointsConfig {
  id: string;
  activityKey: string;
  label: string;
  points: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteConfig {
  id: string;
  siteName: string;
  slogan: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}
