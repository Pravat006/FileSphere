// Re-export types from shared package
import type {
    IUser,
    IAdmin,
    IFile,
    IFolder,
    ISubscriptionPlan,
    ISubscriptionHistory,
    ITransaction,
} from '@repo/shared';

export type {
    IUser,
    IAdmin,
    IFile,
    IFolder,
    ISubscriptionPlan,
    ISubscriptionHistory,
    ITransaction,
} from '@repo/shared';

// API Response wrapper (matches backend ApiResponse)
export interface ApiResponse<T = any> {
    statusCode: number;
    message: string;
    data?: T;
    success: boolean;
}

// Type aliases for convenience - using the imported types
export type User = IUser;
export type File = IFile;
export type Folder = IFolder;
export type SubscriptionPlan = ISubscriptionPlan;
export type Subscription = ISubscriptionHistory;
export type Transaction = ITransaction;
export type Admin = IAdmin;

// API Error response
export interface ApiErrorResponse {
    statusCode: number;
    message: string;
    errors?: any[];
    stack?: string;
}
