import { Response, NextFunction } from 'express';
import { generateAllCaches } from '../scripts/generateCache';
import { AuthenticatedRequest } from '../types';

export class AdminCacheController {
  /**
   * POST /api/admin/cache/refresh
   * Triggers generation of all static cache blobs (members, projects, gallery, reminders)
   */
  async refreshCache(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await generateAllCaches();
      res.status(200).json({
        message: 'Cache refresh job executed successfully.',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminCacheController = new AdminCacheController();
