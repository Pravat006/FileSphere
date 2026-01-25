import api from "@/lib/axios";

export const authService = {
    login: async (data: any) => {
        const response = await api.post("/auth/login-admin", data);
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get("/auth/get-admin-profile");
        return response.data;
    },
    logout: async () => {
        await api.post("/auth/logout");
    },
    refreshToken: async () => {
        const res = await api.post("/auth/refresh-tokens")
        return res.data
    }
};
