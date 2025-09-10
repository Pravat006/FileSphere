interface SubscriptionHistory {
    id: string;
    userId: string;
    planId: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

interface CreateSubscriptionHistoryRequest {
    userId: string;
    planId: string;
    startDate: Date;
    endDate: Date;
}

interface UpdateSubscriptionHistoryRequest {
    planId?: string;
    startDate?: Date;
    endDate?: Date;
}

interface DeleteSubscriptionHistoryRequest {
    id: string;
}

export { SubscriptionHistory, CreateSubscriptionHistoryRequest, UpdateSubscriptionHistoryRequest, DeleteSubscriptionHistoryRequest };