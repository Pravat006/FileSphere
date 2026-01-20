// check if the user has enough storage to upload the files
// get the current user
// get the user's current subscription plan details
// get the user
// check the user's current plan and storage limit
// check if the user have enough storage to upload files
// all user to upload the files size worth under the  available storage

import { ApiError } from "@/interface";
import type { NextFunction, Request, Response } from "express";
import status from "http-status";

const uploadQuotaMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            throw new ApiError(status.UNAUTHORIZED, "User not found");
        }

        // Use the cached user data from Redis (populated in userAuthMiddleware)
        if (!user.plan) {
            throw new ApiError(status.NOT_FOUND, "User subscription plan not found");
        }

        // Ensure proper bigint conversion (req.user.storageUsed is already a BigInt from userAuthMiddleware)
        const storageUsed = BigInt(user.storageUsed.toString());
        const userStorageLimit = BigInt(user.plan.storageLimit.toString());

        // Get incoming file size from body (for initiate upload) or header (fallback)
        const incomingSize = req.body.size ? BigInt(req.body.size) : BigInt(0);

        if (storageUsed + incomingSize > userStorageLimit) {
            return res.status(status.BAD_REQUEST).json({
                success: false,
                message: incomingSize > 0
                    ? "Insufficient storage space for this file."
                    : "Insufficient storage space. Please upgrade your plan.",
                storageUsed: storageUsed.toString(),
                storageLimit: userStorageLimit.toString(),
                requiredSpace: incomingSize.toString(),
                availableSpace: (userStorageLimit - storageUsed).toString()
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

export { uploadQuotaMiddleware };
