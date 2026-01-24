import { deleteObject } from "@/config/s3-config";
import db from "@/services/db";
import { ApiError } from "@/interface";
import status from "http-status";
import { redis } from "@/services";

class StorageService {
    /**
     * Checks if a storage key is used by any file record other than the specified IDs.
     */
    async isObjectReferenced(storageKey: string, excludingIds: string[] = []): Promise<boolean> {
        const count = await db.file.count({
            where: {
                storageKey,
                id: { notIn: excludingIds }
            }
        });
        return count > 0;
    }

    /**
     * Safely deletes a file record and its cloud object (only if no other records use it).
     */
    async safePermanentDelete(fileId: string, userId: string) {
        const file = await db.file.findFirst({
            where: { id: fileId, ownerId: userId },
            select: {
                id: true,
                storageKey: true,
                size: true,
                isInTrash: true,
                uploadStatus: true
            }
        });

        if (!file) {
            throw new ApiError(status.NOT_FOUND, "File not found");
        }

        if (!file.isInTrash) {
            throw new ApiError(status.BAD_REQUEST, "Move file to trash first");
        }

        return await db.$transaction(async (tx) => {
            // Check references before deleting from cloud
            const isReferenced = await this.isObjectReferenced(file.storageKey, [file.id]);

            if (!isReferenced) {
                await deleteObject(file.storageKey);
            }

            // Delete DB record
            await tx.file.delete({ where: { id: fileId } });

            // Update user storage quota
            if (file.uploadStatus === "COMPLETED") {
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: { storageUsed: { decrement: file.size } },
                    select: { firebaseUid: true }
                });

                // Invalidate cache
                await redis.delete(`user:${updatedUser.firebaseUid}`);
            }

            return { deletedFromCloud: !isReferenced };
        });
    }

    /**
     * Safely empties trash, checking references for each file before cloud deletion.
     */
    async safeEmptyTrash(userId: string) {
        const trashedFiles = await db.file.findMany({
            where: { ownerId: userId, isInTrash: true },
            select: { id: true, storageKey: true, size: true, uploadStatus: true }
        });

        if (trashedFiles.length === 0) {
            throw new ApiError(status.NOT_FOUND, "Nothing to empty in trash");
        }

        const trashedFileIds = trashedFiles.map(f => f.id);

        // Performance optimization: get unique keys
        const uniqueKeys = [...new Set(trashedFiles.map(f => f.storageKey))];

        // Determine which cloud objects can be safely deleted
        const keysToDelete: string[] = [];
        for (const key of uniqueKeys) {
            const isReferenced = await this.isObjectReferenced(key, trashedFileIds);
            if (!isReferenced) {
                keysToDelete.push(key);
            }
        }

        return await db.$transaction(async (tx) => {
            // Delete cloud objects
            await Promise.all(keysToDelete.map(key => deleteObject(key)));

            // Delete DB records
            await tx.file.deleteMany({
                where: { id: { in: trashedFileIds } }
            });

            // Update storage quota
            const totalSize = trashedFiles
                .filter(f => f.uploadStatus === "COMPLETED")
                .reduce((acc, f) => acc + BigInt(f.size), BigInt(0));

            if (totalSize > 0n) {
                const updatedUser = await tx.user.update({
                    where: { id: userId },
                    data: { storageUsed: { decrement: totalSize } },
                    select: { firebaseUid: true }
                });

                // Invalidate cache
                await redis.delete(`user:${updatedUser.firebaseUid}`);
            }

            return {
                filesDeleted: trashedFileIds.length,
                cloudObjectsDeleted: keysToDelete.length
            };
        });
    }
}

export default new StorageService();
