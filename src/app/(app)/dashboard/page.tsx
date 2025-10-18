
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, TrendingUp, Shield, Clock, MapPin, Calendar, Activity, AlertTriangle } from "lucide-react";
import Link from "next/link";
import RecentReports from "@/components/agrisahayak/recent-reports";
import WeatherAlertCard from "@/components/agrisahayak/weather-alert-card";
import { useAuth } from "@/firebase";
import { getProfile, listRecentReports } from "@/lib/repositories";
import { useEffect, useState } from "react";
import { UserProfile, DiagnosisReport } from "@/lib/models";

export default function DashboardPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [recentReports, setRecentReports] = useState<DiagnosisReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getProfile(user.uid).then(setProfile);
            listRecentReports(user.uid, 5).then(reports => {
                setRecentReports(reports);
                setLoading(false);
            });
        }
    }, [user]);

    // Calculate dashboard metrics
    const totalReports = recentReports.length;
    const completedReports = recentReports.filter(r => r.status === 'Complete').length;
    const successRate = totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0;
    const highSeverityReports = recentReports.filter(r => r.severity === 'High').length;

    return (
        <div className="space-y-8">
            {/* Enhanced Welcome Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Activity className="h-6 w-6 text-primary" />
                            </div>
                            <Badge variant="secondary" className="px-3 py-1">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Active Dashboard
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-bold font-headline text-gray-900 mb-2">
                            Welcome Back, {profile?.name || 'Farmer'}! 👋
                        </h1>
                        <p className="text-lg text-gray-600 mb-4">
                            Here's what's happening with your crops today. {profile?.location && (
                                <span className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                                    <MapPin className="h-4 w-4" />
                                    {profile.location}
                                </span>
                            )}
                        </p>
                    </div>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-lg">
                        <Link href="/report/new">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            New Diagnosis Report
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Reports"
                    value={totalReports.toString()}
                    icon={<Activity className="h-5 w-5" />}
                    color="blue"
                    trend={totalReports > 0 ? "+12%" : "0%"}
                />
                <StatCard
                    title="Success Rate"
                    value={`${successRate}%`}
                    icon={<Shield className="h-5 w-5" />}
                    color="green"
                    trend={successRate > 80 ? "+5%" : "-2%"}
                />
                <StatCard
                    title="High Priority"
                    value={highSeverityReports.toString()}
                    icon={<AlertTriangle className="h-5 w-5" />}
                    color="red"
                    trend={highSeverityReports > 0 ? "Needs Attention" : "All Good"}
                />
                <StatCard
                    title="This Month"
                    value={recentReports.filter(r => {
                        const reportDate = r.createdAt?.toDate?.();
                        const now = new Date();
                        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                        return reportDate && reportDate >= monthAgo;
                    }).length.toString()}
                    icon={<Calendar className="h-5 w-5" />}
                    color="purple"
                    trend="+8%"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weather Alerts - Takes 2 columns on large screens */}
                <div className="lg:col-span-2">
                    <WeatherAlertCard />
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-1">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Quick Actions
                            </CardTitle>
                            <CardDescription>
                                Common tasks and shortcuts
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/report/new">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Diagnosis
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/marketplace">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Find Suppliers
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full justify-start">
                                <Link href="/profile">
                                    <Activity className="mr-2 h-4 w-4" />
                                    Update Profile
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Reports Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Recent Reports</h2>
                        <p className="text-gray-600">Your latest crop diagnosis reports</p>
                    </div>
                    <Button asChild variant="ghost">
                        <Link href="/dashboard">View All</Link>
                    </Button>
                </div>
                <RecentReports />
            </div>
        </div>
    );
}

function StatCard({ 
    title, 
    value, 
    icon, 
    color, 
    trend 
}: { 
    title: string; 
    value: string; 
    icon: React.ReactNode; 
    color: string;
    trend: string;
}) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        green: "bg-green-50 text-green-600 border-green-200",
        red: "bg-red-50 text-red-600 border-red-200",
        purple: "bg-purple-50 text-purple-600 border-purple-200"
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        <p className="text-3xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500 mt-1">{trend}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
