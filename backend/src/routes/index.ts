import { Router } from 'express';
import { publicRoutes } from './public.routes';
import { authRoutes } from './auth.routes';
import { adminRoutes } from './admin.routes';

const router = Router();

// 1. Public & SEO routes (includes /u/:username and /api/...)
router.use('/', publicRoutes);

// 2. Admin Authentication (/api/admin/session, /api/admin/me)
router.use('/api/admin', authRoutes);

// 3. Admin Protected Operations (/api/admin/members, /api/admin/projects, /api/admin/gallery, /api/admin/upload)
router.use('/api/admin', adminRoutes);

export const appRouter = router;
