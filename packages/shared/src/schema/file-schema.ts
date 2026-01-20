import { allowedMimeTypes, FileTypeEnum, FileAccessEnum } from "../constants";
import { z } from "zod";

export const fileSchema = z.object({
    id: z.string().cuid(),
    filename: z.string().min(1),
    storageKey: z.string().min(1),
    bucket: z.string().nullable(),
    region: z.string().nullable(),
    access: FileAccessEnum.default("PUBLIC"),
    size: z.bigint().nonnegative(),
    fileType: FileTypeEnum,
    ownerId: z.string().cuid(),
    folderId: z.string().cuid().nullable(),
    mimeType: z.enum(allowedMimeTypes, {
        errorMap: () => ({ message: "File type not supported" })
    }),
    uploadedAt: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
    isInTrash: z.boolean().default(false),
    originalFolderId: z.string().cuid().nullable(),
    deletedAt: z.date().nullable(),
})

export const createFileSchema = z.object({
    filename: z.string().min(1, "Filename is required"),
    storageKey: z.string().min(1, "Storage key is required"),
    bucket: z.string().optional(),
    region: z.string().optional(),
    access: FileAccessEnum.default("PUBLIC"),
    size: z.bigint().nonnegative(),
    fileType: FileTypeEnum,
    ownerId: z.string().cuid(),
    folderId: z.string().cuid().optional(),
    mimeType: z.string().min(1, "MIME type is required"),
});


export const updateFileSchema = z.object({
    filename: z.string().min(1).optional(),
    folderId: z.string().cuid().nullable().optional(),
});

export const restoreFromTrashSchema = z.object({
    fileId: z.string().cuid(),
    folderId: z.string().cuid().optional(),
});

export const bulkMoveToTrashSchema = z.object({
    fileIds: z.array(z.string().cuid()).min(1, "At least one file ID required"),
});

export const bulkDeleteSchema = z.object({
    fileIds: z.array(z.string().cuid()).min(1, "At least one file ID required"),
});


export const fileArraySchema = z.array(fileSchema);

export type FileSchema = z.infer<typeof fileSchema>
export type CreateFileSchema = z.infer<typeof createFileSchema>;
export type UpdateFileSchema = z.infer<typeof updateFileSchema>;
export type RestoreFromTrashSchema = z.infer<typeof restoreFromTrashSchema>;
export type BulkMoveToTrashSchema = z.infer<typeof bulkMoveToTrashSchema>;
export type BulkDeleteSchema = z.infer<typeof bulkDeleteSchema>;
export type FileArraySchema = z.infer<typeof fileArraySchema>;