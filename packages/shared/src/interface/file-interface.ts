
import { IUser } from './auth-interface';

// Enums
export enum FileType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO',
    DOCUMENT = 'DOCUMENT'
}

// Interfaces
export interface IFolder {
    id: string;
    name: string;
    owner?: IUser;
    ownerId: string;
    files?: IFile[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IFile {
    id: string;
    filename: string;
    cloudUrl: string;
    size: bigint;
    fileType: FileType;
    owner?: IUser;
    ownerId: string;
    folder?: IFolder | null;
    folderId?: string | null;
    mimeType: string;
    uploadedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    isInTrash: boolean;
    originalFolderId?: string | null;
    deletedAt?: Date | null;
}
