import { asyncHandler } from "@/utils/async-handler";
import { ApiResponse } from "@/interface/api-response";
import { serializeBigInt } from "@/utils/serialize-bigint";
import getAuthToken from "@/helper/get-auth-token";
import { generateTokens, verifyRefreshToken } from "@/utils/generate-token";
import db from "@/services/db";
import type { Prisma } from "@repo/db";
import { adminLoginSchema } from "@repo/shared";
import status from "http-status";
import bcrypt from "bcryptjs";
import { ApiError } from "@/interface";

/**
 * Create a new user (Firebase authenticated)
 * This endpoint is called after Firebase authentication
 */
export const createNewUser = asyncHandler(async (req, res) => {
    const decodedToken = await getAuthToken(req);
    const { uid, email, name } = decodedToken;

    if (!uid) {
        throw new ApiError(status.BAD_REQUEST, 'Firebase UID is required');
    }

    // Check if user already exists
    let user = await db.user.findUnique({
        where: { firebaseUid: uid },
    });

    if (user) {
        return res.status(status.OK).json(
            new ApiResponse(status.OK, 'User already exists', serializeBigInt(user))
        );
    }

    // Fetch the 'FREE' subscription plan
    const freePlan = await db.subscriptionPlan.findFirst({
        where: { planType: 'FREE' }
    });

    if (!freePlan) {
        throw new ApiError(status.INTERNAL_SERVER_ERROR, 'Free plan not found. Please contact support.');
    }

    // Create new user with related data in a transaction
    const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const newUser = await tx.user.create({
            data: {
                firebaseUid: uid,
                email: email || '',
                name: name || null,
                planId: freePlan.id,
                // Create default folder with user
                folders: {
                    create: {
                        name: 'My Drive',
                    }
                },
                // Create subscription history
                subscriptions: {
                    create: {
                        planId: freePlan.id,
                        startDate: new Date(),
                    }
                }
            },
            include: {
                plan: true,
                folders: true,
                subscriptions: true
            }
        });

        return newUser;
    });

    return res.status(status.CREATED).json(
        new ApiResponse(status.CREATED, 'User created successfully', serializeBigInt(result))
    );
});

/**
 * Get current user profile (Firebase authenticated)
 */
export const getMe = asyncHandler(async (req, res) => {
    const decodedToken = await getAuthToken(req);
    const { uid } = decodedToken;

    const user = await db.user.findUnique({
        where: { firebaseUid: uid },
        include: {
            plan: true,
            subscriptions: {
                where: {
                    endDate: null // Active subscription
                },
                include: {
                    plan: true
                }
            }
        }
    });

    if (!user) {
        throw new ApiError(status.NOT_FOUND, "User not found");
    }

    return res.status(status.OK).json(
        new ApiResponse(status.OK, "User profile retrieved successfully", serializeBigInt(user))
    );
});

/**
 * Admin login with email and password
 */
export const loginAsAdmin = asyncHandler(async (req, res) => {
    const { email, password } = adminLoginSchema.parse(req.body);

    const admin = await db.admin.findUnique({
        where: { email }
    });

    if (!admin) {
        throw new ApiError(status.NOT_FOUND, "Admin not found");
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        throw new ApiError(status.UNAUTHORIZED, "Invalid credentials");
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(admin);

    // Exclude password from response
    const { password: _, ...adminData } = admin;

    const isProd = process.env.NODE_ENV === 'production';

    return res
        .cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60, // 1 hour
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax'
        })
        .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax'
        })
        .status(status.OK)
        .json(new ApiResponse(status.OK, "Admin logged in successfully", adminData));
});

/**
 * Logout (clear cookies)
 */
export const logout = asyncHandler(async (req, res) => {
    return res
        .clearCookie('accessToken')
        .clearCookie('refreshToken')
        .status(status.OK)
        .json(new ApiResponse(status.OK, "Logged out successfully"));
});

/**
 * Refresh access token using refresh token
 */
export const refreshTokens = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.headers.authorization?.replace('Bearer ', '');

    if (!refreshToken) {
        throw new ApiError(status.BAD_REQUEST, "Refresh token not provided");
    }

    const decodedToken = verifyRefreshToken(refreshToken);

    if (!decodedToken) {
        throw new ApiError(status.UNAUTHORIZED, "Invalid or expired refresh token");
    }

    if (!decodedToken.id) {
        throw new ApiError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const admin = await db.admin.findUnique({
        where: { id: decodedToken.id }
    });

    if (!admin) {
        throw new ApiError(status.NOT_FOUND, "Admin not found");
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(admin);

    const isProd = process.env.NODE_ENV === 'production';

    return res
        .cookie('accessToken', newAccessToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60, // 1 hour
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax'
        })
        .cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax'
        })
        .status(status.OK)
        .json(new ApiResponse(status.OK, "Tokens refreshed successfully"));
});

/**
 * Get admin profile
 */
export const getAdminProfile = asyncHandler(async (req, res) => {
    const admin = req.admin;

    if (!admin) {
        throw new ApiError(status.UNAUTHORIZED, "Not authenticated");
    }

    const adminData = await db.admin.findUnique({
        where: { id: admin.id },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!adminData) {
        throw new ApiError(status.NOT_FOUND, "Admin not found");
    }

    return res.status(status.OK).json(
        new ApiResponse(status.OK, "Admin profile retrieved successfully", adminData)
    );
});