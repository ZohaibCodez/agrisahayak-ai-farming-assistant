import { NextRequest, NextResponse } from 'next/server';
import { fetchRealSuppliersFromGooglePlaces, fetchRealSuppliersFromOpenStreetMap } from '@/lib/external-suppliers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '31.5204');
    const lng = parseFloat(searchParams.get('lng') || '74.3587');
    const radius = parseInt(searchParams.get('radius') || '50000'); // meters
    const source = searchParams.get('source') || 'auto'; // 'google', 'osm', or 'auto'

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    let suppliers;

    if (source === 'google' || source === 'auto') {
      // Try Google Places first
      suppliers = await fetchRealSuppliersFromGooglePlaces(lat, lng, radius);
    }

    // If Google fails or returns empty, fall back to OSM
    if (!suppliers || suppliers.length === 0) {
      suppliers = await fetchRealSuppliersFromOpenStreetMap(lat, lng, radius);
    }

    return NextResponse.json({
      success: true,
      count: suppliers.length,
      source: suppliers.length > 0 ? 'external' : 'fallback',
      suppliers
    });

  } catch (error) {
    console.error('Error fetching real suppliers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch suppliers',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
