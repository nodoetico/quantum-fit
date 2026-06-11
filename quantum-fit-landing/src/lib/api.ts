const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return json.data;
}

export interface ApiContent {
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

export interface ApiTestimonial {
  id: string;
  name: string;
  role?: string;
  text: string;
  photoUrl?: string;
  rating: number;
  order: number;
}

export interface ApiPlan {
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
}

export interface ApiBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  linkText?: string;
  isActive: boolean;
  order: number;
}

export interface ApiGalleryImage {
  id: string;
  url: string;
  alt?: string;
  category?: string;
  order: number;
  isActive?: boolean;
}

export interface ApiGym {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  hours?: string;
  isActive: boolean;
}

export const api = {
  content: {
    getAll: () => fetchJSON<ApiContent[]>("/landing/content/admin"),
    getBySection: async (section: string) => {
      const all = await fetchJSON<ApiContent[]>("/landing/content/admin");
      return all.filter((c) => c.section === section && c.isActive).sort((a, b) => a.order - b.order);
    },
  },
  testimonials: {
    getAll: () => fetchJSON<ApiTestimonial[]>("/landing/testimonials/admin"),
  },
  plans: {
    getAll: () => fetchJSON<ApiPlan[]>("/landing/plans/admin"),
  },
  banners: {
    getAll: () => fetchJSON<ApiBanner[]>("/landing/banners/admin"),
  },
  gallery: {
    getAll: () => fetchJSON<ApiGalleryImage[]>("/landing/gallery/admin"),
  },
  gyms: {
    getAll: () => fetchJSON<ApiGym[]>("/landing/gyms/admin"),
  },
};
