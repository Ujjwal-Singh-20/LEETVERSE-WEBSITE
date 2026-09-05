import { Router } from 'express';
import { publicController } from '../controllers/public.controller';
import { businessCardLimiter, generalPublicLimiter } from '../middlewares/rateLimiter';
import { validateParams } from '../middlewares/validate.middleware';
import { usernameParamSchema } from '../schemas/member.schema';
import { gallerySlugParamSchema } from '../schemas/gallery.schema';
import { projectSlugParamSchema } from '../schemas/project.schema';
import { adminReminderController } from '../controllers/admin.reminder.controller';

const router = Router();

// Live public business card: GET /api/u/:username and GET /u/:username
router.get(
  '/api/u/:username',
  businessCardLimiter,
  validateParams(usernameParamSchema),
  publicController.getBusinessCard
);
router.get(
  '/u/:username',
  businessCardLimiter,
  validateParams(usernameParamSchema),
  publicController.getBusinessCard
);

// Live gallery images popup: GET /api/gallery/:slug/images
router.get(
  '/api/gallery/:slug/images',
  generalPublicLimiter,
  validateParams(gallerySlugParamSchema),
  publicController.getGalleryImages
);

// Direct fallback listings
router.get('/api/projects', generalPublicLimiter, publicController.getProjectsListing);
router.get('/api/gallery', generalPublicLimiter, publicController.getGalleryListing);
router.get('/api/members', generalPublicLimiter, publicController.getMembersListing);
router.get('/api/reminders', generalPublicLimiter, adminReminderController.getPublicReminders);

// Server-rendered OpenGraph metadata for social crawlers
router.get(
  '/api/og/:username',
  validateParams(usernameParamSchema),
  publicController.getMemberOG
);
router.get(
  '/api/og/projects/:slug',
  validateParams(projectSlugParamSchema),
  publicController.getProjectOG
);

export const publicRoutes = router;
