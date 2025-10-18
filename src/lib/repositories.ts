
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { getDb, getApp } from './firestore';
import type { UserProfile, DiagnosisReport, AdminLog, Supplier } from './models';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

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
    const { uid, phone, ...restProfile } = profile;
    await setDoc(ref, { 
      uid, 
      phone, 
      name: '', 
      location: 'Faisalabad, Punjab', 
      language: 'english', 
      crops: [], 
      createdAt: now, 
      updatedAt: now, 
      ...restProfile 
    } as any);
  }
}

// Reports
export async function createReport(uid: string, data: Omit<DiagnosisReport, 'id' | 'uid' | 'createdAt' | 'updatedAt'> & { status?: DiagnosisReport['status'] }): Promise<string> {
  const db = getDb();
  const ref = collection(db, 'users', uid, 'reports');
  const now = serverTimestamp();
  const docRef = await addDoc(ref, { uid, ...data, status: data.status ?? 'Processing', createdAt: now, updatedAt: now } as any);
  return docRef.id;
}

export async function updateReport(uid: string, reportId: string, data: Partial<DiagnosisReport>): Promise<void> {
    const db = getDb();
    const ref = doc(db, 'users', uid, 'reports', reportId);
    const now = serverTimestamp();
    await updateDoc(ref, { ...data, updatedAt: now });
}


export async function listRecentReports(uid: string, max: number = 10): Promise<DiagnosisReport[]> {
  const db = getDb();
  const ref = collection(db, 'users', uid, 'reports');
  const q = query(ref, orderBy('createdAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as DiagnosisReport));
}

export async function uploadReportImage(uid: string, reportId: string, file: File): Promise<string> {
    try {
        console.log("Initializing Firebase Storage...");
        const app = getApp();
        console.log("Firebase app initialized:", app.name);
        
        const storage = getStorage(app);
        console.log("Storage instance created");
        
        const path = `reports/${uid}/${reportId}/${file.name}`;
        console.log("Upload path:", path);
        
        const fileRef = storageRef(storage, path);
        console.log("File reference created");
        
        console.log("Starting file upload...");
        
        // Add timeout to prevent infinite hanging
        const uploadPromise = uploadBytes(fileRef, file);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
        );
        
        const snapshot = await Promise.race([uploadPromise, timeoutPromise]) as any;
        console.log("Upload completed:", snapshot.metadata.name);
        
        console.log("Getting download URL...");
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("Download URL obtained:", downloadURL);
        
        return downloadURL;
    } catch (error: any) {
        console.error("Upload error details:", {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        // Provide more specific error messages
        if (error.message.includes('timeout')) {
            throw new Error('Image upload timed out. Please check your internet connection and try again.');
        } else if (error.code === 'storage/unauthorized') {
            throw new Error('Upload failed: Unauthorized. Please check Firebase Storage rules.');
        } else if (error.code === 'storage/object-not-found') {
            throw new Error('Upload failed: Storage bucket not found. Please check Firebase configuration.');
        } else {
            throw new Error(`Image upload failed: ${error.message}`);
        }
    }
}

// Agent Logs
export async function createLog(logData: Omit<AdminLog, 'id' | 'timestamp'>): Promise<string> {
    const db = getDb();
    const ref = collection(db, 'logs');
    const now = serverTimestamp();
    const docRef = await addDoc(ref, { ...logData, timestamp: now });
    return docRef.id;
}

export async function listLogs(max: number = 50): Promise<AdminLog[]> {
    const db = getDb();
    const ref = collection(db, 'logs');
    const q = query(ref, orderBy('timestamp', 'desc'), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as AdminLog));
}

// Suppliers
export async function seedSuppliers(suppliers: Omit<Supplier, 'id'>[]): Promise<void> {
    const db = getDb();
    const ref = collection(db, 'suppliers');
    const existing = await getDocs(ref);
    if (existing.empty) {
        console.log("Seeding suppliers...");
        for (const supplier of suppliers) {
            await addDoc(ref, supplier);
        }
        console.log("Seeding complete.");
    }
}

export async function listSuppliers(): Promise<Supplier[]> {
    const db = getDb();
    const ref = collection(db, 'suppliers');
    const q = query(ref);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Supplier));
}

