import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { ENV } from './env';

let app: admin.app.App;

/**
 * Firebase Admin SDK Initialization
 * Supports:
 * 1. Direct serviceAccountKey.json file (in backend/ or project root)
 * 2. File path or JSON string via FIREBASE_SERVICE_ACCOUNT_KEY
 * 3. Split credentials via FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * 4. Graceful fallback for local development setup
 */
const initializeFirebase = (): admin.app.App => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // 1. Check for serviceAccountKey.json in backend/ or root
  const possibleKeyFiles = [
    path.join(process.cwd(), 'serviceAccountKey.json'),
    path.join(process.cwd(), '..', 'serviceAccountKey.json'),
    path.join(__dirname, '..', '..', 'serviceAccountKey.json'),
    path.join(__dirname, '..', '..', '..', 'serviceAccountKey.json'),
  ];

  for (const keyPath of possibleKeyFiles) {
    if (fs.existsSync(keyPath)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        console.log(`🔑 Initialized Firebase Admin from local key file: ${keyPath}`);
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (err) {
        console.warn(`⚠️ Found ${keyPath} but failed to parse JSON.`);
      }
    }
  }

  // 2. Check for FIREBASE_SERVICE_ACCOUNT_KEY (file path or JSON string)
  if (ENV.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const rawVal = ENV.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
    if (rawVal.startsWith('{')) {
      try {
        const serviceAccount = JSON.parse(rawVal);
        console.log('🔑 Initialized Firebase Admin from FIREBASE_SERVICE_ACCOUNT_KEY JSON string.');
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (err) {
        console.warn('⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON string.');
      }
    } else if (fs.existsSync(rawVal)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(rawVal, 'utf8'));
        console.log(`🔑 Initialized Firebase Admin from path: ${rawVal}`);
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (err) {
        console.warn(`⚠️ Failed to read service account key at path: ${rawVal}`);
      }
    }
  }

  // 3. Check for split credentials in .env
  if (ENV.FIREBASE_PROJECT_ID && ENV.FIREBASE_CLIENT_EMAIL && ENV.FIREBASE_PRIVATE_KEY) {
    const privateKey = ENV.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    console.log(`🔑 Initialized Firebase Admin for project: ${ENV.FIREBASE_PROJECT_ID}`);
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: ENV.FIREBASE_PROJECT_ID,
        clientEmail: ENV.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  }

  // 4. Fallback for local initialization
  console.warn('⚠️ No Firebase Admin credentials provided in .env or serviceAccountKey.json. Initializing with dev project id.');
  return admin.initializeApp({
    projectId: ENV.FIREBASE_PROJECT_ID || 'leetverse-dev',
  });
};

app = initializeFirebase();

export const db = admin.firestore(app);
export const auth = admin.auth(app);
export { admin };
