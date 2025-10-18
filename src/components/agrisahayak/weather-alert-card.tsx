
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
import { getProfile } from "@/lib/repositories";
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
        if (!profile || !profile.crops || profile.crops.length === 0) {
            toast({
                title: 'Missing Information',
                description: 'Please set your location and crops in your profile to get weather alerts.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        setResult(null);

        // This is a placeholder for a real weather API call.
        const mockWeatherConditions = "High humidity with a chance of rain in the evening.";

        try {
            const response = await proactiveWeatherAlertsWithRecommendations({
                location: profile.location || "Unknown location",
                crops: profile.crops,
                weatherConditions: mockWeatherConditions,
            });
            setResult(response);
        } catch (error) {
            console.error(error);
            toast({
                title: 'AI Error',
                description: 'Failed to get weather recommendations. Please try again.',
                variant: 'destructive',
            });
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
                {profile ? (
                    <CardDescription>
                        Using your location ({profile.location}) and crops ({profile.crops?.join(', ') || 'None'}) to check for alerts.
                    </CardDescription>
                ) : (
                    <CardDescription>
                        Update your profile to get personalized weather alerts.
                    </CardDescription>
                )}
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Click the button to get AI-powered recommendations based on today's weather forecast. (Forecast is currently simulated).
                    </p>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={loading || !profile?.crops?.length} className="w-full md:w-auto">
                        {loading ? <LoadingSpinner message="Getting Recommendations..." /> : 'Get Recommendations'}
                    </Button>
                </CardFooter>
            </form>
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
