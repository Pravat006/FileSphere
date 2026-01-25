import { asyncHandler } from "@/utils/async-handler";
import { ApiResponse } from "@/interface/api-response";
import userService from "./user-service";
import status from "http-status";
import { serializeBigInt } from "@/utils/serialize-bigint";
import { ApiError } from "@/interface";

/**
 * Get user storage statistics
 */
export const getUserStats = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(status.UNAUTHORIZED, "User not authenticated");

    const stats = await userService.getUserStats(userId);
    return res.status(status.OK).json(
        new ApiResponse(status.OK, "User statistics retrieved successfully", serializeBigInt(stats))
    );
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(status.UNAUTHORIZED, "User not authenticated");

    const { name } = req.body;
    if (!name) throw new ApiError(status.BAD_REQUEST, "Name is required");

    const updatedUser = await userService.updateProfile(userId, { name });
    return res.status(status.OK).json(
        new ApiResponse(status.OK, "Profile updated successfully", serializeBigInt(updatedUser))
    );
});

/**
 * Delete user account
 */
export const deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const firebaseUid = req.user?.firebaseUid;

    if (!userId || !firebaseUid) throw new ApiError(status.UNAUTHORIZED, "User not authenticated");

    await userService.deleteAccount(userId, firebaseUid);

    return res.status(status.OK).json(
        new ApiResponse(status.OK, "Account deleted successfully", null)
    );
});
