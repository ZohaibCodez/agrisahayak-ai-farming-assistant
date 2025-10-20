
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

export async function getTotalReportsCount(uid: string): Promise<number> {
  const db = getDb();
  const ref = collection(db, 'users', uid, 'reports');
  const snap = await getDocs(ref);
  return snap.size;
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

// Suppliers - Enhanced with full Firestore integration
export async function seedSuppliers(suppliers: Omit<Supplier, 'id'>[]): Promise<void> {
    const db = getDb();
    const ref = collection(db, 'suppliers');
    const existing = await getDocs(ref);
    if (existing.empty) {
        console.log("Seeding suppliers...");
        for (const supplier of suppliers) {
            await addDoc(ref, {
                ...supplier,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
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

export async function getSupplierById(supplierId: string): Promise<Supplier | null> {
    const db = getDb();
    const ref = doc(db, 'suppliers', supplierId);
    const snap = await getDoc(ref);
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Supplier) : null;
}

export async function createSupplier(supplier: Omit<Supplier, 'id'>): Promise<string> {
    const db = getDb();
    const ref = collection(db, 'suppliers');
    const docRef = await addDoc(ref, {
        ...supplier,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return docRef.id;
}

export async function updateSupplier(supplierId: string, data: Partial<Supplier>): Promise<void> {
    const db = getDb();
    const ref = doc(db, 'suppliers', supplierId);
    await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp()
    });
}

export async function searchSuppliersByLocation(
    lat: number,
    lng: number,
    radiusKm: number = 50,
    filters?: {
        type?: string[];
        products?: string[];
        minRating?: number;
        maxDistance?: number;
    }
): Promise<Supplier[]> {
    const db = getDb();
    const ref = collection(db, 'suppliers');
    
    // Start with basic query
    let q = query(ref);
    
    // Apply filters if provided
    if (filters?.type && filters.type.length > 0) {
        q = query(ref, where('type', 'in', filters.type));
    }
    
    if (filters?.minRating) {
        q = query(ref, where('rating', '>=', filters.minRating));
    }
    
    const snap = await getDocs(q);
    const suppliers = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Supplier));
    
    // Calculate distances and filter by radius
    const suppliersWithDistance = suppliers
        .map(supplier => {
            const distance = calculateHaversineDistance(
                lat,
                lng,
                supplier.location.coordinates.lat,
                supplier.location.coordinates.lng
            );
            return { ...supplier, distance };
        })
        .filter(s => s.distance <= (filters?.maxDistance || radiusKm))
        .sort((a, b) => a.distance - b.distance);
    
    // Apply product filter if provided
    if (filters?.products && filters.products.length > 0) {
        return suppliersWithDistance.filter(supplier =>
            filters.products!.some(product =>
                supplier.products.some(p =>
                    p.toLowerCase().includes(product.toLowerCase())
                )
            )
        );
    }
    
    return suppliersWithDistance;
}

// Haversine distance calculation
function calculateHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers
    
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Marketplace helpers with real Firestore integration
export async function findSuppliersNearby(lat: number, lon: number, radiusKm: number = 50, maxResults: number = 20): Promise<Supplier[]> {
    return searchSuppliersByLocation(lat, lon, radiusKm, { maxDistance: radiusKm });
}

export async function createMarketplaceListing(listing: { 
    sellerId: string; 
    title: string; 
    description?: string; 
    price: number; 
    location?: string; 
    contact?: string; 
    tags?: string[]; 
    createdAt?: any 
}): Promise<string> {
    const db = getDb();
    const ref = collection(db, 'marketplace');
    const now = serverTimestamp();
    const docRef = await addDoc(ref, { 
        ...listing, 
        createdAt: listing.createdAt ?? now, 
        updatedAt: now,
        status: 'active' 
    } as any);
    return docRef.id;
}

export async function getMarketplaceListings(filters?: {
    sellerId?: string;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
}): Promise<any[]> {
    const db = getDb();
    const ref = collection(db, 'marketplace');
    let q = query(ref, where('status', '==', 'active'), orderBy('createdAt', 'desc'));
    
    if (filters?.sellerId) {
        q = query(ref, where('sellerId', '==', filters.sellerId), where('status', '==', 'active'));
    }
    
    const snap = await getDocs(q);
    let listings = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    
    // Apply client-side filters
    if (filters?.minPrice) {
        listings = listings.filter(l => l.price && l.price >= filters.minPrice!);
    }
    if (filters?.maxPrice) {
        listings = listings.filter(l => l.price && l.price <= filters.maxPrice!);
    }
    
    return listings;
}

// Contact/Communication functions
export async function createSupplierContact(contactData: {
    userId: string;
    supplierId: string;
    message: string;
    contactMethod: 'phone' | 'whatsapp' | 'email';
}): Promise<string> {
    const db = getDb();
    const ref = collection(db, 'supplier_contacts');
    const docRef = await addDoc(ref, {
        ...contactData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return docRef.id;
}

export async function getSupplierContactHistory(userId: string, supplierId?: string): Promise<any[]> {
    const db = getDb();
    const ref = collection(db, 'supplier_contacts');
    
    let q = supplierId 
        ? query(ref, where('userId', '==', userId), where('supplierId', '==', supplierId), orderBy('createdAt', 'desc'))
        : query(ref, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateSupplierRating(supplierId: string, userId: string, rating: number, review?: string): Promise<void> {
    const db = getDb();
    
    // Add rating to ratings collection
    const ratingsRef = collection(db, 'supplier_ratings');
    await addDoc(ratingsRef, {
        supplierId,
        userId,
        rating,
        review,
        createdAt: serverTimestamp()
    });
    
    // Calculate new average rating
    const allRatingsSnap = await getDocs(query(ratingsRef, where('supplierId', '==', supplierId)));
    const ratings = allRatingsSnap.docs.map(d => d.data().rating);
    const averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    
    // Update supplier's rating
    await updateSupplier(supplierId, { rating: Math.round(averageRating * 10) / 10 });
}


// Coordinator / Agent decision logging helper
export async function createAgentDecisionLog(agentName: AdminLog['agentName'], action: string, reportId?: string, payload?: Record<string, any>, status: AdminLog['status'] = 'info', duration?: number): Promise<string> {
    const db = getDb();
    const ref = collection(db, 'agent_decisions');
    const now = serverTimestamp();
    const docRef = await addDoc(ref, { agentName, action, reportId: reportId ?? null, payload: payload ?? {}, status, duration: duration ?? null, timestamp: now } as any);
    return docRef.id;
}

