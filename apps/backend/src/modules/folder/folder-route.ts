import { Router } from "express";
import userAuthMiddleware from "@/middlewares/user-auth-middleware";
import {
    createFolderController,
    deleteFolderController,
    getFolderByIdController,
    getFoldersController,
    updateFolderController
} from "./folder-controller";
import { validateRequest } from "@/middlewares";
import { createFolderSchema, updateFolderSchema } from "@repo/shared";

const router = Router();

router.use(userAuthMiddleware);

router.post("/create", validateRequest(createFolderSchema), createFolderController);
router.get("/", getFoldersController);
router.get("/:id", getFolderByIdController);
router.patch("/:id", validateRequest(updateFolderSchema), updateFolderController);
router.delete("/:id", deleteFolderController);

export const folderRouter = router;
