import api from "@/lib/axios";

export interface SubscriptionPlan {
    id: string;
    planType: "FREE" | "PRO" | "ENTERPRISE";
    price: number;
    storageLimit: string; // BigInt handled as string in JSON
    features: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreatePlanRequest {
    planType: string;
    price: number;
    storageLimit: number; // Bytes
    features: string[];
}

export interface UpdatePlanRequest {
    price?: number;
    storageLimit?: number;
    features?: string[];
}

export const planService = {
    getAll: async () => {
        const response = await api.get("/plan");
        return response.data;
    },

    create: async (data: CreatePlanRequest) => {
        const response = await api.post("/plan", data);
        return response.data;
    },

    update: async (id: string, data: UpdatePlanRequest) => {
        const response = await api.patch(`/plan/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/plan/${id}`);
        return response.data;
    }
};
