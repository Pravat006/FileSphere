import { crateFolder, getFolders, updateFolder, deleteFolder, getFolderById } from "@/controllers/folder-controller";

import { Router } from "express";
import verifyToken from "@/middlewares/auth-middleware";
const router = Router();

router.post('/folder', verifyToken, crateFolder);
router.get('/folders', verifyToken, getFolders);
router.get('/folder/:id', verifyToken, getFolderById);
router.put('/folder/:id', verifyToken, updateFolder);
router.delete('/folder/:id', verifyToken, deleteFolder);

export default router;