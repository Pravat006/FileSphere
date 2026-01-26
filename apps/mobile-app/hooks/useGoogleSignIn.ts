import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { signInWithGoogleCredential } from '@repo/firebase/client';

// Required for expo-auth-session to work properly
WebBrowser.maybeCompleteAuthSession();

export const useGoogleSignIn = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create redirect URI
    const redirectUri = makeRedirectUri({
        scheme: 'filesphere',
        path: 'auth'
    });

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
        {
            // Get these from Firebase Console -> Project Settings -> General
            clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
            // For iOS
            iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
            // For Android
            androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
            // Explicitly set the redirect URI
            redirectUri,
        }
    );

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleSignIn(id_token);
        } else if (response?.type === 'error') {
            setError('Google Sign-In failed');
            setIsLoading(false);
        }
    }, [response]);

    const handleGoogleSignIn = async (idToken: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await signInWithGoogleCredential(idToken);

            if (result.error) {
                setError(result.error);
            }

        } catch (err: any) {
            setError(err.message || 'An error occurred during sign in');
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await promptAsync();
        } catch (err: any) {
            setError(err.message || 'Failed to open Google Sign-In');
            setIsLoading(false);
        }
    };

    return {
        signInWithGoogle,
        isLoading,
        error,
        isReady: !!request,
    };
};
