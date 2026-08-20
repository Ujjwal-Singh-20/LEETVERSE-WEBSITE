import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { ERROR_CODES } from '../constants/errorCodes';
import { AuthenticatedRequest } from '../types';

const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: {
          code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
          message: options.message,
        },
      });
    },
  });
};

// 1. Live business card read: GET /u/:username (~25 req/min per IP)
export const businessCardLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 25,
  message: 'Too many requests for member profile. Please wait a minute and try again.',
});

// 2. Admin session login: POST /api/admin/session (~8 req/min per IP)
export const adminSessionLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 8,
  message: 'Too many login attempts. Please wait a minute before trying again.',
});

// 3. General public GETs (~60 req/min per IP)
export const generalPublicLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Rate limit exceeded. Please try again in a few moments.',
});

// 4. Admin-authenticated routes (~100 req/min keyed by admin UID or IP)
export const adminAuthLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Admin rate limit exceeded. Please slow down your requests.',
  keyGenerator: (req: Request) => {
    const authReq = req as AuthenticatedRequest;
    return authReq.admin?.uid || req.ip || 'unknown-ip';
  },
});
