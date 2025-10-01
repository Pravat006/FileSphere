import upload from "@/middlewares/multer-middleware";
import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { uploadFiles, getAllFiles, getFileById, deleteFilePermanently, deleteFileFromTrash, moveFileToTrash, restoreFileFromTrash, moveFileToAnotherFolder, getAllFilesInFolder, searchFilesByName, sortFiles, downloadFile } from "@/controllers/file-controller";
import verifyToken from "@/middlewares/auth-middleware";
const router = Router();


router.post('/file/upload/to/:folderId', verifyToken, upload.any(), uploadFiles);
router.get('/files', verifyToken, getAllFiles);
router.get('/file/:id', verifyToken, getFileById);
router.delete('/file/permanent/:id', verifyToken, deleteFilePermanently);
router.delete('/file/trash/:id', verifyToken, deleteFileFromTrash);
router.put('/file/trash/:id', verifyToken, moveFileToTrash);
router.put('/file/restore/:id', verifyToken, restoreFileFromTrash);
router.put('/file/move/:id/to/:folderId', verifyToken, moveFileToAnotherFolder);
router.get('/files/folder/:folderId', verifyToken, getAllFilesInFolder);
router.get('/files/search', verifyToken, searchFilesByName);
router.get('/files/sort', verifyToken, sortFiles);
router.get('/file/download/:id', verifyToken, downloadFile);

// Add this route to serve files
router.get('/file/:filename', (req: Request, res: Response) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'public', filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            status: "false",
            message: "File not found"
        });
    }

    // Send file
    res.sendFile(filePath);
});


export default router;







