import { initializeFirebaseClient } from "@repo/firebase/client";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
};

export const initFirebase = () => {
    initializeFirebaseClient(firebaseConfig);
};
