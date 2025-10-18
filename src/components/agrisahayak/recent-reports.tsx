
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { DiagnosisReport } from "@/lib/models";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/firebase";
import { listRecentReports } from "@/lib/repositories";
import LoadingSpinner from "./loading-spinner";

export default function RecentReports() {
    const { user } = useAuth();
    const [reports, setReports] = useState<DiagnosisReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setReports([]);
            return;
        };

        let cancel = false;
        const fetchReports = async () => {
            setLoading(true);
            try {
                const items = await listRecentReports(user.uid, 10);
                if (!cancel) setReports(items);
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                if (!cancel) setLoading(false);
            }
        };
        
        fetchReports();
        return () => { cancel = true; };
    }, [user]);

    const getStatusVariant = (status: DiagnosisReport['status']) => {
        switch (status) {
            case 'Complete': return 'default';
            case 'Processing': return 'secondary';
            case 'Error': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>A summary of your recent diagnosis reports.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                     <div className="flex items-center justify-center p-8">
                        <LoadingSpinner message="Loading recent reports..." />
                    </div>
                ) : reports.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Crop</TableHead>
                                <TableHead>Diagnosis</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell>
                                        <Image
                                            src={report.imageUrl || report.imageThumb || "https://picsum.photos/seed/placeholder/100/100"}
                                            alt={report.crop || "Crop image"}
                                            width={50}
                                            height={50}
                                            className="rounded-md object-cover"
                                            data-ai-hint="crop plant"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {report.crop && report.crop !== 'Unknown' ? (
                                            report.crop
                                        ) : (
                                            <span className="text-muted-foreground">Unknown crop — <Link href={`/report/${report.id}`}>View</Link></span>
                                        )}
                                    </TableCell>
                                    <TableCell>{report.disease || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                                    </TableCell>
                                    <TableCell>{report.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="sm" disabled={report.status !== 'Complete'}>
                                            <Link href={`/report/${report.id}`}>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground">No reports yet.</p>
                        <Button asChild className="mt-4">
                            <Link href="/report/new">Create your first diagnosis!</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
