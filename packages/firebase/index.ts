import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import dotenv from 'dotenv';
dotenv.config();

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY, // Fixed: was 'apikey'
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Validate required configuration for authentication
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId']; // Fixed: was 'apikey'
const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

if (missingFields.length > 0) {
  console.warn(`Missing Firebase configuration fields: ${missingFields.join(', ')}`);
  console.warn('Please check your .env file or environment variables');
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase Authentication initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Export Firebase Authentication
export const auth = getAuth(app);

// Export the app instance
export default app;
