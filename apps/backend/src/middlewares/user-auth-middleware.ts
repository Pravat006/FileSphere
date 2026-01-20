import { adminAuth } from "@repo/firebase/admin";
import { NextFunction, Request, Response } from "express";
import { logger } from "@/config/logger";
import db from "@/services/db";
import { IUser } from "@repo/shared";
import { ApiError } from "@/interface";
import status from "http-status";
import { redis } from "@/services/redis-service";
import { serializeBigInt } from "@/utils/serialize-bigint";

const userAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];

    if (!idToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;

        let cachedUser;
        try {
            cachedUser = await redis.get<any>(`user:${uid}`);
        } catch (error) {
            logger.error('Redis get error:', error);
        }

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

        const userObj: Omit<IUser, 'createdAt' | 'updatedAt'> = {
            id: user.id,
            firebaseUid: user.firebaseUid,
            name: user.name,
            email: user.email,
            plan: user.plan,
            storageUsed: user.storageUsed,
        }

        // Cache the user object for 1 hour (3600 seconds)
        // Serialize BigInt before caching
        try {
            await redis.set(`user:${uid}`, serializeBigInt(userObj), 3600);
        } catch (redisError) {
            logger.error('Redis cache error:', redisError);
        }

        req.user = userObj;
        next();
    } catch (error) {
        logger.error('Error verifying ID token:', error);
        next(new ApiError(status.UNAUTHORIZED, "Unauthorized access", "USER AUTH MIDDLEWARE"));
    }
}

export default userAuthMiddleware;