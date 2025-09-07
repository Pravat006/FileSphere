declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FIREBASE_API_KEY?: string;
      FIREBASE_AUTH_DOMAIN?: string;
      FIREBASE_PROJECT_ID?: string;
      FIREBASE_APP_ID?: string;
      VITE_FIREBASE_API_KEY?: string;
      VITE_FIREBASE_AUTH_DOMAIN?: string;
      VITE_FIREBASE_PROJECT_ID?: string;
      VITE_FIREBASE_APP_ID?: string;
    }
  }
}

export {};
