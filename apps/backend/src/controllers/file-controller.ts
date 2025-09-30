import prisma from "@repo/db";

import { Request, Response } from "express";
import { fileArraySchema } from "@repo/shared";
import { ApiError } from "@/utils/api-error";
import getFileType from "@/helper/get-fileType";


// general controllers
// 1. upload files
// 2. get all files of the current logged in user
// 3. get a file by id
// 4. delete a file by id permanently
// 5. permanently delete a file by id( if the file is in trash)
// 6. move a file to trash by id
// 7. update a file by id (rename)
// 8. move a file to another folder
// 9. copy a file to another folder
// 10. share a file with another user
// 11. get all files shared with the current logged in user
// 12. get all files in a folder
// 13. search files by name
// 14. filter files by type
// 15. sort files by name, date, size
// 16. paginate files
// 17. download a file
// 18. get file metadata



// upload a file

// get the current logged in user
// get the folder id in which user wants to upload files
// check if the user is the owner of that folder
//rquest files from user
// check for non empty array
// check for validations on files
// upload the files into the cloud and generate unique cloudUrl for each of them
// save the files meta data in db


const uploadFiles = async (req: Request, res: Response) => {


    const userId = req.user?.id as string
    if (!userId) {
        throw new ApiError(401, "User id not found")
    }
    const { folderId } = req.params as { folderId?: string }

    // check if the folder exists 
    if (folderId) {
        const folder = await prisma.folder.findUnique({
            where: {
                id: folderId,
                ownerId: userId
            }
        })
        if (!folder) {
            return res.status(404).json({
                "success": false,
                "message": "Folder not found"
            })
        }
        // check if the user is the owner of the folder
        if (folder.ownerId !== userId) {
            return res.status(403).json({
                "success": false,
                "message": "You are not authorized to upload files to this folder"
            })
        }
    }
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({
            "success": false,
            "message": "No files were uploaded."
        })
    }

    const files = req.files as Express.Multer.File[];
    fileArraySchema.parse(files)
    // if files are more than 10, return error
    if (files.length > 10) {
        return res.status(400).json({
            "success": false,
            "message": "You can upload a maximum of 10 files at a time."
        })
    }
    // save the files metadata in db
    const results = await Promise.allSettled(
        files.map(async (file) => {
            console.log("typpe: ", file.mimetype.split('/')[0])
            try {
                const uploadedFiles = await prisma.file.create({
                    data: {
                        filename: file.originalname,
                        // cloud url will be the static url for now
                        cloudUrl: `/static/${file.filename}`,
                        type: getFileType(file.mimetype),
                        folderId: folderId,
                        size: file.size,
                        mimeType: file.mimetype,
                    }
                })
                return {
                    status: "success",
                    file: uploadedFiles
                }
            } catch (error: any) {
                console.log(' File upload error:', error); // Add this line
                return {
                    status: "failure",
                    file: file.originalname,
                    error: error.message
                }
            }
        })
    )

    const successfulUploads = results.filter(result => result.status === 'fulfilled' && result.value.status === 'success').map(result => (result as PromiseFulfilledResult<any>).value.file);

    const failedUploads = results.filter(result => result.status === 'fulfilled' && result.value.status === "failure").map(result => (
        result as PromiseFulfilledResult<any>).value.file
    )

    res.status(200).json({
        "success": true,
        "message": "Files has been uploaded",
        "data": {
            successfulUploads,
            failedUploads
        }
    })

}
// 2. get all files of the current logged in user

const getAllFiles = async (req: Request, res: Response) => {
    const userId = req.user?.id as string
    if (!userId) {
        throw new ApiError(401, "User id not found")
    }
    // since the files are linked to folder and folder is linked to user, we can use that relation to get all files of the user
    try {
        const files = await prisma.file.findMany({
            where: {
                folder: {
                    ownerId: userId
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        res.status(200).json({
            "success": true,
            "message": "Files fetched successfully",
            "data": files
        })
    } catch (error: any) {
        console.error('Error fetching files:', error);
        res.status(500).json({
            "success": false,
            "message": "Error fetching files",
            "error": error.message
        })
    }
}
// 3. get a file by id
const getFileById = async (req: Request, res: Response) => {
    const userId = req.user?.id as string
    if (!userId) {
        throw new ApiError(401, "User id not found")
    }
    const { id } = req.params
    try {
        const file = await prisma.file.findFirst({
            where: {
                id: id,
                folder: {
                    ownerId: userId
                }
            }
        })
        if (!file) {
            return res.status(404).json({
                "success": false,
                "message": "File not found"
            })
        }
        res.status(200).json({
            "success": true,
            "message": "File fetched successfully",
            "data": file
        })
    } catch (error: any) {
        console.error('Error fetching file:', error);
        res.status(500).json({
            "success": false,
            "message": "Error fetching file",
            "error": error.message
        })
    }
}
// 4. delete a file by id permanently
const deleteFilePermanently = async (req: Request, res: Response) => {
    const userId = req.user?.id as string
    if (!userId) {
        throw new ApiError(401, "User id not found")
    }
    const { fileId } = req.params
    try {
        const file = await prisma.file.findFirst({
            where: {
                id: fileId,
                folder: {
                    ownerId: userId
                }
            }
        })
        if (!file) {
            return res.status(404).json({
                "success": false,
                "message": "File not found"
            })
        }
        await prisma.file.delete({
            where: {
                id: fileId
            }
        })
        res.status(200).json({
            "success": true,
            "message": "File deleted successfully"
        })
    } catch (error: any) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            "success": false,
            "message": "Error deleting file",
            "error": error.message
        })
    }
}

// 5. permanently delete a file by id( if the file is in trash)
const deleteFileFromTrash = async (req: Request, res: Response) => {
    const userId = req.user?.id as string
    if (!userId) {
        throw new ApiError(401, "User id not found")
    }
    const { fileId } = req.params
    try {
        const file = await prisma.file.findFirst({
            where: {
                id: fileId,
                folder: {
                    ownerId: userId
                },
                isTrashed: true
            }
        })
        if (!file) {
            return res.status(404).json({
                "success": false,
                "message": "File not found in trash"
            })
        }
        await prisma.file.delete({
            where: {
                id: fileId
            }
        })
        res.status(200).json({
            "success": true,
            "message": "File deleted from trash successfully"
        })
    } catch (error: any) {
        console.error('Error deleting file from trash:', error);
        res.status(500).json({
            "success": false,
            "message": "Error deleting file from trash",
            "error": error.message
        })
    }
}


export { uploadFiles, getAllFiles, getFileById, deleteFilePermanently, deleteFileFromTrash };
// -> delete the files from cloud when deleted from db
// -> move the files to trash instead of deleting permanently
// -> a helper that allows to access the file using the projects own url instead of cloud url