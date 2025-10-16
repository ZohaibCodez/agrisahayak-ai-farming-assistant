export type Report = {
  id: string;
  crop: string;
  diagnosis: string;
  status: 'Complete' | 'Processing' | 'Error';
  imageUrl: string;
  date: string;
};

export const mockRecentReports: Report[] = [
  {
    id: '1',
    crop: 'Cotton',
    diagnosis: 'Cotton Leaf Curl Virus',
    status: 'Complete',
    imageUrl: 'https://picsum.photos/seed/101/100/100',
    date: '2 days ago',
  },
  {
    id: '2',
    crop: 'Wheat',
    diagnosis: 'Yellow Rust',
    status: 'Complete',
    imageUrl: 'https://picsum.photos/seed/102/100/100',
    date: '5 days ago',
  },
  {
    id: '3',
    crop: 'Rice',
    diagnosis: 'Processing...',
    status: 'Processing',
    imageUrl: 'https://picsum.photos/seed/103/100/100',
    date: '1 hour ago',
  },
  {
    id: '4',
    crop: 'Sugarcane',
    diagnosis: 'Red Rot',
    status: 'Error',
    imageUrl: 'https://picsum.photos/seed/104/100/100',
    date: '1 week ago',
  },
];

export type Supplier = {
  name: string;
  distance: number;
  products: string[];
  totalCost: number;
  rating: number;
  phone: string;
  whatsappLink: string;
};

export const mockSuppliers: Supplier[] = [
    {
      name: "Punjab Seed Corporation",
      distance: 5.2,
      products: ["Fungicide XYZ", "Sprayer"],
      totalCost: 2300,
      rating: 4.5,
      phone: "+923001234567",
      whatsappLink: "https://wa.me/923001234567"
    },
    {
      name: "Faisalabad Kisan Store",
      distance: 8.1,
      products: ["Pesticide ABC", "Gloves"],
      totalCost: 1950,
      rating: 4.2,
      phone: "+923017654321",
      whatsappLink: "https://wa.me/923017654321"
    },
    {
      name: "Chaudhry Agro Services",
      distance: 12.5,
      products: ["Fungicide XYZ", "Pesticide ABC", "Sprayer"],
      totalCost: 3800,
      rating: 4.8,
      phone: "+923335556677",
      whatsappLink: "https://wa.me/923335556677"
    }
];

export type AdminLog = {
  id: string;
  agentName: 'ingestAgent' | 'diagnosticAgent' | 'actionPlannerAgent' | 'marketplaceAgent' | 'coordinatorAgent';
  action: string;
  reportId: string;
  status: 'success' | 'error';
  duration: number;
  timestamp: string;
}

export const mockAdminLogs: AdminLog[] = [
  { id: '1', agentName: 'ingestAgent', action: 'image_upload', reportId: 'RPT001', status: 'success', duration: 120, timestamp: '2024-05-21T10:00:00Z' },
  { id: '2', agentName: 'diagnosticAgent', action: 'diagnosis_completed', reportId: 'RPT001', status: 'success', duration: 4500, timestamp: '2024-05-21T10:00:05Z' },
  { id: '3', agentName: 'actionPlannerAgent', action: 'treatment_planned', reportId: 'RPT001', status: 'success', duration: 3200, timestamp: '2024-05-21T10:00:08Z' },
  { id: '4', agentName: 'marketplaceAgent', action: 'marketplace_ready', reportId: 'RPT001', status: 'success', duration: 1500, timestamp: '2024-05-21T10:00:10Z' },
  { id: '5', agentName: 'ingestAgent', action: 'image_upload', reportId: 'RPT002', status: 'success', duration: 150, timestamp: '2024-05-21T10:02:00Z' },
  { id: '6', agentName: 'diagnosticAgent', action: 'diagnosis_completed', reportId: 'RPT002', status: 'error', duration: 5000, timestamp: '2024-05-21T10:02:05Z' },
];

export const mockChartData = [
    { date: 'Mon', reports: 12 },
    { date: 'Tue', reports: 19 },
    { date: 'Wed', reports: 15 },
    { date: 'Thu', reports: 22 },
    { date: 'Fri', reports: 18 },
    { date: 'Sat', reports: 25 },
    { date: 'Sun', reports: 16 },
];
