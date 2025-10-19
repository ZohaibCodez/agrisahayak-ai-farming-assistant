import { z } from "zod";
import { ai } from "@/ai/genkit";

// Marketplace Agent Schemas
export const SupplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['supplier', 'buyer', 'logistics']),
  location: z.object({
    address: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }),
    city: z.string(),
    province: z.string()
  }),
  products: z.array(z.string()),
  services: z.array(z.string()),
  contact: z.object({
    phone: z.string(),
    email: z.string().optional(),
    whatsapp: z.string().optional()
  }),
  rating: z.number().min(0).max(5),
  distance: z.number().optional(),
  availability: z.enum(['available', 'busy', 'unavailable']),
  pricing: z.object({
    competitive: z.boolean(),
    notes: z.string().optional()
  }),
  verification: z.object({
    verified: z.boolean(),
    documents: z.array(z.string()).optional()
  })
});

export const MarketplaceSearchSchema = z.object({
  query: z.string(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    radius: z.number().default(50) // km
  }),
  filters: z.object({
    type: z.array(z.string()).optional(),
    products: z.array(z.string()).optional(),
    minRating: z.number().optional(),
    maxDistance: z.number().optional()
  }).optional()
});

export const MarketplaceResultSchema = z.object({
  suppliers: z.array(SupplierSchema),
  totalCount: z.number(),
  searchRadius: z.number(),
  recommendations: z.array(z.string()),
  marketInsights: z.object({
    averagePricing: z.string(),
    availability: z.string(),
    trends: z.array(z.string())
  })
});

export type Supplier = z.infer<typeof SupplierSchema>;
export type MarketplaceSearch = z.infer<typeof MarketplaceSearchSchema>;
export type MarketplaceResult = z.infer<typeof MarketplaceResultSchema>;

// Mock supplier data (in production, this would come from Firestore)
const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "supplier-1",
    name: "Green Valley Seeds & Fertilizers",
    type: "supplier",
    location: {
      address: "123 Agriculture Road, Model Town",
      coordinates: { lat: 31.5204, lng: 74.3587 },
      city: "Lahore",
      province: "Punjab"
    },
    products: ["Seeds", "Fertilizers", "Pesticides", "Farming Tools"],
    services: ["Delivery", "Consultation", "Bulk Orders"],
    contact: {
      phone: "+92-300-1234567",
      email: "info@greenvalley.com",
      whatsapp: "+92-300-1234567"
    },
    rating: 4.5,
    availability: "available",
    pricing: {
      competitive: true,
      notes: "Best prices in the area"
    },
    verification: {
      verified: true,
      documents: ["Business License", "Tax Certificate"]
    }
  },
  {
    id: "supplier-2",
    name: "Crop Care Solutions",
    type: "supplier",
    location: {
      address: "456 Farm Street, Gulberg",
      coordinates: { lat: 31.5204, lng: 74.3587 },
      city: "Lahore",
      province: "Punjab"
    },
    products: ["Pesticides", "Herbicides", "Plant Protection"],
    services: ["Spraying Service", "Crop Monitoring", "Expert Consultation"],
    contact: {
      phone: "+92-300-2345678",
      whatsapp: "+92-300-2345678"
    },
    rating: 4.2,
    availability: "available",
    pricing: {
      competitive: true
    },
    verification: {
      verified: true
    }
  },
  {
    id: "buyer-1",
    name: "Fresh Harvest Buyers",
    type: "buyer",
    location: {
      address: "789 Market Square, Anarkali",
      coordinates: { lat: 31.5204, lng: 74.3587 },
      city: "Lahore",
      province: "Punjab"
    },
    products: ["Wheat", "Rice", "Cotton", "Vegetables"],
    services: ["Direct Purchase", "Fair Pricing", "Transportation"],
    contact: {
      phone: "+92-300-3456789",
      whatsapp: "+92-300-3456789"
    },
    rating: 4.7,
    availability: "available",
    pricing: {
      competitive: true,
      notes: "Premium prices for quality produce"
    },
    verification: {
      verified: true,
      documents: ["Trading License", "Bank Guarantee"]
    }
  },
  {
    id: "logistics-1",
    name: "Agri Transport Services",
    type: "logistics",
    location: {
      address: "321 Transport Hub, Ravi Road",
      coordinates: { lat: 31.5204, lng: 74.3587 },
      city: "Lahore",
      province: "Punjab"
    },
    products: [],
    services: ["Crop Transportation", "Cold Storage", "Market Delivery"],
    contact: {
      phone: "+92-300-4567890",
      whatsapp: "+92-300-4567890"
    },
    rating: 4.0,
    availability: "available",
    pricing: {
      competitive: true
    },
    verification: {
      verified: true
    }
  }
];

// Marketplace Agent Flow
export const marketplaceAgent = ai.defineFlow(
  {
    name: "marketplaceAgent",
    inputSchema: MarketplaceSearchSchema,
    outputSchema: MarketplaceResultSchema,
  },
  async (input) => {
    try {
      // Step 1: Find suppliers within radius
      const nearbySuppliers = findSuppliersInRadius(
        MOCK_SUPPLIERS,
        input.location,
        input.filters?.maxDistance || input.location.radius
      );
      
      // Step 2: Filter by search criteria
      const filteredSuppliers = filterSuppliers(nearbySuppliers, input);
      
      // Step 3: Calculate distances
      const suppliersWithDistance = calculateDistances(filteredSuppliers, input.location);
      
      // Step 4: Generate AI recommendations
      const recommendations = await generateRecommendations(input, suppliersWithDistance);
      
      // Step 5: Generate market insights
      const marketInsights = await generateMarketInsights(suppliersWithDistance);
      
      return {
        suppliers: suppliersWithDistance,
        totalCount: suppliersWithDistance.length,
        searchRadius: input.location.radius,
        recommendations,
        marketInsights
      };
    } catch (error) {
      console.error('Marketplace search error:', error);
      throw new Error(`Marketplace search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Helper Functions
function findSuppliersInRadius(suppliers: Supplier[], location: { lat: number; lng: number }, radiusKm: number): Supplier[] {
  return suppliers.filter(supplier => {
    const distance = calculateDistance(
      location.lat,
      location.lng,
      supplier.location.coordinates.lat,
      supplier.location.coordinates.lng
    );
    return distance <= radiusKm;
  });
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function filterSuppliers(suppliers: Supplier[], search: MarketplaceSearch): Supplier[] {
  let filtered = suppliers;
  
  if (search.filters?.type && search.filters.type.length > 0) {
    filtered = filtered.filter(supplier => 
      search.filters!.type!.includes(supplier.type)
    );
  }
  
  if (search.filters?.products && search.filters.products.length > 0) {
    filtered = filtered.filter(supplier =>
      search.filters!.products!.some(product =>
        supplier.products.some(supplierProduct =>
          supplierProduct.toLowerCase().includes(product.toLowerCase())
        )
      )
    );
  }
  
  if (search.filters?.minRating) {
    filtered = filtered.filter(supplier => supplier.rating >= search.filters!.minRating!);
  }
  
  return filtered;
}

function calculateDistances(suppliers: Supplier[], location: { lat: number; lng: number }): Supplier[] {
  return suppliers.map(supplier => ({
    ...supplier,
    distance: calculateDistance(
      location.lat,
      location.lng,
      supplier.location.coordinates.lat,
      supplier.location.coordinates.lng
    )
  })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

async function generateRecommendations(search: MarketplaceSearch, suppliers: Supplier[]): Promise<string[]> {
  try {
    const prompt = ai.definePrompt({
      name: 'marketplaceRecommendations',
      input: {schema: z.object({})},
      output: {schema: z.object({recommendations: z.array(z.string())})},
      prompt: `Based on this marketplace search, provide 3-5 recommendations for farmers:
      
      Search Query: ${search.query}
      Location: ${search.location.lat}, ${search.location.lng}
      Found Suppliers: ${suppliers.length}
      
      Supplier Types: ${suppliers.map(s => s.type).join(', ')}
      Available Products: ${suppliers.flatMap(s => s.products).join(', ')}
      
      Provide practical recommendations for farmers looking for these products/services.
      
      Respond with JSON: {"recommendations": ["recommendation1", "recommendation2", ...]}`
    });
    
    const {output} = await prompt({});
    return output?.recommendations || [];
  } catch (error) {
    console.error('Recommendation generation error:', error);
    return [
      "Compare prices from multiple suppliers",
      "Check supplier ratings and reviews",
      "Verify product quality before bulk purchase",
      "Consider delivery costs in total price"
    ];
  }
}

async function generateMarketInsights(suppliers: Supplier[]): Promise<{
  averagePricing: string;
  availability: string;
  trends: string[];
}> {
  try {
    const prompt = ai.definePrompt({
      name: 'marketplaceInsights',
      input: {schema: z.object({})},
      output: {schema: z.object({
        averagePricing: z.string(),
        availability: z.string(),
        trends: z.array(z.string())
      })},
      prompt: `Analyze this marketplace data and provide market insights:
      
      Total Suppliers: ${suppliers.length}
      Supplier Types: ${suppliers.map(s => s.type).join(', ')}
      Average Rating: ${(suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)}
      Verified Suppliers: ${suppliers.filter(s => s.verification.verified).length}
      
      Provide insights about pricing, availability, and market trends.
      
      Respond with JSON: {
        "averagePricing": "string",
        "availability": "string", 
        "trends": ["trend1", "trend2", ...]
      }`
    });
    
    const {output} = await prompt({});
    return output || {
      averagePricing: "Contact suppliers for current pricing",
      availability: `${suppliers.length} suppliers found`,
      trends: ["Market prices vary by season", "Quality products command premium prices"]
    };
  } catch (error) {
    console.error('Market insights generation error:', error);
    return {
      averagePricing: "Contact suppliers for current pricing",
      availability: `${suppliers.length} suppliers found`,
      trends: ["Market prices vary by season", "Quality products command premium prices"]
    };
  }
}

// Additional utility functions
export async function createSupplierListing(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
  const newSupplier: Supplier = {
    ...supplier,
    id: `supplier-${Date.now()}`,
    verification: {
      verified: false,
      documents: []
    }
  };
  
  // In production, save to Firestore
  return newSupplier;
}

export async function updateSupplierRating(supplierId: string, newRating: number): Promise<boolean> {
  // In production, update in Firestore
  console.log(`Updating rating for supplier ${supplierId} to ${newRating}`);
  return true;
}

export async function sendMessageToSupplier(supplierId: string, message: string): Promise<boolean> {
  // In production, integrate with messaging service
  console.log(`Sending message to supplier ${supplierId}: ${message}`);
  return true;
}
