import { Response, NextFunction } from 'express';
import { ERROR_CODES } from '../constants/errorCodes';
import { AuthenticatedRequest } from '../types';

/**
 * Admin Authentication Middleware
 * Flow per docs:
 * 1. Extract Bearer token from req.headers.authorization
 * 2. Verify Firebase ID token via Firebase Admin Auth
 * 3. Query Firestore 'admins' collection to verify email is an active admin
 * 4. Attach admin details { uid, email, name, docId } to req.admin
 */
export const requireAdminAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Authorization token required. Please sign in.',
        },
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1]?.trim();
    if (!token) {
      res.status(401).json({
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'Malformed authorization header.',
        },
      });
      return;
    }

    // TODO: Step 1 - Call auth.verifyIdToken(token) using Firebase Admin
    // TODO: Step 2 - Query db.collection(COLLECTIONS.ADMINS).where('email', '==', decodedToken.email).limit(1).get()
    // TODO: Step 3 - Check if admin doc exists and active === true
    // TODO: Step 4 - Attach to req.admin = { uid, email, name, docId }
    // TODO: Step 5 - Call next()

    // Temporary placeholder for development:
    req.admin = {
      uid: 'dev-admin-uid',
      email: 'admin@leetverse.com',
      name: 'Dev Admin',
    };

    next();
  } catch (error: any) {
    next(error);
  }
};
