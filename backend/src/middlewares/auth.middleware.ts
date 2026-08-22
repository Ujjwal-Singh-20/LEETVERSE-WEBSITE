import { Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { ERROR_CODES } from '../constants/errorCodes';
import { AuthenticatedRequest, AdminDoc } from '../types';

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

    const decodedToken = await auth.verifyIdToken(token);

    if (!decodedToken.email) {
      res.status(403).json({
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: 'Token has no verified email.',
        },
      });
      return;
    }

    const adminsSnap = await db
      .collection(COLLECTIONS.ADMINS)
      .where('email', '==', decodedToken.email)
      .limit(1)
      .get();

    if (adminsSnap.empty) {
      res.status(403).json({
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: 'You are not authorized as an admin.',
        },
      });
      return;
    }

    const adminDoc = adminsSnap.docs[0];
    const adminData = adminDoc.data() as AdminDoc;

    if (!adminData.active) {
      res.status(403).json({
        error: {
          code: ERROR_CODES.ADMIN_INACTIVE,
          message: 'Your admin account has been deactivated.',
        },
      });
      return;
    }

    req.admin = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: adminData.name,
      docId: adminDoc.id,
    };

    next();
  } catch (error: any) {
    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'Token has expired. Please sign in again.',
        },
      });
      return;
    }
    if (error.code === 'auth/id-token-revoked') {
      res.status(401).json({
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'Token has been revoked. Please sign in again.',
        },
      });
      return;
    }
    next(error);
  }
};
