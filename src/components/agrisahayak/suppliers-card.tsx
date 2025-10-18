
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listSuppliers, seedSuppliers } from "@/lib/repositories";
import { Supplier } from "@/lib/models";
import { mockSuppliers } from "@/lib/data";
import { MapPin, Star, Phone, MessageCircle, Clock, Truck, Award, Users } from "lucide-react";
import { useEffect, useState } from "react";
import LoadingSpinner from "./loading-spinner";

export default function SuppliersCard() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancel = false;
        const fetchSuppliers = async () => {
            try {
                // Seed the database with mock data if it's empty
                await seedSuppliers(mockSuppliers);

                const fetchedSuppliers = await listSuppliers();
                if (!cancel) {
                    setSuppliers(fetchedSuppliers);
                }
            } catch (error) {
                console.error("Failed to fetch suppliers:", error);
            } finally {
                if (!cancel) {
                    setLoading(false);
                }
            }
        };
        fetchSuppliers();
        return () => { cancel = true; };
    }, []);

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
                            Find trusted local suppliers for your treatment plan materials.
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1 text-sm">
                        <Users className="h-4 w-4 mr-1"/>
                        {suppliers.length} Available
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
                {loading ? (
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
                        <p className="text-gray-400 text-sm mt-1">Try expanding your search radius or check back later.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const SupplierCard = ({ supplier, index }: { supplier: Supplier, index: number }) => {
    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return "text-green-600 bg-green-100";
        if (rating >= 4.0) return "text-blue-600 bg-blue-100";
        if (rating >= 3.5) return "text-yellow-600 bg-yellow-100";
        return "text-gray-600 bg-gray-100";
    };

    const getDistanceColor = (distance: number) => {
        if (distance <= 5) return "text-green-600 bg-green-100";
        if (distance <= 15) return "text-blue-600 bg-blue-100";
        return "text-orange-600 bg-orange-100";
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
                                    <span className="text-sm text-gray-600">{supplier.distance} km away</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm font-medium">{supplier.rating}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Badge className={`px-2 py-1 text-xs ${getRatingColor(supplier.rating)}`}>
                                <Award className="h-3 w-3 mr-1" />
                                {supplier.rating >= 4.5 ? 'Excellent' : supplier.rating >= 4.0 ? 'Good' : 'Fair'}
                            </Badge>
                            <Badge className={`px-2 py-1 text-xs ${getDistanceColor(supplier.distance)}`}>
                                {supplier.distance <= 5 ? 'Nearby' : supplier.distance <= 15 ? 'Close' : 'Far'}
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
                            {supplier.products.map((product, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                    {product}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
                    <Button 
                        variant="default" 
                        size="sm" 
                        asChild 
                        className="flex-1 group-hover:bg-green-600 transition-colors"
                    >
                        <a href={`tel:${supplier.phone}`}>
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
                        <a href={supplier.whatsappLink} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="mr-2 h-4 w-4" /> 
                            WhatsApp
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
