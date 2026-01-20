import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
    getAuth,
    Auth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    User
} from "firebase/auth";

export interface FirebaseClientConfig {
    apiKey: string | undefined;
    authDomain: string | undefined;
    projectId: string | undefined;
    appId: string | undefined;
}

let auth: Auth;
let googleProvider: GoogleAuthProvider;

export const initializeFirebaseClient = (config: FirebaseClientConfig) => {
    if (typeof window === "undefined") return;

    let app: FirebaseApp;
    if (getApps().length === 0) {
        app = initializeApp(config);
    } else {
        app = getApp();
    }

    if (!auth) {
        auth = getAuth(app);
    }

    if (!googleProvider) {
        googleProvider = new GoogleAuthProvider();
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

export { handleSignOut as signOut };
export type { User };