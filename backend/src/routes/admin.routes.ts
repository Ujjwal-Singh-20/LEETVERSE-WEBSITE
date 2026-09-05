import { Router } from 'express';
import { z } from 'zod';
import { requireAdminAuth } from '../middlewares/auth.middleware';
import { adminAuthLimiter } from '../middlewares/rateLimiter';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import { adminMemberController } from '../controllers/admin.member.controller';
import { adminProjectController } from '../controllers/admin.project.controller';
import { adminGalleryController } from '../controllers/admin.gallery.controller';
import { uploadController } from '../controllers/upload.controller';
import { uploadMultipleImages, uploadSingleImage } from '../middlewares/upload.middleware';
import {
  checkUsernameQuerySchema,
  createMemberSchema,
  memberParamsSchema,
  updateMemberFieldSchema,
} from '../schemas/member.schema';
import {
  createProjectSchema,
  projectSlugParamSchema,
  updateProjectSchema,
} from '../schemas/project.schema';
import {
  createGalleryEventSchema,
  gallerySlugParamSchema,
  updateGalleryEventSchema,
} from '../schemas/gallery.schema';
import { adminReminderController } from '../controllers/admin.reminder.controller';
import { adminCacheController } from '../controllers/admin.cache.controller';
import { createReminderSchema, reminderParamSchema } from '../schemas/reminder.schema';

const router = Router();

// Protect all admin endpoints with auth & admin rate limit
router.use(requireAdminAuth);
router.use(adminAuthLimiter);

const adminCreateMemberSchema = createMemberSchema.extend({
  domain: z.string().trim().min(1, 'Domain slug is required'),
});

/* ----------------- Member Management ----------------- */
router.get('/members/tree', adminMemberController.getMemberTree);
router.get('/usernames/check', validateQuery(checkUsernameQuerySchema), adminMemberController.checkUsername);
router.post('/members', validateBody(adminCreateMemberSchema), adminMemberController.createMember);
router.patch(
  '/members/:domain/:docId',
  validateParams(memberParamsSchema),
  validateBody(updateMemberFieldSchema),
  adminMemberController.updateMemberField
);
router.delete(
  '/members/:domain/:docId',
  validateParams(memberParamsSchema),
  adminMemberController.deleteMember
);

/* ----------------- Project Management ----------------- */
router.get('/projects', adminProjectController.getProjects);
router.get('/projects/:slug', validateParams(projectSlugParamSchema), adminProjectController.getProject);
router.post('/projects', validateBody(createProjectSchema), adminProjectController.createProject);
router.patch(
  '/projects/:slug',
  validateParams(projectSlugParamSchema),
  validateBody(updateProjectSchema),
  adminProjectController.updateProject
);
router.delete(
  '/projects/:slug',
  validateParams(projectSlugParamSchema),
  adminProjectController.deleteProject
);

/* ----------------- Gallery Management ----------------- */
router.get('/gallery', adminGalleryController.getGalleryEvents);
router.get('/gallery/:slug', validateParams(gallerySlugParamSchema), adminGalleryController.getGalleryEvent);
router.post('/gallery', validateBody(createGalleryEventSchema), adminGalleryController.createGalleryEvent);
router.patch(
  '/gallery/:slug',
  validateParams(gallerySlugParamSchema),
  validateBody(updateGalleryEventSchema),
  adminGalleryController.updateGalleryEvent
);
router.delete(
  '/gallery/:slug',
  validateParams(gallerySlugParamSchema),
  adminGalleryController.deleteGalleryEvent
);

/* ----------------- Image Uploads ----------------- */
router.post('/upload/single', uploadSingleImage, uploadController.uploadSingle);
router.post('/upload/multiple', uploadMultipleImages, uploadController.uploadMultiple);

/* ----------------- Reminders Management ----------------- */
router.get('/reminders', adminReminderController.getReminders);
router.post('/reminders', validateBody(createReminderSchema), adminReminderController.createReminder);
router.delete('/reminders/:docId', validateParams(reminderParamSchema), adminReminderController.deleteReminder);

/* ----------------- Operational Cache Refresh ----------------- */
router.post('/cache/refresh', adminCacheController.refreshCache);

export const adminRoutes = router;
