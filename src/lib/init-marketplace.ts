/**
 * Initialize marketplace - no longer needed since we use external API
 * Keeping file for backward compatibility but functionality removed
 * Suppliers are now fetched from OpenStreetMap/Google Places in real-time
 */

export async function initializeMarketplace() {
  console.log('Marketplace uses external API - no initialization needed');
  return true;
}

// No seeding needed - using real-time external data
