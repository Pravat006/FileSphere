import db from "@/services/db";
import { CreateFolderRequest } from "@repo/shared";
import { ApiError } from "@/interface";
import status from "http-status";

class FolderService {
    /**
     * Create a new folder
     */
    async createFolder(userId: string, data: CreateFolderRequest) {
        try {
            const folder = await db.folder.create({
                data: {
                    name: data.name,
                    ownerId: userId,
                    parentFolderId: data.parentFolderId || null
                }
            });
            return folder;
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to create folder", String(error));
        }
    }

    /**
     * Get folders with pagination and search
     */
    async getFolders(userId: string, options: {
        parentFolderId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const {
            parentFolderId,
            search,
            page = 1,
            limit = 20
        } = options;
        const skip = (page - 1) * limit;

        const where = {
            ownerId: userId,
            parentFolderId: parentFolderId || null,
            name: search ? { contains: search, mode: 'insensitive' as const } : undefined
        };

        try {
            const [folders, total] = await db.$transaction([
                db.folder.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                db.folder.count({ where })
            ]);

            return {
                folders,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to fetch folders", String(error));
        }
    }

    /**
     * Get folder by ID with its files
     */
    async getFolderById(userId: string, folderId: string) {
        try {
            const folder = await db.folder.findUnique({
                where: {
                    id: folderId,
                    ownerId: userId
                },
                include: {
                    files: true,
                    subFolders: true
                }
            });

            if (!folder) {
                throw new ApiError(status.NOT_FOUND, "Folder not found");
            }

            return folder;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to fetch folder", String(error));
        }
    }

    /**
     * Update folder name
     */
    async updateFolder(userId: string, folderId: string, name: string) {
        try {
            // Check if folder exists
            const existingFolder = await db.folder.findUnique({
                where: { id: folderId, ownerId: userId }
            });

            if (!existingFolder) {
                throw new ApiError(status.NOT_FOUND, "Folder not found");
            }

            const folder = await db.folder.update({
                where: {
                    id: folderId
                },
                data: {
                    name
                }
            });
            return folder;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to update folder", String(error));
        }
    }

    /**
     * Delete folder
     */
    async deleteFolder(userId: string, folderId: string) {
        try {
            // Check if folder exists
            const existingFolder = await db.folder.findUnique({
                where: { id: folderId, ownerId: userId }
            });

            if (!existingFolder) {
                throw new ApiError(status.NOT_FOUND, "Folder not found");
            }

            // Note: Cascade delete is handled by database schema usually, 
            // but if manual cleanup is needed for files in S3, it should be done here.
            // Assuming database takes care of relationships for now or files are soft deleted separately.

            await db.folder.delete({
                where: {
                    id: folderId
                }
            });
            return true;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to delete folder", String(error));
        }
    }
}

export default new FolderService();
