import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  /**
   * POST /api/admin/session — Verify ID token and return admin session profile
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken } = req.body;
      const admin = await authService.verifyAdminSession(idToken);
      res.status(200).json({
        message: 'Authentication successful',
        admin,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/me — Current admin session info
   */
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        admin: req.admin,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
