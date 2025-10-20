
// Firestore data models and converters

export type UserProfile = {
  uid: string;
  phone: string;
  name?: string;
  location?: string;
  lat?: number;
  lon?: number;
  language?: 'english' | 'urdu';
  crops?: string[];
  createdAt: any; // Firestore serverTimestamp
  updatedAt: any; // Firestore serverTimestamp
};

export type TreatmentStep = {
  stepNumber: number;
  title: string;
  description: string;
  materials: string[];
  cost: number;
  timing: string;
  safetyNotes: string;
};

export type DiagnosisReport = {
  id: string;
  uid:string;
  crop?: string;
  imageThumb?: string;
  symptoms?: string;
  imageUrl?: string; // storage url or data url persisted elsewhere
  disease: string;
  confidence: number; // 0-100
  affectedParts: string[];
  severity: 'None' | 'Low' | 'Medium' | 'High';
  description: string;
  plan?: {
    steps: TreatmentStep[];
    totalCost: number;
    timeline: string;
    preventionTips: string[];
  };
  status: 'Complete' | 'Processing' | 'Error' | 'Pending';
  createdAt: any;
  updatedAt: any;
};

export type AdminLog = {
  id: string;
  agentName: 'ingestAgent' | 'diagnosticAgent' | 'actionPlannerAgent' | 'marketplaceAgent' | 'coordinatorAgent';
  action: string;
  reportId?: string;
  status: 'success' | 'error' | 'info';
  duration?: number;
  timestamp: any;
  payload?: Record<string, any>;
};

export type Supplier = {
  id: string;
  name: string;
  type: 'supplier' | 'buyer' | 'logistics';
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    city: string;
    province: string;
  };
  products: string[];
  services: string[];
  contact: {
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  rating: number;
  distance?: number;
  availability: 'available' | 'busy' | 'unavailable';
  pricing: {
    competitive: boolean;
    notes?: string;
  };
  verification: {
    verified: boolean;
    documents?: string[];
  };
};
