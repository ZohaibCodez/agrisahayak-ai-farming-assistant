import { getFirebaseApp } from './firebase';
import { getFirestore, serverTimestamp, type Firestore, type Timestamp } from 'firebase/firestore';

let dbInstance: Firestore | undefined;

export function getDb(): Firestore {
  if (!dbInstance) {
    const app = getFirebaseApp();
    dbInstance = getFirestore(app);
  }
  return dbInstance!;
}

export const now = () => serverTimestamp();
export type FirestoreTimestamp = Timestamp;


