import { getFirestore, serverTimestamp, type Firestore, type Timestamp } from 'firebase/firestore';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';

let dbInstance: Firestore | undefined;
let appInstance: FirebaseApp | undefined;

// Shared Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string | undefined,
};

export function getApp(): FirebaseApp {
  if (!appInstance) {
    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is required');
    }
    
    console.log("Firebase config:", {
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      hasApiKey: !!firebaseConfig.apiKey,
      hasAuthDomain: !!firebaseConfig.authDomain
    });
    
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return appInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) {
    const app = getApp();
    dbInstance = getFirestore(app);
  }
  return dbInstance!;
}

export const now = () => serverTimestamp();
export type FirestoreTimestamp = Timestamp;


