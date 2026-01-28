import { initializeFirebaseClient } from '@repo/firebase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { getReactNativePersistence } = require('@firebase/auth');

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let isInitialized = false;

export const initializeFirebase = () => {
    if (!isInitialized) {
        try {
            const persistence = getReactNativePersistence(AsyncStorage);
            initializeFirebaseClient(firebaseConfig, persistence);
            isInitialized = true;
            console.log('Firebase initialized successfully with AsyncStorage persistence');
        } catch (error) {
            console.error(' Firebase initialization error:', error);
            throw error;
        }
    }
};

initializeFirebase();