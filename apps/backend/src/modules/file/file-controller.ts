import prisma from "@repo/db";
import fs from "fs";
import { Request, Response } from "express";
import { fileArraySchema } from "@repo/shared";
import getFileType from "@/helper/get-fileType";
import path from "node:path";
import { ApiError } from "@/interface";

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
// 11. restore a file from trash
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
// check if the user has enough storage to upload the files
// upload the files into the cloud and generate unique cloudUrl for each of them
// save the files meta data in db
// for the successful uploads, update the user's used storage with the size of the uploaded files


const uploadFiles = async (req: Request, res: Response) => {


    const userId = req.user?.id as string
    if (!userId) {
        throw new ApiError(401, "User id not found")
    }
    const availableStorage = req.availableStorage as BigInt
    if (!availableStorage) {
        throw new ApiError(400, "Available storage not found")
    }
    console.log("availableStorage: ", availableStorage)

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

    // check if the user has enough storage to upload the files
    const totalUploadSize = files.reduce((acc, file) => acc + file.size, 0);
    const availableStorageBigInt = BigInt(availableStorage.toString());

    if (BigInt(totalUploadSize) > availableStorageBigInt) {
        return res.status(403).json({
            "success": false,
            "message": "Insufficient storage space. Please upgrade your plan or delete some files.",
            "availableStorage": availableStorageBigInt.toString(),
            "requiredStorage": totalUploadSize.toString()
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
                        ownerId: userId,
                        folderId: folderId,
                        size: file.size,
                        mimeType: file.mimetype,
                    }
                })
                return {
                    status: "success",
                    file: uploadedFiles
                }
            } catch (error) {
                console.log(' File upload error:', error); // Add this line
                return {
                    status: "failure",
                    file: file.originalname,
                    error: error instanceof Error ? error.message : String(error)
                }
            }
        })
    )


    const successfulUploads = results.filter(result => result.status === 'fulfilled' && result.value.status === 'success').map(result => (result as PromiseFulfilledResult<any>).value.file);
    // for the successful uploads, update the user's used storage with the size of the uploaded files
    const totalUploadedSize = successfulUploads.reduce((acc, file) => acc + file.size, 0);
    console.log("totalUploadedSize: ", totalUploadedSize)
    if (totalUploadedSize > 0) {
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                storageUsed: {
                    increment: totalUploadedSize
                }
            }
        })
    }


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
                ownerId: userId,
                isInTrash: false
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
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({
            "success": false,
            "message": "Error fetching files",
            "error": error instanceof Error ? error.message : String(error)
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
                ownerId: userId
            },
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
    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).json({
            "success": false,
            "message": "Error fetching file",
            "error": error instanceof Error ? error.message : String(error)
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
                ownerId: userId
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
        // after deleting the file from db, we need to delete the file from cloud as well
        // for now we are storing the files in local storage, so we will delete the file from local storage
        const filePath = path.join(process.cwd(), 'public', file.cloudUrl.replace('/static/', ''))
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
        // after deleting the file, update the user's used storage
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                storageUsed: {
                    decrement: file.size
                }
            }
        })
        res.status(200).json({
            "success": true,
            "message": "File deleted successfully"
        })
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            "success": false,
            "message": "Error deleting file",
            "error": error instanceof Error ? error.message : String(error)
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
                ownerId: userId,
                isInTrash: true
            },
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
        // after deleting the file from db, we need to delete the file from cloud as well
        // for now we are storing the files in local storage, so we will delete the file from local storage
        const filePath = path.join(process.cwd(), 'public', file.cloudUrl.replace('/static/', ''))
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
        // after deleting the file, update the user's used storage
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                storageUsed: {
                    decrement: file.size
                }
            }
        })
        res.status(200).json({
            "success": true,
            "message": "File deleted from trash successfully"
        })
    } catch (error) {
        console.error('Error deleting file from trash:', error);
        res.status(500).json({
            "success": false,
            "message": "Error deleting file from trash",
            "error": error instanceof Error ? error.message : String(error)
        })
    }
}
// 6. move a file to trash by id
const moveFileToTrash = async (req: Request, res: Response) => {
    const userId = req.user?.id as string
    if (!userId) {
        throw new ApiError(401, "User id not found")
    }
    const { fileId } = req.params
    try {
        const file = await prisma.file.findFirst({
            where: {
                id: fileId,
                ownerId: userId,
            },
        })
        if (!file) {
            return res.status(404).json({
                "success": false,
                "message": "File not found or you don't have permission."
            })
        }

        if (file.isInTrash) {
            return res.status(400).json({
                success: false,
                message: "File is already in trash.",
            });
        }

        await prisma.file.update({
            where: {
                id: fileId
            },
            data: {
                isInTrash: true,
                deletedAt: new Date(),
                originalFolderId: file.folderId,
                folderId: null
            }
        })
        res.status(200).json({
            "success": true,
            "message": "File moved to trash successfully"
        })
    } catch (error) {
        console.error('Error moving file to trash:', error);
        res.status(500).json({
            "success": false,
            "message": "Error moving file to trash",
            "error": error instanceof Error ? error.message : String(error)
        })
    }
}
// 11. restore a file from trash
const restoreFileFromTrash = async (req: Request, res: Response) => {
    const userId = req.user?.id as string
    if (!userId) {
        throw new ApiError(401, "User id not found")
    }
    const { fileId } = req.params
    try {
        const file = await prisma.file.findFirst({
            where: {
                id: fileId,
                ownerId: userId,
                isInTrash: true
            },
        })
        if (!file) {
            return res.status(404).json({
                "success": false,
                "message": "File not found in trash"
            })
        }
        await prisma.file.update({
            where: {
                id: fileId
            },
            data: {
                isInTrash: false,
                deletedAt: null,
                folderId: file.originalFolderId,
                originalFolderId: null
            }
        })
        res.status(200).json({
            "success": true,
            "message": "File restored from trash successfully"
        })
    } catch (error) {
        console.error('Error restoring file from trash:', error);
        res.status(500).json({
            "success": false,
            "message": "Error restoring file from trash",
            "error": error instanceof Error ? error.message : String(error)
        })
    }
}

// 8. move a file to another folder
const moveFileToAnotherFolder = async (req: Request, res: Response) => {
    // moving file to another folder is simply change/update its folderId

    const userId = req.user?.id as string
    if (!userId) {
        throw new ApiError(401, "User id not found")
    }
    const { fileId } = req.params
    const { folderId } = req.body
    try {
        const file = await prisma.file.findFirst({
            where: {
                id: fileId,
                ownerId: userId,
                isInTrash: false
            },
        })
        if (!file) {
            return res.status(404).json({
                "success": false,
                "message": "File not found or you don't have permission."
            })
        }

        await prisma.file.update({
            where: {
                id: fileId
            },
            data: {
                folderId: folderId
            }
        })
        res.status(200).json({
            "success": true,
            "message": "File moved to another folder successfully"
        })
    } catch (error) {
        console.error('Error moving file to another folder:', error);
        res.status(500).json({
            "success": false,
            "message": "Error moving file to another folder",
            "error": error instanceof Error ? error.message : String(error)
        })
    }
}



// 13. search files by name
const searchFilesByName = async (req: Request, res: Response) => {
    const userId = req.user?.id as string
    if (!userId) {
        throw new ApiError(401, "User id not found")
    }
    const { name } = req.query as { name: string }
    try {
        const files = await prisma.file.findMany({
            where: {
                ownerId: userId,
                isInTrash: false,
                filename: {
                    contains: name,
                    mode: 'insensitive'
                }
            }
        })
        res.status(200).json({
            "success": true,
            "data": files
        })

    } catch (error: any) {
        console.error('Error searching files by name:', error);
        res.status(500).json({
            "success": false,
            "message": "Error searching files by name",
            "error": error instanceof Error ? error.message : String(error)
        })
    }
}

// 15. sort files by name, date, size
const sortFiles = async (req: Request, res: Response) => {
    const userId = req.user?.id as string
    if (!userId) {
        throw new ApiError(401, "User id not found")
    }
    const { sortBy, order } = req.query as { sortBy: 'name' | 'date' | 'size', order: 'asc' | 'desc' }
    try {
        let orderBy = {}
        if (sortBy === 'name') {
            orderBy = { filename: order }
        } else if (sortBy === 'date') {
            orderBy = { createdAt: order }
        } else if (sortBy === 'size') {
            orderBy = { size: order }
        } else {
            return res.status(400).json({
                "success": false,
                "message": "Invalid sort by parameter"
            })
        }
        const files = await prisma.file.findMany({
            where: {
                ownerId: userId,
                isInTrash: false
            },
            orderBy: orderBy
        })
        res.status(200).json({
            "success": true,
            "data": files
        })
    } catch (error) {
        console.error('Error sorting files:', error);
        res.status(500).json({
            "success": false,
            "message": "Error sorting files",
            "error": error instanceof Error ? error.message : String(error)
        })
    }
}
// 17. download a file
const downloadFile = async (req: Request, res: Response) => {
    const userId = req.user?.id as string
    if (!userId) {
        throw new ApiError(401, "User id not found")
    }
    // todo implement this
    // make the abstracted cloud url to download the file from cloud
    // for now we make the user to download from our own server
    // which is not a good practice
    // we should provide a signed url to download the file from cloud directly
    // but for that we need to implement the cloud storage first
    // which is not in the scope of this project
    // so for now we will just send the file from our own server
    // later we can implement the cloud storage and provide a signed url to download the file from cloud directly
    const { fileId } = req.params
    // find the file in db
    try {
        const file = await prisma.file.findFirst({
            where: {
                id: fileId,
                ownerId: userId,
                isInTrash: false
            }
        })
        if (!file) {
            return res.status(404).json({
                "success": false,
                "message": "File not found"
            })
        }
        // for now the cloudUrl is the static url of our server
        // later it will be the url of the cloud storage
        const fileUrl = path.join(process.cwd(), 'public', file.cloudUrl.replace('/static/', ''))
        if (!fs.existsSync(fileUrl)) {
            return res.status(404).json({
                "success": false,
                "message": "File not found on server"
            })
        }
        res.download(fileUrl, file.filename)
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({
            "success": false,
            "message": "Error downloading file",
            "error": error instanceof Error ? error.message : String(error)
        })
    }
}

export { uploadFiles, getAllFiles, getFileById, deleteFilePermanently, deleteFileFromTrash, moveFileToTrash, restoreFileFromTrash, moveFileToAnotherFolder, searchFilesByName, sortFiles, downloadFile };
// -> delete the files from cloud when deleted from db
// -> move the files to trash instead of deleting permanently
// -> a helper that allows to access the file using the projects own url instead of cloud url
// -> cron job to delete files from trash after 30 days