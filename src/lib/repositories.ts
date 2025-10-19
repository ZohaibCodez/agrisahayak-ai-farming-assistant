
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
    } catch (error: unknown) {
        // Normalize error to avoid accessing properties on non-object errors
        const err = error as any;
        const message = typeof err?.message === 'string' ? err.message : String(err ?? 'Unknown error');
        const code = err?.code;
        const stack = err?.stack;

        console.error('Upload error details:', { message, code, stack, raw: err });
        
        // Provide more specific error messages
        if (message.includes('timeout')) {
            throw new Error('Image upload timed out. Please check your internet connection and try again.');
        } else if (code === 'storage/unauthorized') {
            throw new Error('Upload failed: Unauthorized. Please check Firebase Storage rules.');
        } else if (code === 'storage/object-not-found') {
            throw new Error('Upload failed: Storage bucket not found. Please check Firebase configuration.');
        } else {
            throw new Error(`Image upload failed: ${message}`);
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

// Marketplace helpers
// NOTE: This is a simple geo-distance filter using stored lat/lon on suppliers.
// For production, consider integrating with a geospatial index (e.g., Firestore GeoPoint + geohash library or Cloud Firestore's built-in support).
export async function findSuppliersNearby(lat: number, lon: number, radiusKm: number = 50, maxResults: number = 20): Promise<Supplier[]> {
    const db = getDb();
    const ref = collection(db, 'suppliers');
    const snap = await getDocs(ref);
    const suppliers = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Supplier & { lat?: number; lon?: number }));

    function haversine(aLat: number, aLon: number, bLat: number, bLon: number) {
        const toRad = (v: number) => (v * Math.PI) / 180;
        const R = 6371; // km
        const dLat = toRad(bLat - aLat);
        const dLon = toRad(bLon - aLon);
        const lat1 = toRad(aLat);
        const lat2 = toRad(bLat);
        const sinDLat = Math.sin(dLat / 2) * Math.sin(dLat / 2);
        const sinDLon = Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const a = sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    const results = suppliers
        .map(s => ({ ...s, distance: typeof s.lat === 'number' && typeof s.lon === 'number' ? haversine(lat, lon, s.lat, s.lon) : Infinity }))
        .filter(s => s.distance !== Infinity && s.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, maxResults)
        .map(s => ({ id: s.id, name: s.name, location: s.location, distance: Math.round((s.distance ?? 0) * 10) / 10, products: s.products, rating: s.rating, phone: s.phone, whatsappLink: s.whatsappLink } as Supplier));

    return results;
}

export async function createMarketplaceListing(listing: { sellerId: string; title: string; description?: string; price: number; location?: string; contact?: string; tags?: string[]; createdAt?: any }): Promise<string> {
    const db = getDb();
    const ref = collection(db, 'marketplace');
    const now = serverTimestamp();
    const docRef = await addDoc(ref, { ...listing, createdAt: listing.createdAt ?? now, status: 'active' } as any);
    return docRef.id;
}

// Coordinator / Agent decision logging helper
export async function createAgentDecisionLog(agentName: AdminLog['agentName'], action: string, reportId?: string, payload?: Record<string, any>, status: AdminLog['status'] = 'info', duration?: number): Promise<string> {
    const db = getDb();
    const ref = collection(db, 'agent_decisions');
    const now = serverTimestamp();
    const docRef = await addDoc(ref, { agentName, action, reportId: reportId ?? null, payload: payload ?? {}, status, duration: duration ?? null, timestamp: now } as any);
    return docRef.id;
}

