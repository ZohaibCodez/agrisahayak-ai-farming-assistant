import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockSuppliers } from "@/lib/data";
import { MapPin, Star, Phone, MessageCircle } from "lucide-react";

export default function SuppliersCard() {
    const suppliers = mockSuppliers;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nearby Suppliers</CardTitle>
                <CardDescription>Find materials for your treatment plan locally.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {suppliers.map((supplier, index) => (
                    <div key={index} className="border p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg">{supplier.name}</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{supplier.distance} km away</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-amber-500" />
                                    <span>{supplier.rating} ({Math.floor(Math.random() * 50) + 5} reviews)</span>
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
                ))}
            </CardContent>
        </Card>
    );
}
