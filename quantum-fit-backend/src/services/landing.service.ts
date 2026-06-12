// Servicio de Landing - Gestión de contenido de la landing page
import { prisma } from '../database';

// ============================================
// LANDING CONTENT
// ============================================

export async function getAllLandingContent() {
  return prisma.landingContent.findMany({
    where: { isActive: true },
    orderBy: [{ section: 'asc' }, { order: 'asc' }],
  });
}

export async function getAllLandingContentAdmin() {
  return prisma.landingContent.findMany({
    orderBy: [{ section: 'asc' }, { order: 'asc' }],
  });
}

export async function getLandingContentById(id: string) {
  return prisma.landingContent.findUnique({ where: { id } });
}

export async function getLandingContentBySection(section: string) {
  return prisma.landingContent.findMany({
    where: { section, isActive: true },
    orderBy: { order: 'asc' },
  });
}

export async function createLandingContent(data: {
  section: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive?: boolean;
  order?: number;
}) {
  return prisma.landingContent.create({ data });
}

export async function updateLandingContent(
  id: string,
  data: {
    section?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaLink?: string;
    isActive?: boolean;
    order?: number;
  }
) {
  return prisma.landingContent.update({
    where: { id },
    data,
  });
}

export async function deleteLandingContent(id: string) {
  return prisma.landingContent.delete({ where: { id } });
}

// ============================================
// TESTIMONIALS
// ============================================

export async function getAllTestimonials() {
  return prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}

export async function getAllTestimonialsAdmin() {
  return prisma.testimonial.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function getTestimonialById(id: string) {
  return prisma.testimonial.findUnique({ where: { id } });
}

export async function createTestimonial(data: {
  name: string;
  role?: string;
  text: string;
  photoUrl?: string;
  rating: number;
  isActive?: boolean;
  order?: number;
}) {
  return prisma.testimonial.create({ data });
}

export async function updateTestimonial(
  id: string,
  data: {
    name?: string;
    role?: string;
    text?: string;
    photoUrl?: string;
    rating?: number;
    isActive?: boolean;
    order?: number;
  }
) {
  return prisma.testimonial.update({
    where: { id },
    data,
  });
}

export async function deleteTestimonial(id: string) {
  return prisma.testimonial.delete({ where: { id } });
}

// ============================================
// PLANS
// ============================================

export async function getAllPlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}

export async function getAllPlansAdmin() {
  return prisma.plan.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function getPlanById(id: string) {
  return prisma.plan.findUnique({ where: { id } });
}

export async function createPlan(data: {
  name: string;
  description?: string;
  price: number;
  period: string;
  currency?: string;
  features: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  order?: number;
}) {
  return prisma.plan.create({ data });
}

export async function updatePlan(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    period?: string;
    currency?: string;
    features?: string[];
    isFeatured?: boolean;
    isActive?: boolean;
    order?: number;
  }
) {
  return prisma.plan.update({
    where: { id },
    data,
  });
}

export async function deletePlan(id: string) {
  return prisma.plan.delete({ where: { id } });
}

// ============================================
// BANNERS
// ============================================

export async function getAllBanners() {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}

export async function getAllBannersAdmin() {
  return prisma.banner.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function getBannerById(id: string) {
  return prisma.banner.findUnique({ where: { id } });
}

export async function createBanner(data: {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  linkText?: string;
  isActive?: boolean;
  order?: number;
}) {
  return prisma.banner.create({ data });
}

export async function updateBanner(
  id: string,
  data: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    linkUrl?: string;
    linkText?: string;
    isActive?: boolean;
    order?: number;
  }
) {
  return prisma.banner.update({
    where: { id },
    data,
  });
}

export async function deleteBanner(id: string) {
  return prisma.banner.delete({ where: { id } });
}

// ============================================
// GALLERY IMAGES
// ============================================

export async function getAllGalleryImages() {
  return prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });
}

export async function getAllGalleryImagesAdmin() {
  return prisma.galleryImage.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });
}

export async function getGalleryImageById(id: string) {
  return prisma.galleryImage.findUnique({ where: { id } });
}

export async function createGalleryImage(data: {
  url: string;
  alt?: string;
  category?: string;
  order?: number;
  isActive?: boolean;
}) {
  return prisma.galleryImage.create({ data });
}

export async function updateGalleryImage(
  id: string,
  data: {
    url?: string;
    alt?: string;
    category?: string;
    order?: number;
    isActive?: boolean;
  }
) {
  return prisma.galleryImage.update({
    where: { id },
    data,
  });
}

export async function deleteGalleryImage(id: string) {
  return prisma.galleryImage.delete({ where: { id } });
}

// ============================================
// GYMS (SEDES)
// ============================================

export async function getAllGyms() {
  return prisma.gym.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export async function getAllGymsAdmin() {
  return prisma.gym.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getGymById(id: string) {
  return prisma.gym.findUnique({ where: { id } });
}

export async function createGym(data: {
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  hours?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
}) {
  return prisma.gym.create({ data });
}

export async function updateGym(
  id: string,
  data: {
    name?: string;
    address?: string;
    city?: string;
    phone?: string;
    hours?: string;
    latitude?: number;
    longitude?: number;
    isActive?: boolean;
  }
) {
  return prisma.gym.update({
    where: { id },
    data,
  });
}

export async function deleteGym(id: string) {
  return prisma.gym.delete({ where: { id } });
}

// ============================================
// COURSES
// ============================================

export async function getAllCourses() {
  return prisma.course.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}

export async function getAllCoursesAdmin() {
  return prisma.course.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function getCourseById(id: string) {
  return prisma.course.findUnique({ where: { id } });
}

export async function createCourse(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  order?: number;
}) {
  return prisma.course.create({ data });
}

export async function updateCourse(
  id: string,
  data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
    order?: number;
  }
) {
  return prisma.course.update({
    where: { id },
    data,
  });
}

export async function deleteCourse(id: string) {
  return prisma.course.delete({ where: { id } });
}

// ============================================
// BUFFET ITEMS
// ============================================

export async function getAllBuffetItems() {
  return prisma.buffetItem.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });
}

export async function getAllBuffetItemsAdmin() {
  return prisma.buffetItem.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });
}

export async function getBuffetItemById(id: string) {
  return prisma.buffetItem.findUnique({ where: { id } });
}

export async function createBuffetItem(data: {
  name: string;
  description?: string;
  price?: number;
  category: string;
  imageUrl?: string;
  isActive?: boolean;
  order?: number;
}) {
  return prisma.buffetItem.create({ data });
}

export async function updateBuffetItem(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    imageUrl?: string;
    isActive?: boolean;
    order?: number;
  }
) {
  return prisma.buffetItem.update({
    where: { id },
    data,
  });
}

export async function deleteBuffetItem(id: string) {
  return prisma.buffetItem.delete({ where: { id } });
}

// ============================================
// NEWS
// ============================================

export async function getAllNews() {
  return prisma.news.findMany({
    where: { isActive: true },
    orderBy: { publishedAt: 'desc' },
  });
}

export async function getAllNewsAdmin() {
  return prisma.news.findMany({
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getNewsById(id: string) {
  return prisma.news.findUnique({ where: { id } });
}

function normalizeDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr}T00:00:00.000Z`;
  }
  return dateStr;
}

export async function createNews(data: {
  title: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  author?: string;
  publishedAt?: string;
  isActive?: boolean;
}) {
  return prisma.news.create({
    data: { ...data, publishedAt: normalizeDate(data.publishedAt) },
  });
}

export async function updateNews(
  id: string,
  data: {
    title?: string;
    summary?: string;
    content?: string;
    imageUrl?: string;
    author?: string;
    publishedAt?: string;
    isActive?: boolean;
  }
) {
  return prisma.news.update({
    where: { id },
    data: { ...data, publishedAt: normalizeDate(data.publishedAt) },
  });
}

export async function deleteNews(id: string) {
  return prisma.news.delete({ where: { id } });
}
