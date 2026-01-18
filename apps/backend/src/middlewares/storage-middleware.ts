// check if the user has enough storage to upload the files
// get the current user
// get the user's current subscription plan details
// get the user
// check the user's current plan and storage limit
// check if the user have enough storage to upload files
// all user to upload the files size worth under the  available storage

import { ApiError } from "@/interface";
import db from "@/services/db";
import type { NextFunction, Request, Response } from "express";
import status from "http-status";

const storageMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            throw new ApiError(status.UNAUTHORIZED, "User not found");
        }

        if (!user.plan) {
            throw new ApiError(status.NOT_FOUND, "User subscription plan not found");
        }

        const freshUser = await db.user.findUnique({
            where: { id: user.id },
            select: {
                storageUsed: true,
                plan: true
            }
        });

        if (!freshUser) {
            throw new ApiError(status.UNAUTHORIZED, "User not found");
        }

        if (!freshUser.plan) {
            throw new ApiError(status.NOT_FOUND, "User subscription plan not found");
        }

        // Ensure proper bigint conversion
        const storageUsed = freshUser.storageUsed ? BigInt(freshUser.storageUsed.toString()) : BigInt(0);
        const userStorageLimit = BigInt(freshUser.plan.storageLimit.toString());

        if (storageUsed >= userStorageLimit) {
            return res.status(403).json({
                success: false,
                message: "Insufficient storage space. Please upgrade your plan or delete some files.",
                storageUsed: storageUsed.toString(),
                storageLimit: userStorageLimit.toString()
            });
        }

        // Add available storage to request object for use in controllers
        const availableStorage = userStorageLimit - storageUsed;
        req.availableStorage = availableStorage;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            return next(error);
        }
        next(new ApiError(status.INTERNAL_SERVER_ERROR, "Error checking storage limits", "STORAGE MIDDLEWARE"));
    }
};

export { storageMiddleware };
