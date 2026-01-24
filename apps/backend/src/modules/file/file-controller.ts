import fileService from "./file-service";
import storageService from "./storage-service";
import { redis } from "@/services/redis-service";
import { ApiError, ApiResponse } from "@/interface";
import status from "http-status";
import db from "@/services/db";
import { getObjectUrl } from "@/config/s3-config";
import { asyncHandler } from "@/utils/async-handler";

/**
 * GET Files (Combined controller for List, Search, Filter, Sort, Paginate)
 * This replaces simple getUserFiles
 */
export const getFilesController = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;

    const query = {
        folderId: req.query.folderId as string,
        fileType: req.query.fileType as any,
        search: req.query.search as string,
        sortBy: (req.query.sortBy as string) || 'createdAt',
        order: (req.query.order as 'asc' | 'desc') || 'desc',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        isInTrash: req.query.isInTrash === 'true'
    };
    const result = await fileService.getFiles(userId, query);
    res.status(status.OK).json(new ApiResponse(status.OK, "Files retrieved", result));
});

/**
 * Global Search for Files and Folders
 */
export const globalSearchController = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const { q } = req.query;

    if (!q) {
        throw new ApiError(status.BAD_REQUEST, "Search query is required");
    }

    const result = await fileService.globalSearch(userId, q as string);
    res.status(status.OK).json(new ApiResponse(status.OK, "Search results retrieved", result));
});


/**
 * Get file by ID
 */
export const getFileById = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const { id } = req.params;

    const file = await fileService.getFileById(id, userId);
    if (!file) {
        return res.status(status.NOT_FOUND).json(new ApiResponse(status.NOT_FOUND, "File not found"));
    }
    res.status(status.OK).json(new ApiResponse(status.OK, "File fetched successfully", file));
});

/**
 * Rename file or update metadata
 */
export const updateFileMetadata = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const { id } = req.params;
    const { filename } = req.body;

    const file = await db.file.update({
        where: { id, ownerId: userId },
        data: { filename }
    });

    res.status(status.OK).json(new ApiResponse(status.OK, "File metadata updated successfully", file));
});

/**
 * Move file to trash
 */
export const moveFileToTrash = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const { id } = req.params;

    await fileService.moveFileToTrash(id, userId);
    res.status(status.OK).json(new ApiResponse(status.OK, "File moved to trash successfully"));
});

/**
 * Restore file from trash
 */
export const restoreFileFromTrash = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const { id } = req.params;

    await fileService.moveFileFromTrash(id, userId);
    res.status(status.OK).json(new ApiResponse(status.OK, "File restored successfully"));
});

/**
 * Permanently delete file
 */
export const permanentlyDeleteFile = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const firebaseUid = req.user?.firebaseUid as string;
    const { id } = req.params;

    await storageService.safePermanentDelete(id, userId);

    // Invalidate user cache
    if (firebaseUid) {
        await redis.delete(`user:${firebaseUid}`);
    }

    res.status(status.OK).json(new ApiResponse(status.OK, "File deleted permanently"));
});

/**
 * Empty trash
 */
export const emptyTrash = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const firebaseUid = req.user?.firebaseUid as string;

    await storageService.safeEmptyTrash(userId);

    // Invalidate user cache
    if (firebaseUid) {
        await redis.delete(`user:${firebaseUid}`);
    }

    res.status(status.OK).json(new ApiResponse(status.OK, "Trash emptied successfully"));
});

/**
 * Move file to folder
 */
export const moveFileToFolder = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const { id } = req.params;
    const { folderId } = req.body;

    const file = await db.file.update({
        where: { id, ownerId: userId },
        data: { folderId: folderId || null }
    });

    res.status(status.OK).json(new ApiResponse(status.OK, "File moved successfully", file));
});

/**
 * Get all files in trash
 */
export const getTrashFiles = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;

    const files = await db.file.findMany({
        where: {
            ownerId: userId,
            isInTrash: true
        }
    });

    res.status(status.OK).json(new ApiResponse(status.OK, "Trash files fetched successfully", files));
});

/**
 * Toggle file access (Public/Private)
 */
export const toggleFileAccess = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const { id } = req.params;
    const { access } = req.body;

    const file = await db.file.update({
        where: { id, ownerId: userId },
        data: { access }
    });
    res.status(status.OK).json(new ApiResponse(status.OK, `File access changed to ${access}`, file));
});

/**
 * Get signed URL for download
 */
export const downloadFile = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const { id } = req.params;

    const file = await fileService.getFileById(id, userId);
    if (!file) throw new Error("File not found");

    const downloadUrl = await getObjectUrl(file.storageKey);
    res.status(status.OK).json(new ApiResponse(status.OK, "Download URL generated", { downloadUrl }));
});

/**
 * Copy file (Placeholder logic)
 */
export const copyFileToFolder = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const firebaseUid = req.user?.firebaseUid as string;
    const { id } = req.params;
    const { folderId } = req.body;

    if (!folderId) throw new ApiError(status.NOT_FOUND, "Invalid folder id")
    // find for a existing folder
    const folder = await db.folder.findFirst({
        where: {
            id: folderId
        }
    })
    if (!folder) {
        throw new ApiError(status.NOT_FOUND, "Folder not found")
    }

    const file = await fileService.getFileById(id, userId);
    if (!file) throw new Error("File not found");

    const newFile = await db.file.create({
        data: {
            filename: file.filename,
            size: file.size,
            fileType: file.fileType,
            mimeType: file.mimeType,
            ownerId: userId,
            folderId: folder.id,
            storageKey: file.storageKey,
            uploadStatus: file.uploadStatus,
        }
    });

    await db.user.update({
        where: { id: userId },
        data: { storageUsed: { increment: file.size } }
    });

    if (firebaseUid) {
        await redis.delete(`user:${firebaseUid}`);
    }

    res.status(status.CREATED).json(new ApiResponse(status.CREATED, "File copied successfully", newFile));
});