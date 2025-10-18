
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { proactiveWeatherAlertsWithRecommendations, WeatherAlertsOutput } from "@/ai/flows/proactive-weather-alerts-with-recommendations";
import LoadingSpinner from "./loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Sun, CloudRain, Snowflake, AlertTriangle, Wind } from "lucide-react";
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

    const weatherIcons: { [key: string]: React.ReactNode } = {
        'Frost': <Snowflake className="h-5 w-5 text-blue-400" />,
        'Flood': <CloudRain className="h-5 w-5 text-blue-600" />,
        'Fungal': <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        'Heat': <Sun className="h-5 w-5 text-red-500" />,
        'Wind': <Wind className="h-5 w-5 text-gray-500" />
    };

    const getWeatherIcon = (alertText: string) => {
        for (const key in weatherIcons) {
            if (alertText.toLowerCase().includes(key.toLowerCase())) {
                return weatherIcons[key];
            }
        }
        return <Lightbulb className="h-5 w-5 text-accent" />;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Proactive Weather Alerts</CardTitle>
                <CardDescription>
                    {profile ? (
                        <>Using your location <strong>({profile.location})</strong> and crops <strong>({profile.crops?.join(', ') || 'None'})</strong> to check for alerts.</>
                    ) : (
                        <>Set your location and crops in your profile to get personalized alerts, or run a demo below.</>
                    )}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Click the button to get AI-powered recommendations based on today's weather forecast. (Forecast is currently simulated).
                </p>
            </CardContent>

            <CardFooter className="flex gap-2">
                <Button onClick={handleSubmit} disabled={loading} className="flex-1 md:flex-none">
                    {loading ? <LoadingSpinner message="Getting Recommendations..." /> : (profile?.crops?.length ? 'Get Recommendations' : 'Run Demo')}
                </Button>
                {!profile && (
                    <Button asChild variant="ghost">
                        <a href="/profile">Set profile</a>
                    </Button>
                )}
            </CardFooter>

            {result && (
                <div className="p-6 pt-0">
                    <Alert className="bg-primary/5 border-primary/20">
                        <div className="flex items-start gap-3">
                            <div>{getWeatherIcon(result.alert)}</div>
                            <div>
                                <AlertTitle className="text-primary">{result.alert}</AlertTitle>
                                <AlertDescription>
                                    {result.advice}
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>
                </div>
            )}
        </Card>
    );
}
