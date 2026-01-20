import { z } from "zod";
import { allowedMimeTypes } from "../constants";

export const initiateUploadSchema = z.object({
    filename: z.string().min(1, "Filename is required"),
    size: z.number().nonnegative("Size must be a positive number"), // or z.string() if expecting huge files as string
    mimeType: z.enum(allowedMimeTypes as unknown as [string, ...string[]], {
        errorMap: () => ({ message: "Unsupported file type" })
    }),
});

export const completeUploadPartSchema = z.object({
    ETag: z.string(),
    PartNumber: z.number().int().positive()
});

export const completeUploadSchema = z.object({
    fileId: z.string().cuid("Invalid File ID"),
    parts: z.array(completeUploadPartSchema).min(1, "At least one part is required") // optional? logical to have at least 1 part if completing
});

export const abortUploadSchema = z.object({
    fileId: z.string().cuid("Invalid File ID")
});

export type InitiateUploadSchema = z.infer<typeof initiateUploadSchema>;
export type CompleteUploadPartSchema = z.infer<typeof completeUploadPartSchema>;
export type CompleteUploadSchema = z.infer<typeof completeUploadSchema>;
export type AbortUploadSchema = z.infer<typeof abortUploadSchema>;
