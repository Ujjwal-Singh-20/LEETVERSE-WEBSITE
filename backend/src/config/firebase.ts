import * as admin from 'firebase-admin';
import { ENV } from './env';

let app: admin.app.App;

/**
 * Firebase Admin SDK Initialization
 * Supports:
 * 1. JSON string via FIREBASE_SERVICE_ACCOUNT_KEY
 * 2. Split credentials via FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * 3. Graceful fallback for local development setup
 */
const initializeFirebase = (): admin.app.App => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // 1. Check for complete JSON string
  if (ENV.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(ENV.FIREBASE_SERVICE_ACCOUNT_KEY);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (err) {
      console.warn('⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON string.');
    }
  }

  // 2. Check for split credentials
  if (ENV.FIREBASE_PROJECT_ID && ENV.FIREBASE_CLIENT_EMAIL && ENV.FIREBASE_PRIVATE_KEY) {
    const privateKey = ENV.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: ENV.FIREBASE_PROJECT_ID,
        clientEmail: ENV.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  }

  // 3. Fallback for local initialization
  console.warn('⚠️ No Firebase Admin credentials provided in .env. Initializing with dev project id.');
  return admin.initializeApp({
    projectId: ENV.FIREBASE_PROJECT_ID || 'leetverse-dev',
  });
};

app = initializeFirebase();

export const db = admin.firestore(app);
export const auth = admin.auth(app);
export { admin };
