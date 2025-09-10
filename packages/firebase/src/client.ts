import { initializeApp, FirebaseApp } from "firebase/app";
import {
    getAuth,
    Auth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    User
} from "firebase/auth";

// Define the config type for clarity
export interface FirebaseClientConfig {
    apiKey: string | undefined;
    authDomain: string | undefined;
    projectId: string | undefined;
    appId: string | undefined;
}

// These will be initialized later
let auth: Auth;
const googleProvider = new GoogleAuthProvider();


//  Initializes the Firebase client app. This must be called once in your application's entry point.

export const initializeFirebaseClient = (config: FirebaseClientConfig) => {
    if (auth) {
        console.warn("Firebase client already initialized.");
        return;
    }
    const app: FirebaseApp = initializeApp(config);
    auth = getAuth(app);
    console.log("Firebase Client Initialized");
};


// This helper ensures that if auth has been initialized before use.
const ensureAuthInitialized = () => {
    if (!auth) {
        throw new Error("Firebase client has not been initialized. Please call initializeFirebaseClient in your app's entry point (e.g., main.tsx).");
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

// Renamed to avoid conflict with the original onAuthStateChanged
export const onFirebaseAuthStateChanged = (callback: (user: User | null) => void) => {
    ensureAuthInitialized();
    return onAuthStateChanged(auth, callback);
};
export const getCurrentUser = async () => {
    ensureAuthInitialized();
    return auth.currentUser;
}


export { handleSignOut as signOut };
export type { User };