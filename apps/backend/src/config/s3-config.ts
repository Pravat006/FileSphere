import { GetObjectCommand, S3Client, CreateMultipartUploadCommand, PutObjectCommand, AbortMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import config from "./index";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
    region: config.AWS_REGION,
    credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY
    }
})

import { UploadStrategy } from "@repo/db";

const MB = 1024n * 1024n;

export const decideStrategy = (size: bigint): UploadStrategy => {
    const MULTIPART_THRESHOLD = 100n * MB;

    if (size < MULTIPART_THRESHOLD) {
        return UploadStrategy.SINGLE_PART;
    }
    return UploadStrategy.MULTI_PART;
};


//  single part upload presigned URL
/**
 * 
 * @param key 
 * @param contentType 
 * @param expiresIn 
 * @returns 
 */
export const getPutObjectUrl = async (key: string, contentType: string, expiresIn = 600) => {
    const command = new PutObjectCommand({
        Bucket: config.S3_BUCKET_NAME,
        Key: key,
        ContentType: contentType
    });
    return getSignedUrl(s3Client, command, { expiresIn });
}

// create multipart upload
/**
 * 
 * @param key 
 * @param contentType 
 * @returns 
 */
export const createMultipartUpload = async (key: string, contentType: string) => {
    const command = new CreateMultipartUploadCommand({
        Bucket: config.S3_BUCKET_NAME,
        Key: key,
        ContentType: contentType
    });
    return await s3Client.send(command)
}

// generate presigned url for a part
/**
 * 
 * @param key 
 * @param partNumber 
 * @param uploadId 
 * @param expiresIn 
 * @returns 
 */
export const getUploadPartUrl = async (key: string, partNumber: number, uploadId: string, expiresIn = 600) => {
    const command = new UploadPartCommand({
        Bucket: config.S3_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber
    });
    return getSignedUrl(s3Client, command, { expiresIn });
}

// complete multipart uplload
/**
 * 
 * @param key 
 * @param uploadId 
 * @param parts 
 * @returns 
 */
export const completeMultiPartUpload = async (
    key: string,
    uploadId: string,
    parts: { ETag: string, PartNumber: number }[]
) => {
    const command = new CompleteMultipartUploadCommand({
        Bucket: config.S3_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts }
    })
    return s3Client.send(command)
}

// abort a multipart upload
/**
 * 
 * @param key 
 * @param uploadId 
 * @returns 
 */
export const abortMultipartUpload = async (key: string, uploadId: string) => {
    const command = new AbortMultipartUploadCommand({
        Bucket: config.S3_BUCKET_NAME,
        Key: key,
        UploadId: uploadId
    });
    return await s3Client.send(command)
}

// get presigned url to download an object
/**
 * 
 * @param key 
 * @param expiresIn 
 * @returns 
 */
export const getObjectUrl = async (key: string, expiresIn = 3600) => {
    const command = new GetObjectCommand({
        Bucket: config.S3_BUCKET_NAME,
        Key: key
    })
    return getSignedUrl(s3Client, command, {
        expiresIn
    })
}

// delete single-part object 
/**
 * 
 * @param key 
 * @returns 
 */
export const deleteObject = async (key: string) => {
    const command = new DeleteObjectCommand({
        Bucket: config.S3_BUCKET_NAME,
        Key: key
    });
    return await s3Client.send(command)
}
