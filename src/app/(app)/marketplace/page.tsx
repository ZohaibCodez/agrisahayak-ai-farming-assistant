import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import SuppliersCard from "@/components/agrisahayak/suppliers-card";
import { Button } from "@/components/ui/button";

export default function MarketplacePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Marketplace</h1>
            <p className="text-muted-foreground">
                Find local suppliers for seeds, pesticides, equipment, and more.
            </p>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search for products (e.g., Fungicide)" className="pl-10" />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>

            <SuppliersCard />
        </div>
    );
}
