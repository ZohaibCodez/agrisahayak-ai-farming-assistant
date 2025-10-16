"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { proactiveWeatherAlertsWithRecommendations, WeatherAlertsOutput } from "@/ai/flows/proactive-weather-alerts-with-recommendations";
import LoadingSpinner from "./loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Sun, CloudRain, Snowflake, AlertTriangle, Wind } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WeatherAlertCard() {
    const [crop, setCrop] = useState('');
    const [weather, setWeather] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<WeatherAlertsOutput | null>(null);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!crop || !weather) {
            toast({
                title: 'Missing Information',
                description: 'Please select a crop and enter weather conditions.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await proactiveWeatherAlertsWithRecommendations({
                location: "Faisalabad, Punjab",
                crops: [crop],
                weatherConditions: weather,
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
                <CardDescription>Get AI-powered recommendations based on current weather conditions.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="crop">Select Crop</Label>
                            <Select onValueChange={setCrop} value={crop}>
                                <SelectTrigger id="crop">
                                    <SelectValue placeholder="Select a crop" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cotton">Cotton</SelectItem>
                                    <SelectItem value="Wheat">Wheat</SelectItem>
                                    <SelectItem value="Rice">Rice</SelectItem>
                                    <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                                    <SelectItem value="Maize">Maize</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="weather">Weather Conditions</Label>
                            <Input id="weather" placeholder="e.g., High humidity, expected rain" value={weather} onChange={(e) => setWeather(e.target.value)} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={loading} className="w-full md:w-auto">
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
