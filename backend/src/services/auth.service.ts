import { auth, db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { ERROR_CODES } from '../constants/errorCodes';
import { AppError } from '../middlewares/error.middleware';
import { AuthenticatedAdmin, AdminDoc } from '../types';

export class AuthService {
  async verifyAdminSession(idToken: string): Promise<AuthenticatedAdmin> {
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (err: any) {
      if (err.code === 'auth/id-token-expired') {
        throw new AppError(401, ERROR_CODES.INVALID_TOKEN, 'Token has expired. Please sign in again.');
      }
      throw new AppError(401, ERROR_CODES.INVALID_TOKEN, 'Invalid or malformed authorization token.');
    }

    if (!decodedToken.email) {
      throw new AppError(403, ERROR_CODES.FORBIDDEN, 'Token has no verified email.');
    }

    const userEmail = decodedToken.email.trim();
    console.log(`🔐 Admin login verification attempt for email: "${userEmail}"`);

    // 1. Direct match
    let adminsSnap = await db
      .collection(COLLECTIONS.ADMINS)
      .where('email', '==', userEmail)
      .limit(1)
      .get();

    let adminDoc = adminsSnap.empty ? null : adminsSnap.docs[0];

    // 2. Case-insensitive fallback match
    if (!adminDoc) {
      const allAdminsSnap = await db.collection(COLLECTIONS.ADMINS).get();
      const targetLower = userEmail.toLowerCase();
      adminDoc = allAdminsSnap.docs.find((d) => (d.data().email || '').toLowerCase().trim() === targetLower) || null;
    }

    if (!adminDoc) {
      console.warn(`⛔ Access Denied: Email "${userEmail}" was not found in admins collection.`);
      throw new AppError(403, ERROR_CODES.FORBIDDEN, `You are not authorized as an admin (${userEmail}).`);
    }

    const adminData = adminDoc.data() as AdminDoc;

    if (!adminData.active) {
      console.warn(`⛔ Inactive Admin: Email "${userEmail}" is marked active=false.`);
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
