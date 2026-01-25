"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

interface AdminUser {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = "filesphere_admin_user";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();
    const pathname = usePathname();

    // Load initial state from localStorage safely after mount to avoid hydration mismatch
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setAdmin(parsed);
                    setIsAuthenticated(true);
                } catch (e) {
                    localStorage.removeItem(ADMIN_STORAGE_KEY);
                }
            }
        }
    }, []);

    // Persist admin to localStorage when it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (admin) {
                localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
            } else {
                localStorage.removeItem(ADMIN_STORAGE_KEY);
            }
        }
    }, [admin]);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setAdmin(null);
            setIsAuthenticated(false);
            localStorage.removeItem(ADMIN_STORAGE_KEY);
            toast.success("Logged out successfully");
            if (pathname !== "/login") {
                router.push("/login");
            }
        }
    }, [router, pathname]);

    const setAuth = useCallback((adminData: AdminUser) => {
        setAdmin(adminData);
        setIsAuthenticated(true);
    }, []);

    const refreshProfile = useCallback(async () => {
        console.log("[AUTH-CONTEXT] refreshing profile...");
        try {
            const res = await authService.getProfile();
            console.log("[AUTH-CONTEXT] profile res:", res);
            if (res && res.data) {
                setAuth(res.data);
            } else {
                throw new Error("Invalid profile response structure");
            }
        } catch (error: any) {
            console.error("[AUTH-CONTEXT] profile refresh failed:", error?.message || error);
            // Only logout if we are not on the login page
            if (pathname !== "/login") {
                console.warn("[AUTH-CONTEXT] logging out due to refresh failure");
                logout();
            }
        } finally {
            setIsLoading(false);
        }
    }, [logout, setAuth, pathname]);

    const login = async (data: any) => {
        try {
            const response = await authService.login(data);
            if (response.success) {
                const adminData = response.data;
                setAuth(adminData);
                toast.success("Login successful");
                router.push("/dashboard");
            }
        } catch (error: any) {
            const message = error.response?.data?.message || "Login failed";
            toast.error(message);
            throw error;
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const hasAuthFlag = localStorage.getItem(ADMIN_STORAGE_KEY);
            // Always try to refresh if we have the hint or are in a protected area
            if (hasAuthFlag || pathname.startsWith("/dashboard") || pathname === "/") {
                await refreshProfile();
            } else {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [refreshProfile, pathname]);

    // Handle initial loading state for protected routes
    if (isLoading && (pathname.startsWith("/dashboard") || pathname === "/")) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ admin, isAuthenticated, isLoading, login, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
