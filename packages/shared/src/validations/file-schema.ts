import { z } from "zod";

export const fileSchema = z.object({
    originalname: z.string(),
    mimetype: z.enum([
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        // "image/webp",
        // "image/tiff",
        // "image/bmp",
        "image/svg+xml",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        // "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        // "text/plain",
        // "text/csv",
        // "text/html",
        "application/zip",
        // "application/x-rar-compressed",
        "video/mp4",
        // "video/mpeg",
        // "video/quicktime",
        "video/x-msvideo",
        "video/x-ms-wmv",
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
    ]),
    size: z.number().max(104857600)
});



export const fileArraySchema = z.array(fileSchema);

export type FileSchema = z.infer<typeof fileSchema>;
export type FileArraySchema = z.infer<typeof fileArraySchema>;