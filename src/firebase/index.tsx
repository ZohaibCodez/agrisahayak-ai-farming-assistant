
'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import LoadingSpinner from '@/components/agrisahayak/loading-spinner';

// 1. Define the context shape
interface FirebaseContextType {
  auth: Auth;
  db: Firestore;
  app: FirebaseApp;
}

interface AuthContextType {
  user: User | null;
  isUserLoading: boolean;
}

// 2. Create the contexts
const FirebaseContext = createContext<FirebaseContextType | null>(null);
const AuthContext = createContext<AuthContextType | null>(null);

// 3. Create the Provider components
function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseContextType | null>(null);

  useEffect(() => {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const auth = getAuth(app);
    const db = getFirestore(app);

    setFirebase({ auth, db, app });
  }, []);

  if (!firebase) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner message="Connecting to services..." />
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const firebase = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    if (firebase) {
      const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
        setUser(user);
        setIsUserLoading(false);
      });
      return () => unsubscribe();
    }
  }, [firebase]);

  return (
    <AuthContext.Provider value={{ user, isUserLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Top-level provider that combines both
export function AppFirebaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </FirebaseProvider>
  );
}

// 4. Create the custom hooks
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
