import { adminAuth } from "@repo/firebase/admin";
import { NextFunction, Request, Response } from "express";
import { logger } from "@/config/logger";
import db from "@/services/db";
import { IUser } from "@repo/shared";
import { ApiError } from "@/interface";
import status from "http-status";
import { redis } from "@/services/redis-service";

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const cachedUser = await redis.get<any>(`user:${uid}`);

        if (cachedUser) {
            const user = cachedUser;
            // Convert storageUsed back to BigInt
            if (user.storageUsed) {
                user.storageUsed = BigInt(user.storageUsed);
            }
            req.user = user;
            return next();
        }

        const user = await db.user.findUnique({
            where: { firebaseUid: uid },
            include: {
                plan: true
            }
        });

        if (!user) {
            return next(
                new ApiError(status.UNAUTHORIZED, "User not found")
            )
        }
        // logger.info("User found:", user);

        const userObj: Omit<IUser, 'firebaseUid' | 'createdAt' | 'updatedAt'> = {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            storageUsed: user.storageUsed,
        }

        // Cache the user object for 1 hour (3600 seconds)
        await redis.set(`user:${uid}`, userObj, 3600);

        req.user = userObj;
        next();
    } catch (error) {
        logger.error('Error verifying ID token:', error);
        next(new ApiError(status.UNAUTHORIZED, "Unauthorized access", "USER AUTH MIDDLEWARE"));
    }
}

export default verifyToken;