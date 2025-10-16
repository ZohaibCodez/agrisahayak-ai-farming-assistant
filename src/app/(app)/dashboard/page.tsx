import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import RecentReports from "@/components/agrisahayak/recent-reports";
import WeatherAlertCard from "@/components/agrisahayak/weather-alert-card";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Welcome Back, Ghulam!</h1>
                    <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your crops today.</p>
                </div>
                <Button asChild size="lg" className="w-full md:w-auto">
                    <Link href="/report/new">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        New Diagnosis Report
                    </Link>
                </Button>
            </div>

            <WeatherAlertCard />

            <RecentReports />

        </div>
    );
}
