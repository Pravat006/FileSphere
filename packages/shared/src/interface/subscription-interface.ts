import { IUser, IAdmin } from './auth-interface';

// Enums
export enum Plan {
    FREE = 'FREE',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE'
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED'
}

// Interfaces
export interface ISubscriptionPlan {
    id: string;
    planType: Plan;
    price: number;
    storageLimit: bigint;
    features: string[];
    createdAt: Date;
    updatedAt: Date;
    users?: IUser[];
    subscriptionHistory?: ISubscriptionHistory[];
    createdBy?: IAdmin;
    adminId: string;
}

export interface ISubscriptionHistory {
    id: string;
    userId: string;
    user?: IUser;
    planId: string;
    plan?: ISubscriptionPlan;
    startDate: Date;
    endDate?: Date | null;
    transactionId?: string | null;
    transaction?: ITransaction | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITransaction {
    id: string;
    price: number;
    subscriptionHistory?: ISubscriptionHistory | null;
    ownerId: string;
    owner?: IUser;
    status: TransactionStatus;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    razorpaySignature?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
