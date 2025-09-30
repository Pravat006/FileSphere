import { ApiError } from "@/utils/api-error";
import prisma from "@repo/db";
import { CreateFolderRequest } from "@repo/shared"
import { Request, Response } from "express";

const crateFolder = async (req: Request, res: Response) => {
    const { name } = req.body as CreateFolderRequest
    const userId = req.user?.id
    if (!userId) {
        throw new ApiError(401, "Unauthoried")
    }
    const folder = await prisma.folder.create({
        data: {
            name,
            ownerId: userId
        }
    })
    res.status(201).json({
        "success": true,
        "data": folder,
        "message": "Folder created successfully"
    })
}

const deleteFolder = async (req: Request, res: Response) => {

    const { id } = req.params
    const folder = await prisma.folder.findUnique({
        where: {
            id
        }
    })
    if (!folder) {
        return res.status(404).json({
            "success": false,
            "message": "Folder not found"
        })
    }
    await prisma.folder.delete({
        where: {
            id
        }
    })
    res.status(200).json({
        "success": true,
        "message": "Folder deleted successfully"
    })
}

const getFolders = async (req: Request, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
        throw new ApiError(401, "Unauthorized ! User not found")
    }
    const folders = await prisma.folder.findMany({
        where: {
            ownerId: userId
        }
    })
    res.status(200).json({
        "success": true,
        "data": folders,
        "message": "Folders fetched successfully"
    })
}

const updateFolder = async (req: Request, res: Response) => {
    const { id } = req.params
    const { name } = req.body as Partial<CreateFolderRequest>

    const folder = await prisma.folder.findUnique({
        where: {
            id
        }
    })
    if (!folder) {
        return res.status(404).json({
            "success": false,
            "message": "Folder not found"
        })
    }
    const updatedFolder = await prisma.folder.update({
        where: {
            id
        },
        data: {
            name
        }
    })
    res.status(200).json({
        "success": true,
        "data": updatedFolder,
        "message": "Folder updated successfully"
    })
}

// getting a folder by it's id should also return all the files in that folder
const getFolderById = async (req: Request, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
        throw new ApiError(401, "Unauthorized ! User id not found")
    }
    const { id } = req.params
    const folder = await prisma.folder.findUnique({
        where: {
            id,
            ownerId: userId
        },
        include: {
            files: true
        }
    })
    if (!folder) {
        return res.status(404).json({
            "success": false,
            "message": "Folder not found"
        })
    }
    res.status(200).json({
        "success": true,
        "data": folder,
        "message": "Folder fetched successfully"
    })
}



export { crateFolder, getFolders, updateFolder, deleteFolder, getFolderById }
