import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminUser {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    setAuth: (admin: AdminUser) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            admin: null,
            isAuthenticated: false,
            setAuth: (admin) => {
                set({ admin, isAuthenticated: true });
            },
            logout: () => {
                set({ admin: null, isAuthenticated: false });
                window.location.href = '/signin';
            },
        }),
        {
            name: 'admin-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
