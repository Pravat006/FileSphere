interface File {
    id: string;
    filename: string;
    cloudUrl: string;
    size: number; // in bytes
    type: string; // image/video/pdf etc.
    folderId: string;
    mimeType: string;
    uploadedAt: Date;
    createdAt: Date;
    isInTrash: boolean;
    trashId?: string | null; // points to the trash entry if isInTrash is true
    originalFolderId?: string | null; // to restore from trash
    deletedAt?: Date | null; // when the file was moved to trash
}


interface CreateFileRequest {
    filename: string;
    size: number; // in bytes
    type: string; // image/video/pdf etc.
    folderId: string;
    mimeType: string;
}

interface UpdateFileRequest {
    filename?: string;
    folderId?: string;
}

interface DeleteFileRequest {
    id: string;
}

interface RestoreFileRequest {
    id: string;
}

interface PermanentlyDeleteFileRequest {
    id: string;
}

interface MoveFileToTrashRequest {
    id: string;
    trashId: string;
}

export { File, CreateFileRequest, UpdateFileRequest, DeleteFileRequest, RestoreFileRequest, PermanentlyDeleteFileRequest, MoveFileToTrashRequest };
