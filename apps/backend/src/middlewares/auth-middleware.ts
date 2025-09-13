import { adminAuth } from "@repo/firebase/admin";
import { RequestHandler } from "express";
import prisma from "@repo/db";


const verifyToken: RequestHandler = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Fetch user from the database
        const user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
        });
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // we need to create a new user if the user is not found in the database

        req.user = user;
        next();
    } catch (error) {
        console.error('Error verifying ID token:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

export default verifyToken;