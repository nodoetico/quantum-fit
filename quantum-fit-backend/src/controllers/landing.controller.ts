// Controlador de Landing - Gestión de contenido de la landing page
import { Request, Response } from 'express';
import * as landingService from '../services/landing.service';
import { AuthRequest } from '../types';

// ============================================
// LANDING CONTENT
// ============================================

/**
 * GET /api/landing/content
 * Obtiene todo el contenido de la landing (público)
 */
export async function getLandingContent(req: Request, res: Response): Promise<void> {
  try {
    const { section } = req.query;

    let data;
    if (section) {
      data = await landingService.getLandingContentBySection(section as string);
    } else {
      data = await landingService.getAllLandingContent();
    }

    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener contenido';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * GET /api/landing/content/admin
 * Obtiene todo el contenido (incluido inactivo) - solo admin
 */
export async function getLandingContentAdmin(_req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const data = await landingService.getAllLandingContentAdmin();
    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener contenido';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * GET /api/landing/content/:id
 * Obtiene un contenido por ID
 */
export async function getLandingContentById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = await landingService.getLandingContentById(id);

    if (!data) {
      res.status(404).json({ success: false, error: 'Contenido no encontrado' });
      return;
    }

    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener contenido';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * POST /api/landing/content
 * Crea nuevo contenido - solo admin
 */
export async function createLandingContent(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { section, title, subtitle, description, imageUrl, ctaText, ctaLink, isActive, order } = req.body;

    if (!section) {
      res.status(400).json({ success: false, error: 'La sección es requerida' });
      return;
    }

    const data = await landingService.createLandingContent({
      section, title, subtitle, description, imageUrl, ctaText, ctaLink, isActive, order,
    });

    res.status(201).json({ success: true, data, message: 'Contenido creado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear contenido';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * PUT /api/landing/content/:id
 * Actualiza contenido - solo admin
 */
export async function updateLandingContent(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { section, title, subtitle, description, imageUrl, ctaText, ctaLink, isActive, order } = req.body;

    const data = await landingService.updateLandingContent(id, {
      section, title, subtitle, description, imageUrl, ctaText, ctaLink, isActive, order,
    });

    res.status(200).json({ success: true, data, message: 'Contenido actualizado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar contenido';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * DELETE /api/landing/content/:id
 * Elimina contenido - solo admin
 */
export async function deleteLandingContent(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await landingService.deleteLandingContent(id);
    res.status(200).json({ success: true, message: 'Contenido eliminado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar contenido';
    res.status(400).json({ success: false, error: message });
  }
}

// ============================================
// TESTIMONIALS
// ============================================

/**
 * GET /api/landing/testimonials
 * Obtiene testimonios activos (público)
 */
export async function getTestimonials(_req: Request, res: Response): Promise<void> {
  try {
    const data = await landingService.getAllTestimonials();
    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener testimonios';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * GET /api/landing/testimonials/admin
 * Obtiene todos los testimonios - solo admin
 */
export async function getTestimonialsAdmin(_req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const data = await landingService.getAllTestimonialsAdmin();
    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener testimonios';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * POST /api/landing/testimonials
 * Crea testimonio - solo admin
 */
export async function createTestimonial(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { name, role, text, photoUrl, rating, isActive, order } = req.body;

    if (!name || !text || !rating) {
      res.status(400).json({ success: false, error: 'Nombre, texto y rating son requeridos' });
      return;
    }

    const data = await landingService.createTestimonial({
      name, role, text, photoUrl, rating, isActive, order,
    });

    res.status(201).json({ success: true, data, message: 'Testimonio creado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear testimonio';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * PUT /api/landing/testimonials/:id
 * Actualiza testimonio - solo admin
 */
export async function updateTestimonial(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, role, text, photoUrl, rating, isActive, order } = req.body;

    const data = await landingService.updateTestimonial(id, {
      name, role, text, photoUrl, rating, isActive, order,
    });

    res.status(200).json({ success: true, data, message: 'Testimonio actualizado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar testimonio';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * DELETE /api/landing/testimonials/:id
 * Elimina testimonio - solo admin
 */
export async function deleteTestimonial(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await landingService.deleteTestimonial(id);
    res.status(200).json({ success: true, message: 'Testimonio eliminado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar testimonio';
    res.status(400).json({ success: false, error: message });
  }
}

// ============================================
// PLANS
// ============================================

/**
 * GET /api/landing/plans
 * Obtiene planes activos (público)
 */
export async function getPlans(_req: Request, res: Response): Promise<void> {
  try {
    const data = await landingService.getAllPlans();
    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener planes';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * GET /api/landing/plans/admin
 * Obtiene todos los planes - solo admin
 */
export async function getPlansAdmin(_req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const data = await landingService.getAllPlansAdmin();
    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener planes';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * POST /api/landing/plans
 * Crea plan - solo admin
 */
export async function createPlan(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description, price, period, currency, features, isFeatured, isActive, order } = req.body;

    if (!name || price === undefined || !period) {
      res.status(400).json({ success: false, error: 'Nombre, precio y período son requeridos' });
      return;
    }

    const data = await landingService.createPlan({
      name, description, price: parseFloat(price), period, currency, features, isFeatured, isActive, order,
    });

    res.status(201).json({ success: true, data, message: 'Plan creado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear plan';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * PUT /api/landing/plans/:id
 * Actualiza plan - solo admin
 */
export async function updatePlan(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, price, period, currency, features, isFeatured, isActive, order } = req.body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (period !== undefined) updateData.period = period;
    if (currency !== undefined) updateData.currency = currency;
    if (features !== undefined) updateData.features = features;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = order;

    const data = await landingService.updatePlan(id, updateData);

    res.status(200).json({ success: true, data, message: 'Plan actualizado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar plan';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * DELETE /api/landing/plans/:id
 * Elimina plan - solo admin
 */
export async function deletePlan(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await landingService.deletePlan(id);
    res.status(200).json({ success: true, message: 'Plan eliminado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar plan';
    res.status(400).json({ success: false, error: message });
  }
}

// ============================================
// BANNERS
// ============================================

/**
 * GET /api/landing/banners
 * Obtiene banners activos (público)
 */
export async function getBanners(_req: Request, res: Response): Promise<void> {
  try {
    const data = await landingService.getAllBanners();
    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener banners';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * GET /api/landing/banners/admin
 * Obtiene todos los banners - solo admin
 */
export async function getBannersAdmin(_req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const data = await landingService.getAllBannersAdmin();
    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener banners';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * POST /api/landing/banners
 * Crea banner - solo admin
 */
export async function createBanner(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { title, subtitle, imageUrl, linkUrl, linkText, isActive, order } = req.body;

    if (!title || !imageUrl) {
      res.status(400).json({ success: false, error: 'Título e imagen son requeridos' });
      return;
    }

    const data = await landingService.createBanner({
      title, subtitle, imageUrl, linkUrl, linkText, isActive, order,
    });

    res.status(201).json({ success: true, data, message: 'Banner creado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al crear banner';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * PUT /api/landing/banners/:id
 * Actualiza banner - solo admin
 */
export async function updateBanner(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, subtitle, imageUrl, linkUrl, linkText, isActive, order } = req.body;

    const data = await landingService.updateBanner(id, {
      title, subtitle, imageUrl, linkUrl, linkText, isActive, order,
    });

    res.status(200).json({ success: true, data, message: 'Banner actualizado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar banner';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * DELETE /api/landing/banners/:id
 * Elimina banner - solo admin
 */
export async function deleteBanner(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await landingService.deleteBanner(id);
    res.status(200).json({ success: true, message: 'Banner eliminado exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar banner';
    res.status(400).json({ success: false, error: message });
  }
}

// ============================================
// GALLERY
// ============================================

/**
 * GET /api/landing/gallery
 * Obtiene galería activa (público)
 */
export async function getGallery(req: Request, res: Response): Promise<void> {
  try {
    const { category } = req.query;

    let data;
    if (category) {
      data = await landingService.getAllGalleryImages();
      data = data.filter((img) => img.category === category);
    } else {
      data = await landingService.getAllGalleryImages();
    }

    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener galería';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * GET /api/landing/gallery/admin
 * Obtiene toda la galería - solo admin
 */
export async function getGalleryAdmin(_req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const data = await landingService.getAllGalleryImagesAdmin();
    res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al obtener galería';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * POST /api/landing/gallery
 * Crea imagen de galería - solo admin
 */
export async function createGalleryImage(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { url, alt, category, order, isActive } = req.body;

    if (!url) {
      res.status(400).json({ success: false, error: 'La URL de la imagen es requerida' });
      return;
    }

    const data = await landingService.createGalleryImage({
      url, alt, category, order, isActive,
    });

    res.status(201).json({ success: true, data, message: 'Imagen agregada a la galería' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al agregar imagen';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * PUT /api/landing/gallery/:id
 * Actualiza imagen de galería - solo admin
 */
export async function updateGalleryImage(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { url, alt, category, order, isActive } = req.body;

    const data = await landingService.updateGalleryImage(id, {
      url, alt, category, order, isActive,
    });

    res.status(200).json({ success: true, data, message: 'Imagen actualizada exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar imagen';
    res.status(400).json({ success: false, error: message });
  }
}

/**
 * DELETE /api/landing/gallery/:id
 * Elimina imagen de galería - solo admin
 */
export async function deleteGalleryImage(req: Request & AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await landingService.deleteGalleryImage(id);
    res.status(200).json({ success: true, message: 'Imagen eliminada exitosamente' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar imagen';
    res.status(400).json({ success: false, error: message });
  }
}
