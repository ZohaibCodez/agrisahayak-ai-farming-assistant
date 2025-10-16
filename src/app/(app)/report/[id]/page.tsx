import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { mockRecentReports } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function ReportDetailPage({ params }: { params: { id: string } }) {
    const report = mockRecentReports.find(r => r.id === params.id);

    if (!report) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Report Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The report you are looking for does not exist.</p>
                    <Button asChild className="mt-4"><Link href="/dashboard">Back to Dashboard</Link></Button>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="space-y-6">
             <h1 className="text-3xl font-bold font-headline">Report Details</h1>
             <Card className="text-center p-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground"/>
                <h2 className="mt-4 text-xl font-semibold">Viewing Report for {report.crop}</h2>
                <p className="mt-2 max-w-md mx-auto text-muted-foreground">
                    This is a placeholder for viewing a past report. In a full implementation, detailed diagnosis, treatment, and supplier information would be displayed here.
                </p>
                <div className="mt-4">
                    <p><strong>Diagnosis:</strong> {report.diagnosis}</p>
                    <p><strong>Status:</strong> <Badge>{report.status}</Badge></p>
                </div>
                 <Button asChild className="mt-6">
                    <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
            </Card>
        </div>
    );
}
