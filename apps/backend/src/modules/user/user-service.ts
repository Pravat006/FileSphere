import db from "@/services/db";
import { ApiError } from "@/interface";
import status from "http-status";
import { redis } from "@/services/redis-service";

class UserService {
    /**
     * Get user profile with statistics
     */
    async getUserStats(userId: string) {
        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                plan: {
                    select: {
                        id: true,
                        planType: true,
                        storageLimit: true,
                        price: true
                    }
                },
                _count: {
                    select: {
                        files: {
                            where: {
                                uploadStatus: "COMPLETED",
                            }
                        },
                        folders: true,
                        subscriptions: true
                    }
                }
            }
        });

        if (!user) {
            throw new ApiError(status.NOT_FOUND, "User not found");
        }

        // Get file type distribution
        const fileStats = await db.file.groupBy({
            by: ['fileType'],
            where: { ownerId: userId, isInTrash: false },
            _sum: {
                size: true
            },
            _count: {
                id: true
            }
        });

        return {
            storageUsed: user.storageUsed,
            storageLimit: user.plan?.storageLimit || 0n,
            fileCount: user._count.files,
            folderCount: user._count.folders,
            fileTypeDistribution: fileStats.map(stat => ({
                type: stat.fileType,
                count: stat._count.id,
                size: stat._sum.size || 0n
            })),
            currentPlan: user.plan
        };
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, data: { name?: string }) {
        const user = await db.user.update({
            where: { id: userId },
            data: {
                name: data.name
            },
            include: {
                plan: {
                    select: {
                        id: true,
                        planType: true,
                        storageLimit: true,
                        price: true
                    }
                }
            }
        });

        // Invalidate cache
        await redis.delete(`user:${user.firebaseUid}`);

        return user;
    }

    /**
     * Delete user account and all associated data
     * Note: In a real app, you might want to trigger an asynchronous cleanup for S3 files.
     */
    async deleteAccount(userId: string, firebaseUid: string) {
        // We use a transaction to ensure everything is deleted correctly in DB
        // S3 cleanup should ideally be handled by a background worker or object lifecycle rules
        await db.$transaction([
            db.file.deleteMany({ where: { ownerId: userId } }),
            db.folder.deleteMany({ where: { ownerId: userId } }),
            db.subscriptionHistory.deleteMany({ where: { userId: userId } }),
            db.transaction.deleteMany({ where: { ownerId: userId } }),
            db.user.delete({ where: { id: userId } })
        ]);

        // Invalidate cache
        await redis.delete(`user:${firebaseUid}`);

        return true;
    }
}

export default new UserService();
