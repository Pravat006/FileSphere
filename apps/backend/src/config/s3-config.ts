import { GetObjectCommand, S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import config from "./index";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
    region: config.AWS_REGION,
    credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY
    }
})

export const getObjectUrl = async (key: string) => {
    const command = new GetObjectCommand({
        Bucket: config.S3_BUCKET_NAME,
        Key: key
    })
    const url = await getSignedUrl(s3Client, command, {
        expiresIn: 60 * 60 // 1 hour
    })
    return url
}

export const initiateMultipartUpload = async (fileName: string, contentType: string) => {
    const key = `uploads/${Date.now()}-${fileName}`;
    const command = new CreateMultipartUploadCommand({
        Bucket: config.S3_BUCKET_NAME,
        Key: key,
        ContentType: contentType
    });
    const { UploadId } = await s3Client.send(command);
    return { UploadId, Key: key };
}

export const getMultipartPreSignedUrls = async (key: string, uploadId: string, parts: number) => {
    const promises = [];
    for (let i = 0; i < parts; i++) {
        const command = new UploadPartCommand({
            Bucket: config.S3_BUCKET_NAME,
            Key: key,
            UploadId: uploadId,
            PartNumber: i + 1,
        });
        promises.push(getSignedUrl(s3Client, command, { expiresIn: 3600 }));
    }
    return await Promise.all(promises);
}

export const completeMultipartUpload = async (key: string, uploadId: string, parts: { ETag: string, PartNumber: number }[]) => {
    const command = new CompleteMultipartUploadCommand({
        Bucket: config.S3_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
            Parts: parts
        }
    });
    return await s3Client.send(command);
}

export const abortMultipartUpload = async (key: string, uploadId: string) => {
    const command = new AbortMultipartUploadCommand({
        Bucket: config.S3_BUCKET_NAME,
        Key: key,
        UploadId: uploadId
    });
    return await s3Client.send(command);
}