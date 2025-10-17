import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { getDb } from './firestore';
import type { UserProfile, DiagnosisReport } from './models';

// Profiles
export async function getProfile(uid: string): Promise<UserProfile | null> {
  const db = getDb();
  const ref = doc(db, 'profiles', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function upsertProfile(profile: Partial<UserProfile> & { uid: string; phone: string }): Promise<void> {
  const db = getDb();
  const ref = doc(db, 'profiles', profile.uid);
  const now = serverTimestamp();
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, { ...profile, updatedAt: now } as any);
  } else {
    await setDoc(ref, { uid: profile.uid, phone: profile.phone, name: '', location: '', language: 'english', crops: [], createdAt: now, updatedAt: now, ...profile } as any);
  }
}

// Reports
export async function createReport(uid: string, data: Omit<DiagnosisReport, 'id' | 'uid' | 'status' | 'createdAt' | 'updatedAt'> & { status?: DiagnosisReport['status'] }): Promise<string> {
  const db = getDb();
  const ref = collection(db, 'users', uid, 'reports');
  const now = serverTimestamp();
  const docRef = await addDoc(ref, { uid, ...data, status: data.status ?? 'Complete', createdAt: now, updatedAt: now } as any);
  return docRef.id;
}

export async function listRecentReports(uid: string, max: number = 10): Promise<DiagnosisReport[]> {
  const db = getDb();
  const ref = collection(db, 'users', uid, 'reports');
  const q = query(ref, orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as DiagnosisReport));
}


