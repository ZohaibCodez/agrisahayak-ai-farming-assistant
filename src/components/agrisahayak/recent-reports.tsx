import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { mockRecentReports, Report } from "@/lib/data";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

export default function RecentReports() {
    const reports = mockRecentReports;

    const getStatusVariant = (status: Report['status']) => {
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
                {reports.length > 0 ? (
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
                                            src={report.imageUrl}
                                            alt={report.crop}
                                            width={50}
                                            height={50}
                                            className="rounded-md object-cover"
                                            data-ai-hint="crop plant"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{report.crop}</TableCell>
                                    <TableCell>{report.diagnosis}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                                    </TableCell>
                                    <TableCell>{report.date}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="sm">
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
