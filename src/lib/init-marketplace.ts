/**
 * Initialize marketplace by seeding suppliers to Firestore
 * Run this once to populate the database with sample suppliers
 */

import { seedSuppliers } from '@/ai/flows/marketplace-agent';

export async function initializeMarketplace() {
  try {
    console.log('Initializing marketplace...');
    await seedSuppliers();
    console.log('Marketplace initialized successfully!');
    return true;
  } catch (error) {
    console.error('Failed to initialize marketplace:', error);
    return false;
  }
}

// Export for use in components or API routes
export { seedSuppliers };
