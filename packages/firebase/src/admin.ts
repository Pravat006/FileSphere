import { initializeApp, ServiceAccount, getApps, cert } from "firebase-admin/app";
import { getAuth, DecodedIdToken } from "firebase-admin/auth";
import dotenv from 'dotenv';

dotenv.config();


const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}
console.log(serviceAccount)

// validate required configuration for admin authentication
const requiredAdminFields = ['projectId', 'clientEmail', 'privateKey'];
const missingAdminFields = requiredAdminFields.filter(field => !serviceAccount[field as keyof ServiceAccount]);

if (missingAdminFields.length > 0) {
    console.warn(`Missing Firebase Admin configuration fields: ${missingAdminFields.join(', ')}`);
    console.warn('Please check your .env file or environment variables');
}
if (!getApps().length || process.env.NODE_ENV === 'development') {
    try {
        initializeApp({
            credential: cert(serviceAccount)
        })
        console.log('Firebase Admin initialized successfully');

    } catch (error) {
        console.error('Firebase Admin initialization failed:', error);
    }
}

export const adminAuth = getAuth();

export { DecodedIdToken };