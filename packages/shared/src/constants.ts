import z from "zod"

export const allowedMimeTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/bmp",
    "image/tiff",

    // Documents
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-powerpoint", // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "text/plain",
    "application/rtf",

    // Archives
    "application/zip",
    "application/x-rar-compressed",
    "application/gzip",
    "application/x-7z-compressed",

    // Videos
    "video/mp4",
    "video/quicktime",
    "video/mkv",
    "video/x-msvideo", // .avi
    "video/webm",
    "video/x-ms-wmv",

    // Audio
    "audio/mpeg", // .mp3
    "audio/wav",
    "audio/ogg",
    "audio/aac",
    "audio/flac",

    // Optional fonts / creative assets
    "font/ttf",
    "font/woff",
    "font/woff2"
] as const;


export const planTypeEnum = z.enum(["FREE", "PRO", "ENTERPRISE"])

export const FileTypeEnum = z.enum(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT"])

export const FileAccessEnum = z.enum(["PUBLIC", "PRIVATE"])

export const TransactionStatusEnum = z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"])

export type PlanType = z.infer<typeof planTypeEnum>
export type FileType = z.infer<typeof FileTypeEnum>
export type FileAccess = z.infer<typeof FileAccessEnum>
export type TransactionStatus = z.infer<typeof TransactionStatusEnum>