// Rutas de Landing - Gestión de contenido de la landing page
import { Router } from 'express';
import * as landingController from '../controllers/landing.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

// Contenido de la landing
router.get('/content', landingController.getLandingContent);
router.get('/content/:id', landingController.getLandingContentById);

// Testimonios
router.get('/testimonials', landingController.getTestimonials);

// Planes
router.get('/plans', landingController.getPlans);

// Banners
router.get('/banners', landingController.getBanners);

// Galería
router.get('/gallery', landingController.getGallery);

// ============================================
// RUTAS PROTEGIDAS (solo ADMIN)
// ============================================

// Contenido - CRUD admin
router.get('/content/admin', authenticate, requireAdmin, landingController.getLandingContentAdmin);
router.post('/content', authenticate, requireAdmin, landingController.createLandingContent);
router.put('/content/:id', authenticate, requireAdmin, landingController.updateLandingContent);
router.delete('/content/:id', authenticate, requireAdmin, landingController.deleteLandingContent);

// Testimonios - CRUD admin
router.get('/testimonials/admin', authenticate, requireAdmin, landingController.getTestimonialsAdmin);
router.post('/testimonials', authenticate, requireAdmin, landingController.createTestimonial);
router.put('/testimonials/:id', authenticate, requireAdmin, landingController.updateTestimonial);
router.delete('/testimonials/:id', authenticate, requireAdmin, landingController.deleteTestimonial);

// Planes - CRUD admin
router.get('/plans/admin', authenticate, requireAdmin, landingController.getPlansAdmin);
router.post('/plans', authenticate, requireAdmin, landingController.createPlan);
router.put('/plans/:id', authenticate, requireAdmin, landingController.updatePlan);
router.delete('/plans/:id', authenticate, requireAdmin, landingController.deletePlan);

// Banners - CRUD admin
router.get('/banners/admin', authenticate, requireAdmin, landingController.getBannersAdmin);
router.post('/banners', authenticate, requireAdmin, landingController.createBanner);
router.put('/banners/:id', authenticate, requireAdmin, landingController.updateBanner);
router.delete('/banners/:id', authenticate, requireAdmin, landingController.deleteBanner);

// Galería - CRUD admin
router.get('/gallery/admin', authenticate, requireAdmin, landingController.getGalleryAdmin);
router.post('/gallery', authenticate, requireAdmin, landingController.createGalleryImage);
router.put('/gallery/:id', authenticate, requireAdmin, landingController.updateGalleryImage);
router.delete('/gallery/:id', authenticate, requireAdmin, landingController.deleteGalleryImage);

export default router;
