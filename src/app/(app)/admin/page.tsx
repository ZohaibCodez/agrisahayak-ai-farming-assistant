"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockAdminLogs, mockChartData } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, Users, FileCheck, Clock } from "lucide-react";

export default function AdminPage() {
    const getStatusVariant = (status: 'success' | 'error') => {
        return status === 'success' ? 'default' : 'destructive';
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
                    <CardDescription>Real-time monitoring of AI agent actions.</CardDescription>
                </CardHeader>
                <CardContent>
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
                            {mockAdminLogs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.agentName}</TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>{log.reportId}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(log.status)}>{log.status}</Badge>
                                    </TableCell>
                                    <TableCell>{log.duration}</TableCell>
                                    <TableCell>{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
