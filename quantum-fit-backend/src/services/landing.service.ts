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
