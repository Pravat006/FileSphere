import { IFolder, IFile } from './file-interface';
import { ISubscriptionPlan, ISubscriptionHistory, ITransaction } from './subscription-interface';

export interface IAdmin {
    id: string;
    email: string;
    name: string;
    password?: string; // Should be handled carefully, usually not sent to frontend
    createdAt: Date;
    updatedAt: Date;
    subscriptionPlans?: ISubscriptionPlan[];
}

export interface IUser {
    id: string;
    firebaseUid: string;
    email: string;
    name?: string | null;
    planId?: string | null;
    plan?: ISubscriptionPlan | null;
    folders?: IFolder[];
    files?: IFile[];
    transactions?: ITransaction[];
    storageUsed: bigint; // Note: BigInt needs special handling in JSON
    createdAt: Date;
    updatedAt: Date;
    subscriptions?: ISubscriptionHistory[];
}
