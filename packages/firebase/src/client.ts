import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
    getAuth,
    Auth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    User,
    Persistence,
    initializeAuth,
    signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
    signInWithCredential,
    // createUserWithEmailAndPassword,
    deleteUser
} from "firebase/auth";

export interface FirebaseClientConfig {
    apiKey: string | undefined;
    authDomain: string | undefined;
    projectId: string | undefined;
    appId: string | undefined;
}

let auth: Auth;
let googleProvider: GoogleAuthProvider;

// Add generic persistence support
export const initializeFirebaseClient = (
    config: FirebaseClientConfig,
    persistence?: Persistence
) => {
    let app: FirebaseApp;
    if (getApps().length === 0) {
        app = initializeApp(config);
    } else {
        app = getApp();
    }

    if (!auth) {
        if (persistence) {
            // React Native Path - persistence needs to be in an array
            try {
                auth = initializeAuth(app, {
                    persistence: [persistence]
                });
            } catch (e: any) {
                if (e.code === 'auth/already-initialized') {
                    auth = getAuth(app);
                } else {
                    throw e;
                }
            }
        } else {
            // Web/Default Path
            auth = getAuth(app);
        }
    }

    return auth;
};


const ensureAuthInitialized = () => {
    if (typeof window === "undefined") return;
    if (!auth) {
        // In case it hasn't been initialized yet, we try to get it from the default app
        if (getApps().length > 0) {
            auth = getAuth(getApp());
        } else {
            throw new Error("Firebase client has not been initialized.");
        }
    }
    if (!googleProvider) {
        googleProvider = new GoogleAuthProvider();
    }
};

export const signInWithGoogle = async () => {
    ensureAuthInitialized();
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { user: result.user, error: null };
    } catch (error: any) {
        return { user: null, error: error.message };
    }
};

export const signInWithEmailAndPassword = async (email: string, password: string) => {
    ensureAuthInitialized();
    try {
        const result = await firebaseSignInWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error: any) {
        return { user: null, error: error.message };
    }
};

export const registerWithEmailAndPassword = async (email: string, password: string) => {
    ensureAuthInitialized();
    try {
        const { createUserWithEmailAndPassword, sendEmailVerification } = await import("firebase/auth");
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Send verification email automatically after signup
        await sendEmailVerification(result.user);

        return { user: result.user, error: null };
    } catch (error: any) {
        return { user: null, error: error.message };
    }
};

// Send email verification
export const sendVerificationEmail = async () => {
    ensureAuthInitialized();
    try {
        const { sendEmailVerification } = await import("firebase/auth");
        const user = auth.currentUser;
        if (!user) {
            return { error: 'No user is currently signed in' };
        }
        if (user.emailVerified) {
            return { error: 'Email is already verified' };
        }
        await sendEmailVerification(user);
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
};

// Reload user to get updated emailVerified status
export const reloadUser = async () => {
    ensureAuthInitialized();
    try {
        const user = auth.currentUser;
        if (!user) {
            return { error: 'No user is currently signed in' };
        }
        await user.reload();
        return { user: auth.currentUser, error: null };
    } catch (error: any) {
        return { user: null, error: error.message };
    }
};

// For React Native Google Sign-In (using expo-auth-session or similar)
export const signInWithGoogleCredential = async (idToken: string) => {
    ensureAuthInitialized();
    try {
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        return { user: result.user, error: null };
    } catch (error: any) {
        return { user: null, error: error.message };
    }
};

export const handleSignOut = async () => {
    ensureAuthInitialized();
    try {
        await signOut(auth);
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
};

export const onFirebaseAuthStateChanged = (callback: (user: User | null) => void) => {
    if (typeof window === "undefined") return () => { };
    ensureAuthInitialized();
    return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = async () => {
    ensureAuthInitialized();
    return auth?.currentUser;
}

export const deleteCurrentUser = async () => {
    ensureAuthInitialized();
    try {
        const user = auth.currentUser;
        if (!user) {
            return { error: 'No user is currently signed in' };
        }
        await deleteUser(user);
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
};

export { handleSignOut as signOut };
export type { User };