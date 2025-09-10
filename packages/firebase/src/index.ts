import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import dotenv from 'dotenv';

dotenv.config();

// --- Client-Side Firebase Configuration ---

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Validate required client configuration
const requiredClientFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingClientFields = requiredClientFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

if (missingClientFields.length > 0) {
  console.warn(`[Firebase Client] Missing config fields: ${missingClientFields.join(', ')}`);
}

// Initialize Firebase Client App
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);


export * from './auth';

export { adminAuth } from './adminConf';
