import { initializeApp, ServiceAccount, getApps, cert } from "firebase-admin/app";
import { getAuth, DecodedIdToken } from "firebase-admin/auth";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });


const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const requiredAdminFields = ["projectId", "clientEmail", "privateKey"];
const missingAdminFields = requiredAdminFields.filter(
    (field) => !serviceAccount[field as keyof ServiceAccount]
);

if (missingAdminFields.length > 0) {
    console.error(`Missing Firebase Admin config: ${missingAdminFields.join(", ")}`);
    throw new Error("Firebase Admin configuration is incomplete");
}

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
    console.log("Firebase Admin initialized successfully");
}

export const adminAuth = getAuth();
export { DecodedIdToken };