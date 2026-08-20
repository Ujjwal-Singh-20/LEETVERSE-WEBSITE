import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { adminSessionLimiter } from '../middlewares/rateLimiter';
import { requireAdminAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { sessionLoginSchema } from '../schemas/auth.schema';

const router = Router();

// POST /api/admin/session — Verify Firebase ID token and return session
router.post(
  '/session',
  adminSessionLimiter,
  validateBody(sessionLoginSchema),
  authController.login
);

// GET /api/admin/me — Current admin details
router.get('/me', requireAdminAuth, authController.getMe);

export const authRoutes = router;
