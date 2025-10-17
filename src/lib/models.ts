// Firestore data models and converters

export type UserProfile = {
  uid: string;
  phone: string;
  name?: string;
  location?: string;
  language?: 'english' | 'urdu';
  crops?: string[];
  createdAt: any; // Firestore serverTimestamp
  updatedAt: any; // Firestore serverTimestamp
};

export type DiagnosisReport = {
  id: string;
  uid: string;
  crop?: string;
  imageUrl?: string; // storage url or data url persisted elsewhere
  disease: string;
  confidence: number; // 0-100
  affectedParts: string[];
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  plan?: {
    totalCost: number;
    timeline: string;
  };
  status: 'Complete' | 'Processing' | 'Error';
  createdAt: any;
  updatedAt: any;
};


