
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
  severity: 'Low' | 'Medium' | 'High';
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
  location: string;
  distance: number;
  products: string[];
  rating: number;
  phone: string;
  whatsappLink: string;
};
