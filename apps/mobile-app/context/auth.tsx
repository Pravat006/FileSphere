import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth'; // Type only
import { onFirebaseAuthStateChanged, handleSignOut } from '@repo/firebase/client';
import { authService } from '@/services/auth.service';

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    signOut: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onFirebaseAuthStateChanged(async (user: User | null) => {
            if (user) {
                try {
                    await authService.createUser()
                } catch (error) {
                    console.error('❌ Failed to sync user with backend:', error);
                }
            }
            setUser(user);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        await handleSignOut();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
