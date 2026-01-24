import { asyncHandler } from "@/utils/async-handler";
import { ApiResponse } from "@/interface";
import status from "http-status";
import folderService from "./folder-service";
import { CreateFolderRequest } from "@repo/shared";

/**
 * Create a new folder
 */
export const createFolderController = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const body = req.body as CreateFolderRequest;

    const folder = await folderService.createFolder(userId, body);

    res.status(status.CREATED).json(
        new ApiResponse(status.CREATED, "Folder created successfully", folder)
    );
});

/**
 * Get all folders for a user
 * Supports getting subfolders via query param ?parentFolderId=...
 */
export const getFoldersController = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const parentFolderId = req.query.parentFolderId as string | undefined;
    const search = req.query.search as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await folderService.getFolders(userId, {
        parentFolderId,
        search,
        page,
        limit
    });

    res.status(status.OK).json(
        new ApiResponse(status.OK, "Folders fetched successfully", result)
    );
});

/**
 * Get folder by ID
 */
export const getFolderByIdController = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const { id } = req.params;

    const folder = await folderService.getFolderById(userId, id);

    res.status(status.OK).json(
        new ApiResponse(status.OK, "Folder fetched successfully", folder)
    );
});

/**
 * Update folder
 */
export const updateFolderController = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const { id } = req.params;
    const { name } = req.body;

    const folder = await folderService.updateFolder(userId, id, name);

    res.status(status.OK).json(
        new ApiResponse(status.OK, "Folder updated successfully", folder)
    );
});

/**
 * Delete folder
 */
export const deleteFolderController = asyncHandler(async (req, res) => {
    const userId = req.user?.id as string;
    const { id } = req.params;

    await folderService.deleteFolder(userId, id);

    res.status(status.OK).json(
        new ApiResponse(status.OK, "Folder deleted successfully")
    );
});
