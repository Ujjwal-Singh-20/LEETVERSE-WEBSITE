import { AuthenticatedAdmin } from '../types';

export class AuthService {
  /**
   * Validates Firebase ID token against the admins collection
   * Flow per docs:
   * 1. Verify ID token with Firebase Admin Auth (auth.verifyIdToken)
   * 2. Extract Google-verified email
   * 3. Query admins collection where email == verifiedEmail
   * 4. Check active == true
   * 5. Return AuthenticatedAdmin object
   */
  async verifyAdminSession(idToken: string): Promise<AuthenticatedAdmin> {
    // TODO: Step 1 - Verify idToken using auth.verifyIdToken(idToken)
    // TODO: Step 2 - Extract verified email from decoded token
    // TODO: Step 3 - Query db.collection('admins').where('email', '==', email).get()
    // TODO: Step 4 - Throw 403 AppError(FORBIDDEN) if not in admins collection or active === false
    // TODO: Step 5 - Return { uid, email, name, docId }
    throw new Error(`[TODO] verifyAdminSession not implemented for idToken: ${idToken.substring(0, 10)}...`);
  }
}

export const authService = new AuthService();
