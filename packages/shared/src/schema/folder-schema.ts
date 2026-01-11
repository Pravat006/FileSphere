import z from "zod";

export const folderSchema = z.object({
    id: z.string().cuid(),
    name: z.string().min(1),
    ownerId: z.string().cuid(),
    parentFolderId: z.string().cuid().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const createFolderSchema = z.object({
    name: z.string().min(1, "Folder name is required"),
    parentFolderId: z.string().cuid().optional(),
});

export const updateFolderSchema = z.object({
    name: z.string().min(1, "Folder name is required").optional(),
    parentFolderId: z.string().cuid().nullable().optional(),
});

export type FolderSchema = z.infer<typeof folderSchema>;
export type CreateFolderSchema = z.infer<typeof createFolderSchema>;
export type UpdateFolderSchema = z.infer<typeof updateFolderSchema>;

// Request types for backend
export type CreateFolderRequest = CreateFolderSchema;
export type UpdateFolderRequest = UpdateFolderSchema;
