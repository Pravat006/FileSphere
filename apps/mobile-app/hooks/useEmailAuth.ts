import { useState } from 'react';
import { signInWithEmailAndPassword, registerWithEmailAndPassword } from '@repo/firebase/client';
import { authService } from '@/services/auth.service';

export const useEmailAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Sign in with Firebase
            const result = await signInWithEmailAndPassword(email, password);
            if (result.error) throw new Error(result.error);

            return { user: result.user, error: null };
        } catch (err: any) {
            const message = err.message || 'Failed to sign in';
            setError(message);
            return { user: null, error: message };
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Create account in Firebase
            const result = await registerWithEmailAndPassword(email, password);
            if (result.error) throw new Error(result.error);

            // 2. Call backend to create user record immediately
            await authService.createUser();

            return { user: result.user, error: null };
        } catch (err: any) {
            const message = err.message || 'Failed to sign up';
            setError(message);
            return { user: null, error: message };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        signIn,
        signUp,
        isLoading,
        error
    };
};
