interface SubscriptionPlan {
    id: string;
    type: 'FREE' | 'PRO' | 'ENTERPRISE';
    price: number; // in rupees
    storageLimit: BigInt; // in bytes
    features: string[]; // List of features included in the plan
    createdAt: Date;
    updatedAt: Date;

}

// admin use only

interface CreateSubscriptionPlanRequest {
    type: 'FREE' | 'PRO' | 'ENTERPRISE';
    price: number; // in rupees
    storageLimit: BigInt; // in bytes
    features: string[]; // List of features included in the plan

}

interface UpdateSubscriptionPlanRequest {
    price?: number; // in rupees
    storageLimit?: BigInt; // in bytes
    features?: string[]; // List of features included in the plan

}

interface DeleteSubscriptionPlanRequest {
    id: string;
}

export { SubscriptionPlan, CreateSubscriptionPlanRequest, UpdateSubscriptionPlanRequest, DeleteSubscriptionPlanRequest };
