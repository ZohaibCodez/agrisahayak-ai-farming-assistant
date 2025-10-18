
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listSuppliers, seedSuppliers } from "@/lib/repositories";
import { Supplier } from "@/lib/models";
import { mockSuppliers } from "@/lib/data";
import { MapPin, Star, Phone, MessageCircle } from "lucide-react";
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
        <Card>
            <CardHeader>
                <CardTitle>Nearby Suppliers</CardTitle>
                <CardDescription>Find materials for your treatment plan locally.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <LoadingSpinner message="Loading suppliers..." />
                    </div>
                ) : suppliers.length > 0 ? (
                    suppliers.map((supplier) => (
                        <div key={supplier.id} className="border p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg">{supplier.name}</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{supplier.distance} km away</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-amber-500" />
                                        <span>{supplier.rating}</span>
                                    </div>
                                </div>
                                <p className="text-sm mt-2">
                                    <span className="font-medium">Carries:</span> {supplier.products.join(', ')}
                                </p>
                            </div>
                            <div className="flex-shrink-0 flex gap-2 w-full sm:w-auto">
                                <Button variant="outline" size="sm" asChild className="flex-1">
                                    <a href={`tel:${supplier.phone}`}>
                                        <Phone className="mr-2 h-4 w-4" /> Call
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm" asChild className="flex-1">
                                    <a href={supplier.whatsappLink} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center">No suppliers found.</p>
                )}
            </CardContent>
        </Card>
    );
}
