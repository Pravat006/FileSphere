import { adminAuth } from "@repo/firebase/admin";
import { Request } from "express";
import { ApiError } from "@/interface";
import status from "http-status";

/**
 * Helper function to extract and verify Firebase Auth token from headers
 * @param req Express Request object
 * @returns Decoded Firebase token
 * @throws ApiError if token is missing, invalid, or expired
 */
const getAuthToken = async (req: Request) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
        throw new ApiError(status.UNAUTHORIZED, 'No authorization token provided');
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        return decodedToken;
    } catch (error: any) {
        console.error('Error verifying ID token:', error);
        throw new ApiError(status.UNAUTHORIZED, 'Invalid or expired token');
    }
};

export default getAuthToken;