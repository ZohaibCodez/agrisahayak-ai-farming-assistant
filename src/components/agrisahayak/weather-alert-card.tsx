
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { proactiveWeatherAlertsWithRecommendations, WeatherAlertsOutput } from "@/ai/flows/proactive-weather-alerts-with-recommendations";
import LoadingSpinner from "./loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Sun, CloudRain, Snowflake, AlertTriangle, Wind, Cloud, Thermometer, Droplets, Eye, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { getProfile, upsertProfile } from "@/lib/repositories";
import { UserProfile } from "@/lib/models";
export default function WeatherAlertCard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<WeatherAlertsOutput | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (user && !profile) {
            getProfile(user.uid).then(setProfile);
        }
    }, [user, profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        setResult(null);

        // Prepare crops and location. If crops are missing, run demo with 'Unknown'
        const crops = (profile?.crops && profile.crops.length > 0) ? profile.crops : ['Unknown'];
        const locationText = profile?.location || '';

        let weatherConditions = '';
        try {
            // Ask server to fetch weather for the profile location (server keeps the API key)
            const res = await fetch('/api/weather', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location: locationText })
            });
            const data = await res.json();
            if (res.ok && data.ok && data.weatherConditions) {
                weatherConditions = data.weatherConditions;
                // Persist the lat/lon to the user's profile for future calls if available
                if (user && data.lat && data.lon) {
                    try {
                        await upsertProfile({ uid: user.uid, phone: profile?.phone || '', location: profile?.location || locationText, lat: data.lat, lon: data.lon });
                    } catch (e) {
                        console.warn('Failed to persist geocode to profile', e);
                    }
                }
            } else {
                console.warn('Server weather fetch returned empty, falling back to demo', data);
                weatherConditions = 'High humidity with a chance of rain in the evening.';
            }

            // Call AI
            const response = await proactiveWeatherAlertsWithRecommendations({ location: locationText || 'Unknown location', crops, weatherConditions });
            setResult(response);
        } catch (error: any) {
            console.error(error);
            toast({ title: 'Weather/AI Error', description: error?.message || 'Failed to get weather recommendations. Please try again.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const weatherIcons: { [key: string]: { icon: React.ReactNode, color: string, bgColor: string } } = {
        'Frost': { 
            icon: <Snowflake className="h-6 w-6" />, 
            color: "text-blue-600", 
            bgColor: "bg-blue-100" 
        },
        'Flood': { 
            icon: <CloudRain className="h-6 w-6" />, 
            color: "text-blue-700", 
            bgColor: "bg-blue-100" 
        },
        'Fungal': { 
            icon: <AlertTriangle className="h-6 w-6" />, 
            color: "text-yellow-600", 
            bgColor: "bg-yellow-100" 
        },
        'Heat': { 
            icon: <Sun className="h-6 w-6" />, 
            color: "text-red-600", 
            bgColor: "bg-red-100" 
        },
        'Wind': { 
            icon: <Wind className="h-6 w-6" />, 
            color: "text-gray-600", 
            bgColor: "bg-gray-100" 
        },
        'Humidity': { 
            icon: <Droplets className="h-6 w-6" />, 
            color: "text-cyan-600", 
            bgColor: "bg-cyan-100" 
        },
        'Temperature': { 
            icon: <Thermometer className="h-6 w-6" />, 
            color: "text-orange-600", 
            bgColor: "bg-orange-100" 
        }
    };

    const getWeatherIcon = (alertText: string) => {
        for (const key in weatherIcons) {
            if (alertText.toLowerCase().includes(key.toLowerCase())) {
                return weatherIcons[key];
            }
        }
        return { 
            icon: <Cloud className="h-6 w-6" />, 
            color: "text-gray-600", 
            bgColor: "bg-gray-100" 
        };
    };

    const getAlertSeverity = (alertText: string) => {
        const text = alertText.toLowerCase();
        if (text.includes('severe') || text.includes('extreme') || text.includes('danger')) {
            return { level: 'High', color: 'text-red-600 bg-red-100 border-red-200' };
        }
        if (text.includes('moderate') || text.includes('warning')) {
            return { level: 'Medium', color: 'text-yellow-600 bg-yellow-100 border-yellow-200' };
        }
        return { level: 'Low', color: 'text-blue-600 bg-blue-100 border-blue-200' };
    };

    const weatherIcon = result ? getWeatherIcon(result.alert) : null;
    const severity = result ? getAlertSeverity(result.alert) : null;

    return (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-xl">
                                <Cloud className="h-6 w-6 text-amber-600"/>
                            </div>
                            Weather Alerts
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            {profile ? (
                                <>AI-powered weather insights for <strong className="text-amber-700">{profile.location}</strong> and your crops <strong className="text-amber-700">({profile.crops?.join(', ') || 'None'})</strong></>
                            ) : (
                                <>Set your location and crops in your profile to get personalized alerts, or run a demo below.</>
                            )}
                        </CardDescription>
                    </div>
                    {result && (
                        <Badge className={`px-3 py-1 text-sm ${severity?.color}`}>
                            {severity?.level} Priority
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {!result ? (
                    <div className="text-center py-8">
                        <div className="p-4 bg-amber-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Eye className="h-8 w-8 text-amber-600" />
                        </div>
                        <p className="text-gray-600 text-lg mb-2">Get AI-powered weather recommendations</p>
                        <p className="text-gray-500 text-sm">
                            Click the button below to analyze current weather conditions and get personalized farming advice.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Weather Alert Display */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${weatherIcon?.bgColor}`}>
                                    <div className={weatherIcon?.color}>
                                        {weatherIcon?.icon}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-bold text-gray-900">{result.alert}</h3>
                                        <Badge className={`px-2 py-1 text-xs ${severity?.color}`}>
                                            {severity?.level} Risk
                                        </Badge>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed text-base">
                                        {result.advice}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Weather Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/60 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Thermometer className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm font-medium text-gray-600">Temperature</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">Monitoring</p>
                            </div>
                            <div className="bg-white/60 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Droplets className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-600">Humidity</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">High</p>
                            </div>
                            <div className="bg-white/60 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wind className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-600">Wind</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">Moderate</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button 
                    onClick={handleSubmit} 
                    disabled={loading} 
                    className="flex-1 sm:flex-none group"
                >
                    {loading ? (
                        <LoadingSpinner message="Analyzing weather..." variant="pulse" size="sm" />
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                            {profile?.crops?.length ? 'Get New Recommendations' : 'Run Weather Analysis'}
                        </>
                    )}
                </Button>
                {!profile && (
                    <Button asChild variant="outline" className="flex-1 sm:flex-none">
                        <a href="/profile" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Set Profile
                        </a>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
