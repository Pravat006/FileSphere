import { adminAuth } from "@repo/firebase/admin";
import { Request } from "express";

// Helper function (not RequestHandler)
const getAuthToken = async (req: Request) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
        throw new Error('No authorization token provided');
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying ID token:', error);
        throw new Error('Invalid or expired token');
    }
};

export default getAuthToken;