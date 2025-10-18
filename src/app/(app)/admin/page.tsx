
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, Users, FileCheck, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { listLogs } from "@/lib/repositories";
import { AdminLog } from "@/lib/models";
import LoadingSpinner from "@/components/agrisahayak/loading-spinner";

const mockChartData = [
    { date: 'Mon', reports: 12 },
    { date: 'Tue', reports: 19 },
    { date: 'Wed', reports: 15 },
    { date: 'Thu', reports: 22 },
    { date: 'Fri', reports: 18 },
    { date: 'Sat', reports: 25 },
    { date: 'Sun', reports: 16 },
];

export default function AdminPage() {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancel = false;
        const fetchLogs = async () => {
            try {
                const fetchedLogs = await listLogs(50);
                if (!cancel) {
                    setLogs(fetchedLogs);
                }
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            } finally {
                if (!cancel) {
                    setLoading(false);
                }
            }
        };
        fetchLogs();
        return () => { cancel = true; };
    }, []);

    const getStatusVariant = (status: 'success' | 'error' | 'info') => {
        switch(status) {
            case 'success': return 'default';
            case 'error': return 'destructive';
            case 'info': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Total Reports Today" value="34" icon={<FileCheck className="h-5 w-5 text-muted-foreground"/>} />
                <MetricCard title="Active Users" value="128" icon={<Users className="h-5 w-5 text-muted-foreground"/>} />
                <MetricCard title="Avg. Confidence Score" value="86%" icon={<Activity className="h-5 w-5 text-muted-foreground"/>} />
                <MetricCard title="Avg. Response Time" value="12.4s" icon={<Clock className="h-5 w-5 text-muted-foreground"/>} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reports Per Day</CardTitle>
                    <CardDescription>A chart showing the number of diagnosis reports created over the last week.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Line type="monotone" dataKey="reports" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Agent Activity Logs</CardTitle>
                    <CardDescription>Real-time monitoring of AI agent actions from Firestore.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <LoadingSpinner message="Loading logs..." />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Agent</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Report ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Duration (ms)</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">{log.agentName}</TableCell>
                                        <TableCell>{log.action}</TableCell>
                                        <TableCell>{log.reportId || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(log.status)}>{log.status}</Badge>
                                        </TableCell>
                                        <TableCell>{log.duration ?? '-'}</TableCell>
                                        <TableCell>{log.timestamp?.toDate?.().toLocaleString() || 'Unknown'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function MetricCard({title, value, icon}: {title: string, value: string, icon: React.ReactNode}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}
