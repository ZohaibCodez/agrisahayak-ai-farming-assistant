"use server";

import { marketplaceAgent, Supplier } from "@/ai/flows/marketplace-agent";
import { createSupplierContact } from "@/lib/repositories";

export async function searchSuppliers(
  query: string,
  location?: { lat: number; lng: number; radius?: number },
  filters?: {
    type?: string[];
    minRating?: number;
    products?: string[];
    services?: string[];
  }
): Promise<{
  suppliers: Supplier[];
  message?: string;
  recommendations?: string[];
  marketInsights?: {
    averagePricing: string;
    availability: string;
    trends: string[];
  };
}> {
  try {
    const normalizedLocation = location ? { lat: location.lat, lng: location.lng, radius: location.radius ?? 50 } : undefined;
    const normalizedFilters = filters ? {
      type: filters.type as ("supplier" | "buyer" | "logistics")[] | undefined,
      minRating: filters.minRating,
      products: filters.products,
      maxDistance: filters?.minRating ? undefined : undefined // placeholder to keep schema compatible
    } : undefined;

    const result = await marketplaceAgent({
      query,
      location: normalizedLocation as any,
      filters: normalizedFilters as any,
    });

    return result;
  } catch (error) {
    console.error('Marketplace search error:', error);
    return {
      suppliers: [],
      message: 'Failed to search suppliers. Please try again.',
    };
  }
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  try {
    // This would typically fetch from a database
    // For now, return null as we don't have a database implementation
    return null;
  } catch (error) {
    console.error('Get supplier error:', error);
    return null;
  }
}

export async function generateNegotiationMessage(
  supplierName: string,
  products: string[],
  quantity?: string,
  priceRange?: string
): Promise<string> {
  try {
    // Simple template-based message generation for client-side use
    const productsText = products.join(', ');
    const quantityText = quantity ? `I need approximately ${quantity}.` : '';
    const budgetText = priceRange ? `My budget is around ${priceRange}.` : '';
    
    return `السلام علیکم,

I am interested in purchasing ${productsText}. ${quantityText} ${budgetText}

Please share your best rates and availability at your earliest convenience.

JazakAllah.`;
  } catch (error) {
    console.error('Error generating message:', error);
    return `السلام علیکم, I am interested in purchasing ${products.join(', ')}. Please share your best rates and availability.`;
  }
}

export async function sendMessageToSupplier(
  userId: string,
  supplierId: string,
  message: string,
  contactMethod: 'phone' | 'whatsapp' | 'email' = 'whatsapp'
): Promise<boolean> {
  try {
    await createSupplierContact({
      userId,
      supplierId,
      message,
      contactMethod
    });
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}
