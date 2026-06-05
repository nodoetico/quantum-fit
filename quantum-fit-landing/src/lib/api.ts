// API para obtener contenido de la landing desde el backend
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api';

export interface LandingContent {
  id: string;
  section: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  text: string;
  photoUrl?: string;
  rating: number;
  isActive: boolean;
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
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  linkText?: string;
  isActive: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
  category?: string;
  order: number;
  isActive: boolean;
}

async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    return null;
  }
}

export async function getContentBySection(section: string): Promise<LandingContent[]> {
  return (await fetchApi<LandingContent[]>(`/landing/content?section=${section}`)) || [];
}

export async function getAllContent(): Promise<LandingContent[]> {
  return (await fetchApi<LandingContent[]>('/landing/content')) || [];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return (await fetchApi<Testimonial[]>('/landing/testimonials')) || [];
}

export async function getPlans(): Promise<Plan[]> {
  return (await fetchApi<Plan[]>('/landing/plans')) || [];
}

export async function getBanners(): Promise<Banner[]> {
  return (await fetchApi<Banner[]>('/landing/banners')) || [];
}

export async function getGallery(category?: string): Promise<GalleryImage[]> {
  const endpoint = category ? `/landing/gallery?category=${category}` : '/landing/gallery';
  return (await fetchApi<GalleryImage[]>(endpoint)) || [];
}
