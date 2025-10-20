
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Phone, MessageCircle, Clock, Truck, Award, Users, Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import LoadingSpinner from "./loading-spinner";
import { searchSuppliers } from "@/lib/actions/marketplace-actions";
import ContactSupplierDialog from "./contact-supplier-dialog";

// Use the unified Supplier type from models
import type { Supplier } from "@/lib/models";
import { useAuth } from "@/firebase";
import { getProfile } from "@/lib/repositories";
import { UserProfile } from "@/lib/models";

export default function SuppliersCard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; city?: string } | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Get user's real-time GPS location
    useEffect(() => {
        const getUserLocation = async () => {
            setLocationLoading(true);
            
            // First, try to get location from user profile
            if (profile?.lat && profile?.lon) {
                setUserLocation({
                    lat: profile.lat,
                    lng: profile.lon,
                    city: profile.location || undefined
                });
                setLocationLoading(false);
                return;
            }
            
            // If not in profile, try to get browser geolocation
            if ('geolocation' in navigator) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 300000 // 5 minutes cache
                        });
                    });
                    
                    const { latitude, longitude } = position.coords;
                    
                    // Reverse geocode to get city name
                    const city = await getCityFromCoordinates(latitude, longitude);
                    
                    setUserLocation({
                        lat: latitude,
                        lng: longitude,
                        city
                    });
                    
                    setLocationError(null);
                } catch (error) {
                    console.error('Geolocation error:', error);
                    setLocationError('Unable to get your location. Using default location.');
                    
                    // Fallback to default location (Lahore, Pakistan)
                    setUserLocation({
                        lat: 31.5204,
                        lng: 74.3587,
                        city: 'Lahore'
                    });
                }
            } else {
                setLocationError('Geolocation not supported by browser');
                // Fallback to default location
                setUserLocation({
                    lat: 31.5204,
                    lng: 74.3587,
                    city: 'Lahore'
                });
            }
            
            setLocationLoading(false);
        };
        
        getUserLocation();
    }, [profile]);

    useEffect(() => {
        if (user && !profile) {
            getProfile(user.uid).then(setProfile);
        }
    }, [user, profile]);

    useEffect(() => {
        let cancel = false;
        const fetchSuppliers = async () => {
            try {
                setLoading(true);
                
                // Wait for location to be available
                if (locationLoading || !userLocation) {
                    return;
                }
                
                // Fetch REAL suppliers from the internet using external API
                const response = await fetch(
                    `/api/suppliers/real?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${50000}` // 50km in meters
                );
                
                const data = await response.json();
                
                if (!cancel && data.success && data.suppliers) {
                    setSuppliers(data.suppliers);
                } else {
                    // Fallback to database search if external API fails
                    const result = await searchSuppliers(
                        searchQuery || 'agricultural supplies',
                        {
                            lat: userLocation.lat,
                            lng: userLocation.lng,
                            radius: 50
                        },
                        {
                            type: filterType === 'all' ? undefined : [filterType as 'supplier' | 'buyer' | 'logistics'],
                            minRating: 3.0
                        }
                    );
                    
                    if (!cancel) {
                        setSuppliers(result.suppliers);
                    }
                }
            } catch (error) {
                console.error('Error fetching suppliers:', error);
                if (!cancel) {
                    setSuppliers([]);
                }
            } finally {
                if (!cancel) {
                    setLoading(false);
                }
            }
        };

        fetchSuppliers();

        return () => {
            cancel = true;
        };
    }, [userLocation, locationLoading, searchQuery, filterType]);
    
    // Helper function to get city name from coordinates
    const getCityFromCoordinates = async (lat: number, lng: number): Promise<string> => {
        try {
            // Using OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'AgriSahayak/1.0'
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                const city = data.address?.city || 
                            data.address?.town || 
                            data.address?.village || 
                            data.address?.state || 
                            'Unknown Location';
                return city;
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        }
        return 'Unknown Location';
    };

    return (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl">
                                <Truck className="h-6 w-6 text-blue-600"/>
                            </div>
                            Nearby Suppliers
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            {locationLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                    Detecting your location...
                                </span>
                            ) : userLocation ? (
                                <div className="space-y-1">
                                    <span className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-green-600" />
                                        <span className="font-medium text-green-700">
                                            {userLocation.city || 'Your Location'}
                                        </span>
                                        <span className="text-gray-500">
                                            • {suppliers.length} verified suppliers sorted by distance
                                        </span>
                                    </span>
                                    <p className="text-xs text-blue-600 flex items-center gap-1">
                                        <Award className="h-3 w-3" />
                                        All suppliers are verified real businesses in Pakistan
                                    </p>
                                </div>
                            ) : (
                                <span className="text-amber-600">Location unavailable - showing default results</span>
                            )}
                        </CardDescription>
                        {locationError && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                ⚠️ {locationError}
                            </p>
                        )}
                    </div>
                    <Badge variant="secondary" className="px-3 py-1 text-sm">
                        <Users className="h-4 w-4 mr-1"/>
                        {suppliers.length} Available
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
                {locationLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <LoadingSpinner message="Getting your location and finding nearby suppliers..." variant="sparkle" />
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center p-12">
                        <LoadingSpinner message="Finding local suppliers..." variant="sparkle" />
                    </div>
                ) : suppliers.length > 0 ? (
                    <div className="grid gap-4">
                        {suppliers.map((supplier, index) => (
                            <SupplierCard key={supplier.id} supplier={supplier} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Truck className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">No suppliers found in your area.</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {userLocation ? 
                                `Try expanding your search radius beyond ${userLocation.city}` : 
                                'Enable location access to find nearby suppliers'
                            }
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const SupplierCard = ({ supplier, index }: { supplier: Supplier, index: number }) => {
    const { user } = useAuth();
    
    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return "text-green-600 bg-green-100";
        if (rating >= 4.0) return "text-blue-600 bg-blue-100";
        if (rating >= 3.5) return "text-yellow-600 bg-yellow-100";
        return "text-gray-600 bg-gray-100";
    };

    const getDistanceColor = (distance: number | undefined) => {
        if (!distance) return "text-gray-600 bg-gray-100";
        if (distance <= 5) return "text-green-600 bg-green-100";
        if (distance <= 15) return "text-blue-600 bg-blue-100";
        return "text-orange-600 bg-orange-100";
    };

    const getSupplierTypeLabel = (type: string) => {
        const typeMap: Record<string, string> = {
            'supplier': 'Supplier',
            'buyer': 'Buyer',
            'logistics': 'Logistics'
        };
        return typeMap[type] || 'Supplier';
    };

    const getRatingLabel = (rating: number) => {
        if (rating >= 4.5) return 'Excellent';
        if (rating >= 4.0) return 'Good';
        if (rating >= 3.5) return 'Fair';
        return 'Poor';
    };

    return (
        <div className="group border rounded-xl p-6 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-gray-200">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Supplier Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                                {supplier.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                        {supplier.distance !== undefined ? `${supplier.distance.toFixed(1)} km away` : 'Distance unknown'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                    <span className="text-sm font-medium">
                                        {supplier.rating && supplier.rating > 0 ? supplier.rating.toFixed(1) : 'No rating'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                            <Badge className={`px-2 py-1 text-xs ${getRatingColor(supplier.rating || 0)}`}>
                                <Award className="h-3 w-3 mr-1" />
                                {getRatingLabel(supplier.rating || 0)}
                            </Badge>
                            <Badge variant="secondary" className="px-2 py-1 text-xs">
                                {getSupplierTypeLabel(supplier.type)}
                            </Badge>
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Available Products
                        </h4>
                            <div className="flex flex-wrap gap-2">
                                {(supplier.products || []).map((product, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {product}
                                    </Badge>
                                ))}
                            </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 lg:w-48">
                        <Button 
                            variant="default" 
                            size="sm" 
                            asChild 
                            className="flex-1 group-hover:bg-green-600 transition-colors"
                        >
                            <a href={`tel:${supplier.contact.phone}`}>
                                <Phone className="mr-2 h-4 w-4" /> 
                                Call Now
                            </a>
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            asChild 
                            className="flex-1 group-hover:border-green-500 group-hover:text-green-600 transition-colors"
                        >
                            <a href={`https://wa.me/${supplier.contact.whatsapp || supplier.contact.phone}`} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="mr-2 h-4 w-4" /> 
                                WhatsApp
                            </a>
                        </Button>
                        <ContactSupplierDialog 
                            supplier={supplier} 
                            userId={user?.uid}
                            defaultProducts={(supplier.products || []).slice(0, 1)}
                        />
                </div>
            </div>
        </div>
    );
}
