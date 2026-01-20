import { abortMultipartUpload, completeMultiPartUpload, createMultipartUpload, decideStrategy, deleteObject, getPutObjectUrl, getUploadPartUrl } from "@/config/s3-config";
import getFileType from "@/helper/get-fileType";
import { ApiError, ApiResponse } from "@/interface";
import db from "@/services/db";
import { redis } from "@/services/redis-service";
import { Prisma, UploadStrategy } from "@repo/db";
import status from "http-status";

type UploadOptions = {
    filename: string;
    size: bigint;
    mimeType: string;
    ownerId: string;
    folderId?: string
}

/**
 * 
 * @param options 
 * @returns 
 */
export const initiateUpload = async (options: UploadOptions) => {
    const strategy = decideStrategy(options.size);
    const fileType = getFileType(options.mimeType);
    const file = await db.file.create({
        data: {
            filename: options.filename,
            size: BigInt(options.size),
            mimeType: options.mimeType,
            ownerId: options.ownerId,
            folderId: options.folderId,
            uploadStrategy: strategy,
            uploadStatus: "INITIATED",
            storageKey: "",
            fileType: fileType
        }
    });

    const key = `uploads/${options.ownerId}/${file.id}/${options.filename}`;

    let uploadId: string | undefined;
    let preSignedUrls: string[] = [];

    try {
        await db.file.update({
            where: { id: file.id },
            data: { storageKey: key }
        });

        if (strategy === UploadStrategy.SINGLE_PART) {
            const url = await getPutObjectUrl(key, options.mimeType);
            preSignedUrls.push(url);
        } else {
            const multipart = await createMultipartUpload(key, options.mimeType);
            uploadId = multipart.UploadId!;

            await db.file.update({
                where: { id: file.id },
                data: { uploadId }
            });
        }

        return {
            fileId: file.id,
            strategy,
            key,
            uploadId,
            preSignedUrls
        };
    } catch (error) {
        if (uploadId) {
            await abortMultipartUpload(key, uploadId);
        }

        await db.file.update({
            where: { id: file.id },
            data: { uploadStatus: "FAILED" }
        });

        throw new ApiError(status.INTERNAL_SERVER_ERROR, "Failed to initiate upload")
    }
};

// generate multipart URLs for multipart upload
/**
 * 
 * @param fileId 
 * @param parts 
 * @returns 
 */
export const getMultipartUrls = async (fileId: string, parts: number) => {

    const file = await db.file.findUnique({
        where: {
            id: fileId
        }
    })

    if (!file) {
        throw new ApiError(status.NOT_FOUND, "File not found")
    }
    if (file.uploadStrategy !== UploadStrategy.MULTI_PART || !file.uploadId) {
        throw new ApiError(status.BAD_REQUEST, "File is not a multipart file")
    }

    const urls: { partNumber: number, url: string }[] = [];

    for (let i = 1; i <= parts; i++) {
        const url = await getUploadPartUrl(file.storageKey, i, file.uploadId)
        urls.push({ partNumber: i, url })
    }
    return urls
}


//  complete object upload ( sing || multipart )
/**
 * 
 * @param fileId 
 * @param parts 
 */


export const complete = async (
    fileId: string,
    parts?: { ETag: string, PartNumber: number }[]
) => {

    return await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const file = await tx.file.findUnique({
            where: {
                id: fileId
            },
            select: {
                id: true,
                uploadStrategy: true,
                uploadId: true,
                storageKey: true,
                ownerId: true,
                size: true,
                uploadStatus: true,
                mimeType: true,
                filename: true,
                folderId: true,
            }


        })
        if (!file) {
            throw new ApiError(status.NOT_FOUND, "File not found")
        }


        if (file.uploadStatus === "COMPLETED") {
            throw new ApiError(status.BAD_REQUEST, "File already uploaded")
        }

        if (file.uploadStrategy === UploadStrategy.MULTI_PART) {
            if (!file.uploadId || !parts) {
                throw new ApiError(status.BAD_REQUEST, "Invalid file upload")
            }
            await completeMultiPartUpload(file.storageKey, file.uploadId, parts)
        }

        const updatedFile = await tx.file.update({
            where: { id: file.id },
            data: {
                uploadStatus: "COMPLETED",
                uploadedAt: new Date(),
            },
        });
        const updatedUser = await tx.user.update({
            where: { id: file.ownerId },
            data: {
                storageUsed: { increment: file.size },
            },
            select: { firebaseUid: true }
        });

        await redis.delete(`user:${updatedUser.firebaseUid}`);

        return new ApiResponse(status.OK, "File uploaded successfully", updatedFile)

    })

}


// abort upload
/**
 * @param fileId 
 * @returns 
 */

export const abortUpload = async (fileId: string) => {
    const file = await db.file.findUnique({
        where: {
            id: fileId
        }
    })

    if (!file) {
        throw new ApiError(status.NOT_FOUND, "File not found")
    }

    if (file.uploadStrategy === UploadStrategy.MULTI_PART || file.uploadId) {
        if (file.uploadId) {
            await abortMultipartUpload(file.storageKey, file.uploadId)
        }
    } else {
        // delete single part object if exists
        await deleteObject(file.storageKey)
    }

    // save final meta data to db
    await db.file.update({
        where: { id: fileId },
        data: {
            uploadStatus: "FAILED"
        }
    })

    return new ApiResponse(status.OK, "File uploaded successfully", file)
}

