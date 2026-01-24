import { deleteObject } from "@/config/s3-config";
import { ApiError } from "@/interface";
import db from "@/services/db";
import { Prisma } from "@repo/db";
import { FileType } from "@repo/shared";
import status from "http-status";

class FileService {

    /**
     * Get files with Advanced Querying (Pagination, Sort, Filter, Search)
     */
    async getFiles(userId: string, options: {
        folderId?: string;
        isInTrash?: boolean;
        fileType?: FileType;
        search?: string;
        sortBy?: string;
        order?: 'asc' | 'desc';
        page?: number;
        limit?: number;
    }) {
        const {
            folderId,
            isInTrash = false,
            fileType,
            search,
            sortBy = 'createdAt',
            order = 'desc',
            page = 1,
            limit = 20
        } = options;
        const skip = (page - 1) * limit;
        const where: Prisma.FileWhereInput = {
            ownerId: userId,
            isInTrash,
            folderId: folderId || (isInTrash ? undefined : null), // null means root
            fileType: fileType,
            filename: search ? { contains: search, mode: 'insensitive' } : undefined
        };
        try {
            const [files, total] = await db.$transaction([
                db.file.findMany({
                    where,
                    orderBy: { [sortBy]: order },
                    skip,
                    take: limit,
                }),
                db.file.count({ where })
            ]);
            return {
                files,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to fetch files", String(error));
        }
    }

    /**
     * Global search for files and folders
     */
    async globalSearch(userId: string, query: string) {
        try {
            const [files, folders] = await Promise.all([
                db.file.findMany({
                    where: {
                        ownerId: userId,
                        filename: { contains: query, mode: 'insensitive' },
                        isInTrash: false
                    },
                    take: 10
                }),
                db.folder.findMany({
                    where: {
                        ownerId: userId,
                        name: { contains: query, mode: 'insensitive' }
                    },
                    take: 10
                })
            ]);

            return { files, folders };
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Global search failed", String(error));
        }
    }

    async getFileById(fileId: string, ownerId: string) {
        try {
            const file = await db.file.findFirst({
                where: {
                    id: fileId,
                    ownerId
                },
                select: {
                    id: true,
                    filename: true,
                    size: true,
                    fileType: true,
                    access: true,
                    uploadedAt: true,
                    ownerId: true,
                    isInTrash: true,
                    mimeType: true,
                    folderId: true,
                    storageKey: true,
                    uploadStatus: true,
                }
            });
            if (!file) {
                throw new ApiError(status.NOT_FOUND, "File not found");
            }
            return file
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to get file", error instanceof Error ? error.message : String(error));
        }
    }


    /**
     * delete file permanently ( from db and cloud)
     * 
     * @param fileId    
     * @param userId 
     * @returns 
     */
    async permanentFileDelete(fileId: string, userId: string) {
        try {
            const file = await db.file.findFirst({
                where: {
                    id: fileId,
                    ownerId: userId
                },
                select: {
                    id: true,
                    size: true,
                    ownerId: true,
                    isInTrash: true,
                    folderId: true,
                    storageKey: true,
                    uploadStatus: true,
                }
            });
            if (!file) {
                throw new ApiError(status.NOT_FOUND, "File not found");
            }
            // if the file is not in trash, throw error
            if (!file.isInTrash) {
                throw new ApiError(status.BAD_REQUEST, "To delete a file permanently, First move the file to trash");
            }
            // delete the file from cloud
            await deleteObject(file.storageKey);
            // delete the file from db
            await db.$transaction(async (tx: Prisma.TransactionClient) => {
                await tx.file.delete({
                    where: {
                        id: file.id,
                        ownerId: userId
                    },
                    select: {
                        owner: {
                            select: {
                                id: true,
                                storageUsed: true,
                                firebaseUid: true
                            }
                        }
                    }
                })
                if (file.uploadStatus === "COMPLETED") {
                    await tx.user.update({
                        where: { id: userId },
                        data: {
                            storageUsed: { decrement: file.size }
                        }
                    })
                }

            })
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to delete file", error instanceof Error ? error.message : String(error));
        }
    }

    /**
     * 
     * @param fileId 
     * @param userId 
     */

    async moveFileToTrash(fileId: string, userId: string) {
        try {
            const file = await db.file.findFirst({
                where: {
                    id: fileId,
                    ownerId: userId
                },
                select: {
                    id: true,
                    size: true,
                    ownerId: true,
                    isInTrash: true,
                    folderId: true,
                    storageKey: true,
                    uploadStatus: true,
                }
            });
            if (!file) {
                throw new ApiError(status.NOT_FOUND, "File not found");
            }
            // if the file is already in trash, throw error
            if (file.isInTrash) {
                throw new ApiError(status.BAD_REQUEST, "File is already in trash");
            }
            // move the file to trash
            await db.file.update({
                where: {
                    id: fileId,
                    ownerId: userId
                },
                data: {
                    isInTrash: true,
                    folderId: null,
                    originalFolderId: file.folderId,
                    deletedAt: new Date()
                }
            });
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to move file to trash", error instanceof Error ? error.message : String(error));
        }
    }

    /**
     * move file from trash to original folder 
     * the file may not be in any folder initially 
     *  so we need to check if the file is in any folder
     * if the file was not in any folder, move it to root with folderId null
     * 
     * @param fileId 
     * @param userId 
     */
    async moveFileFromTrash(fileId: string, userId: string) {
        try {
            const file = await db.file.findFirst({
                where: {
                    id: fileId,
                    ownerId: userId,
                    isInTrash: true
                },
                select: {
                    id: true,
                    size: true,
                    ownerId: true,
                    isInTrash: true,
                    folderId: true,
                    originalFolderId: true,
                    storageKey: true,
                    uploadStatus: true,
                }
            });
            if (!file) {
                throw new ApiError(status.NOT_FOUND, "File not found");
            }
            // if the file is not in trash, throw error
            if (!file.isInTrash) {
                throw new ApiError(status.BAD_REQUEST, "File is not in trash");
            }
            // move the file to original folder
            await db.file.update({
                where: {
                    id: fileId,
                    ownerId: userId
                },
                data: {
                    isInTrash: false,
                    folderId: file?.originalFolderId,
                    originalFolderId: null,
                    deletedAt: null
                }
            });
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to move file from trash", error instanceof Error ? error.message : String(error));
        }
    }

    /**
     * empty trash also delete the files from cloud as well
     * 
     * @param userId 
     * @returns 
     */
    async emptyTrash(userId: string) {
        try {
            const trashedFiles = await db.file.findMany({
                where: {
                    ownerId: userId,
                    isInTrash: true
                },
                select: {
                    id: true,
                    size: true,
                    ownerId: true,
                    isInTrash: true,
                    folderId: true,
                    originalFolderId: true,
                    storageKey: true,
                    uploadStatus: true,
                }
            });

            if (!trashedFiles.length) {
                throw new ApiError(status.NOT_FOUND, "Nothing to empty trash");
            }

            // delete the files from cloud
            await Promise.all(
                trashedFiles.map(async (file) => {
                    await deleteObject(file.storageKey);
                })
            )

            // delete the files from db
            await db.$transaction(async (tx: Prisma.TransactionClient) => {
                await tx.file.deleteMany({
                    where: {
                        ownerId: userId,
                        isInTrash: true
                    }
                })

                const totalTrashSize = trashedFiles.filter((file) => file.uploadStatus === "COMPLETED").reduce((acc, file) => acc + BigInt(file.size), BigInt(0));

                if (totalTrashSize > 0) {

                    await tx.user.update({
                        where: {
                            id: userId
                        },
                        data: {
                            storageUsed: {
                                decrement: totalTrashSize
                            }
                        }
                    })
                }

            })

        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to empty trash", error instanceof Error ? error.message : String(error));
        }
    }


    /**
  * Fix the toggleFileAccess you started
  */
    async toggleFileAccess(fileId: string, userId: string) {
        try {
            const file = await this.getFileById(fileId, userId);
            if (!file) throw new ApiError(status.NOT_FOUND, "File not found");
            const newAccess = file.access === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';

            return await db.file.update({
                where: { id: fileId },
                data: { access: newAccess }
            });
        } catch (error) {
            throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to toggle access", String(error));
        }
    }
}


export default new FileService();
