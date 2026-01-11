import z from "zod"

export const allowedMimeTypes =
    [
        // Images
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",

        // Documents
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",        // .xlsx
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",// .pptx
        "text/plain",

        // Archives
        "application/zip",

        // Videos
        "video/mp4",
        "video/quicktime",
        "video/mkv",

        // Audio
        "audio/mpeg",
        "audio/wav"
    ] as const

export const planTypeEnum = z.enum(["FREE", "PRO", "ENTERPRISE"])

export const FileTypeEnum = z.enum(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT"])

export const TransactionStatusEnum = z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"])

export type PlanType = z.infer<typeof planTypeEnum>
export type FileType = z.infer<typeof FileTypeEnum>
export type TransactionStatus = z.infer<typeof TransactionStatusEnum>