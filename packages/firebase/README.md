# Firebase Authentication Package

This package provides Firebase Authentication configuration for the FileSphere project.

## Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration in `.env`:
   ```env
   FIREBASE_API_KEY=your_api_key_here
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_APP_ID=your_app_id
   ```

## Usage

### Import Firebase Authentication:

```typescript
import { auth } from '@repo/firebase';
import app from '@repo/firebase';
```

### Available exports:

- `auth` - Firebase Authentication service
- `app` - Firebase App instance

### Authentication Utilities:

Import pre-built authentication functions:

```typescript
import { 
  signIn, 
  signUp, 
  signInWithGoogle,
  logOut, 
  resetPassword,
  onAuthStateChange,
  getCurrentUser,
  isAuthenticated 
} from '@repo/firebase/auth';
```

### Example Authentication Usage:

```typescript
// Using auth utilities (recommended)
import { signIn, signUp, logOut, onAuthStateChange } from '@repo/firebase/auth';

// Sign in
const handleSignIn = async () => {
  const { user, error } = await signIn('user@example.com', 'password');
  if (error) {
    console.error('Sign in failed:', error);
  } else {
    console.log('Signed in:', user);
  }
};

// Sign up
const handleSignUp = async () => {
  const { user, error } = await signUp('user@example.com', 'password', 'John Doe');
  if (error) {
    console.error('Sign up failed:', error);
  } else {
    console.log('Account created:', user);
  }
};

// Google Sign In
const handleGoogleSignIn = async () => {
  const { user, error } = await signInWithGoogle();
  if (error) {
    console.error('Google sign in failed:', error);
  } else {
    console.log('Signed in with Google:', user);
  }
};

// Sign out
const handleSignOut = async () => {
  const { error } = await logOut();
  if (error) {
    console.error('Sign out failed:', error);
  }
};

// Listen to auth changes
onAuthStateChange((user) => {
  if (user) {
    console.log('User signed in:', user);
  } else {
    console.log('User signed out');
  }
});
```

### Direct Firebase Auth Usage:

```typescript
// Using Firebase Auth directly
import { auth } from '@repo/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

// Sign in
const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in:', userCredential.user);
  } catch (error) {
    console.error('Sign in error:', error);
  }
};
```

## Environment Variables

The package supports both standard environment variables and Vite-prefixed variables:

- `FIREBASE_API_KEY` or `VITE_FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN` or `VITE_FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID` or `VITE_FIREBASE_PROJECT_ID`
- `FIREBASE_APP_ID` or `VITE_FIREBASE_APP_ID`

## Getting Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on "Config" for your web app
6. Copy the configuration values to your `.env` file
