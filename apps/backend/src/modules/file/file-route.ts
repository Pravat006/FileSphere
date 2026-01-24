import { Router } from "express";
import userAuthMiddleware from "@/middlewares/user-auth-middleware";
import { copyFileToFolder, downloadFile, emptyTrash, getFileById, getFilesController, getTrashFiles, globalSearchController, moveFileToFolder, moveFileToTrash, permanentlyDeleteFile, restoreFileFromTrash, toggleFileAccess, updateFileMetadata } from "./file-controller";

const router = Router();

// Apply auth middleware to all file routes
router.use(userAuthMiddleware);

// General Query & List
router.get("/", getFilesController);
router.get("/search", globalSearchController);
router.get("/trash", getTrashFiles);
router.get("/:id", getFileById);

// Metadata & Property Updates
router.patch("/:id/metadata", updateFileMetadata);
router.patch("/:id/access", toggleFileAccess);

// Lifecycle: Trash & Delete
router.post("/:id/trash", moveFileToTrash);
router.post("/:id/restore", restoreFileFromTrash);
router.delete("/trash/empty", emptyTrash);
router.delete("/:id", permanentlyDeleteFile);

// Movement & Duplication
router.post("/:id/move", moveFileToFolder);
router.post("/:id/copy", copyFileToFolder);

// Retrieval
router.get("/:id/download", downloadFile);

export const fileRouter = router;
