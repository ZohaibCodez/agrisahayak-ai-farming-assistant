import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function ProfilePage() {
    const crops = ["Cotton", "Wheat", "Rice", "Sugarcane", "Maize"];

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold font-headline">Profile Settings</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your photo and personal details here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex items-center gap-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src="https://picsum.photos/seed/user1/200/200" data-ai-hint="person" />
                                <AvatarFallback>GR</AvatarFallback>
                            </Avatar>
                            <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                                <Camera className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid gap-2 flex-grow">
                           <div className="grid w-full max-w-sm items-center gap-1.5">
                              <Label htmlFor="name">Full Name</Label>
                              <Input type="text" id="name" defaultValue="Ghulam Rasool" />
                           </div>
                           <div className="grid w-full max-w-sm items-center gap-1.5">
                              <Label htmlFor="location">Location</Label>
                              <Input type="text" id="location" defaultValue="Faisalabad, Punjab" />
                           </div>
                        </div>
                     </div>
                     <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="phone">Phone Number (Verified)</Label>
                        <Input type="tel" id="phone" defaultValue="+92 300 1234567" readOnly disabled />
                     </div>
                     <Button>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                     </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Manage your language, crop, and notification settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="language">Preferred Language</Label>
                         <Select defaultValue="english">
                            <SelectTrigger id="language">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="urdu">اردو</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Crops Grown</Label>
                        <div className="flex flex-wrap gap-2">
                            {crops.map(crop => (
                                <Button key={crop} variant="secondary" className="rounded-full">{crop}</Button>
                            ))}
                            <Button variant="outline" className="rounded-full">+</Button>
                        </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                        <h3 className="text-md font-medium">Notification Preferences</h3>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="weather-alerts" className="flex flex-col gap-1">
                                <span>Weather Alerts</span>
                                <span className="text-xs text-muted-foreground">Receive alerts for critical weather conditions.</span>
                            </Label>
                            <Switch id="weather-alerts" defaultChecked/>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="price-updates" className="flex flex-col gap-1">
                                <span>Price Updates</span>
                                <span className="text-xs text-muted-foreground">Get notified about market price changes for your crops.</span>
                            </Label>
                            <Switch id="price-updates" />
                        </div>
                         <div className="flex items-center justify-between">
                            <Label htmlFor="reminders" className="flex flex-col gap-1">
                                <span>Treatment Reminders</span>
                                <span className="text-xs text-muted-foreground">Reminders for steps in your treatment plans.</span>
                            </Label>
                            <Switch id="reminders" defaultChecked/>
                        </div>
                    </div>
                     <Button>
                        <Save className="mr-2 h-4 w-4" /> Save Preferences
                     </Button>
                </CardContent>
            </Card>

        </div>
    );
}
