# Firebase Authentication Examples

## React Component Example

```tsx
import React, { useState, useEffect } from 'react';
import { 
  signIn, 
  signUp, 
  signInWithGoogle,
  logOut, 
  onAuthStateChange,
  getCurrentUser 
} from '@repo/firebase/auth';
import type { User } from 'firebase/auth';

export function AuthComponent() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { user, error } = await signIn(email, password);
    if (error) {
      alert('Sign in failed: ' + error);
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { user, error } = await signUp(email, password);
    if (error) {
      alert('Sign up failed: ' + error);
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    const { user, error } = await signInWithGoogle();
    if (error) {
      alert('Google sign in failed: ' + error);
    }
    
    setLoading(false);
  };

  const handleSignOut = async () => {
    const { error } = await logOut();
    if (error) {
      alert('Sign out failed: ' + error);
    }
  };

  if (user) {
    return (
      <div>
        <h2>Welcome, {user.displayName || user.email}!</h2>
        <p>UID: {user.uid}</p>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Sign In</h2>
      <form onSubmit={handleSignIn}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        <button type="button" onClick={handleSignUp} disabled={loading}>
          Sign Up
        </button>
      </form>
      
      <button onClick={handleGoogleSignIn} disabled={loading}>
        Sign In with Google
      </button>
    </div>
  );
}
```

## Next.js API Route Example

```typescript
// pages/api/auth/verify.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCurrentUser } from '@repo/firebase/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getCurrentUser();
  
  if (user) {
    res.status(200).json({ 
      authenticated: true, 
      uid: user.uid, 
      email: user.email 
    });
  } else {
    res.status(401).json({ authenticated: false });
  }
}
```

## Express.js Middleware Example

```typescript
import { Request, Response, NextFunction } from 'express';
import { getCurrentUser } from '@repo/firebase/auth';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = getCurrentUser();
  
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};
```
