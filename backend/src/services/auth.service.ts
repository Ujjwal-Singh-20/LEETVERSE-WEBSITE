import { auth, db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { ERROR_CODES } from '../constants/errorCodes';
import { AppError } from '../middlewares/error.middleware';
import { AuthenticatedAdmin, AdminDoc } from '../types';

export class AuthService {
  async verifyAdminSession(idToken: string): Promise<AuthenticatedAdmin> {
    const decodedToken = await auth.verifyIdToken(idToken);

    if (!decodedToken.email) {
      throw new AppError(403, ERROR_CODES.FORBIDDEN, 'Token has no verified email.');
    }

    const adminsSnap = await db
      .collection(COLLECTIONS.ADMINS)
      .where('email', '==', decodedToken.email)
      .limit(1)
      .get();

    if (adminsSnap.empty) {
      throw new AppError(403, ERROR_CODES.FORBIDDEN, 'You are not authorized as an admin.');
    }

    const adminDoc = adminsSnap.docs[0];
    const adminData = adminDoc.data() as AdminDoc;

    if (!adminData.active) {
      throw new AppError(403, ERROR_CODES.ADMIN_INACTIVE, 'Your admin account has been deactivated.');
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: adminData.name,
      docId: adminDoc.id,
    };
  }
}

export const authService = new AuthService();
