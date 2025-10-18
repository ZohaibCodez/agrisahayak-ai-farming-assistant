
import { Supplier } from "./models";

export type Report = {
  id: string;
  crop: string;
  diagnosis: string;
  status: 'Complete' | 'Processing' | 'Error';
  imageUrl: string;
  date: string;
};

export const mockSuppliers: Omit<Supplier, 'id'>[] = [
    {
      name: "Punjab Seed Corporation",
      location: "Faisalabad",
      distance: 5.2,
      products: ["Fungicide XYZ", "Sprayer"],
      rating: 4.5,
      phone: "+923001234567",
      whatsappLink: "https://wa.me/923001234567"
    },
    {
      name: "Faisalabad Kisan Store",
      location: "Faisalabad",
      distance: 8.1,
      products: ["Pesticide ABC", "Gloves"],
      rating: 4.2,
      phone: "+923017654321",
      whatsappLink: "https://wa.me/923017654321"
    },
    {
      name: "Chaudhry Agro Services",
      location: "Faisalabad",
      distance: 12.5,
      products: ["Fungicide XYZ", "Pesticide ABC", "Sprayer"],
      rating: 4.8,
      phone: "+923335556677",
      whatsappLink: "https://wa.me/923335556677"
    }
];

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
