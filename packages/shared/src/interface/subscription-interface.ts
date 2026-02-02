import { PlanType, TransactionStatus } from '../constants';
import { IUser, IAdmin } from './auth-interface';


// Interfaces
export interface ISubscriptionPlan {
    id: string;
    planType: PlanType;
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

export interface ITransactionHistoryItem {
    id: string;
    planId: string;
    transactionId: string | null;
    startDate: string;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
    plan: {
        id: string;
        planType: string | PlanType;
        price: number;
        features: string[];
        storageLimit: string;
    };
    transaction: {
        id: string;
        amount: number;
        status: string;
    } | null;
}
