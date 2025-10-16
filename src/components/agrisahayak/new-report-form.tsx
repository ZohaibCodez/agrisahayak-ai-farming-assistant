"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Upload, X, MapPin } from 'lucide-react';
import { instantDiagnosisFromImageAndSymptoms, InstantDiagnosisFromImageAndSymptomsOutput } from '@/ai/flows/instant-diagnosis-from-image-and-symptoms';
import { generateLocalizedTreatmentPlan, LocalizedTreatmentPlanOutput } from '@/ai/flows/localized-treatment-plans';
import LoadingSpinner from './loading-spinner';
import { useToast } from "@/hooks/use-toast";
import DiagnosisCard from './diagnosis-card';
import TreatmentPlanCard from './treatment-plan-card';
import SuppliersCard from './suppliers-card';

type LoadingState = 'idle' | 'diagnosing' | 'planning' | 'done' | 'error';

function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function NewReportForm() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [symptoms, setSymptoms] = useState('');
    const [loadingState, setLoadingState] = useState<LoadingState>('idle');
    const [diagnosisResult, setDiagnosisResult] = useState<InstantDiagnosisFromImageAndSymptomsOutput | null>(null);
    const [treatmentPlanResult, setTreatmentPlanResult] = useState<LocalizedTreatmentPlanOutput | null>(null);
    const { toast } = useToast();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast({ title: "Image too large", description: "Please upload an image under 10MB.", variant: "destructive" });
                return;
            }
            if (!['image/png', 'image/jpeg'].includes(file.type)) {
                toast({ title: "Invalid file type", description: "Please upload a PNG or JPG image.", variant: "destructive" });
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) {
            toast({ title: "No image selected", description: "Please upload an image of the crop.", variant: "destructive" });
            return;
        }

        setLoadingState('diagnosing');
        try {
            const photoDataUri = await fileToDataUri(imageFile);
            const diagnosis = await instantDiagnosisFromImageAndSymptoms({
                photoDataUri,
                symptoms
            });
            setDiagnosisResult(diagnosis);
            toast({ title: "Diagnosis Complete!", description: "Now generating your treatment plan...", className: "bg-green-100 text-green-800" });

            setLoadingState('planning');
            const plan = await generateLocalizedTreatmentPlan({
                disease: diagnosis.disease,
                crop: 'Unknown', // Placeholder, as the AI doesn't return crop type
            });
            setTreatmentPlanResult(plan);
            toast({ title: "Plan Ready!", description: "Your complete report is now available.", className: "bg-green-100 text-green-800" });

            setLoadingState('done');
        } catch (error) {
            console.error("AI flow error:", error);
            setLoadingState('error');
            toast({ title: "AI Analysis Failed", description: "Could not complete the diagnosis. Please try again.", variant: "destructive" });
        }
    };
    
    const resetForm = () => {
        removeImage();
        setSymptoms('');
        setDiagnosisResult(null);
        setTreatmentPlanResult(null);
        setLoadingState('idle');
    }

    if (loadingState === 'done' && diagnosisResult && treatmentPlanResult && imagePreview) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold font-headline">Diagnosis Report</h1>
                    <Button onClick={resetForm}>Create New Report</Button>
                </div>
                <DiagnosisCard diagnosis={diagnosisResult} imageUrl={imagePreview} />
                <TreatmentPlanCard plan={treatmentPlanResult} />
                <SuppliersCard />
            </div>
        );
    }
    
    if (loadingState === 'diagnosing' || loadingState === 'planning') {
        return (
            <Card className="flex flex-col items-center justify-center p-12 min-h-[500px]">
                <LoadingSpinner className="h-16 w-16" />
                <h2 className="text-2xl font-bold mt-6">{loadingState === 'diagnosing' ? 'Analyzing Your Crop...' : 'Creating Treatment Plan...'}</h2>
                <p className="text-muted-foreground mt-2">Our AI is working. This may take a moment.</p>
                {imagePreview && <Image src={imagePreview} alt="upload preview" width={100} height={100} className="mt-8 rounded-lg opacity-50" />}
            </Card>
        );
    }

    return (
        <>
            <h1 className="text-3xl font-bold font-headline mb-6">Create New Diagnosis Report</h1>
            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Crop Information</CardTitle>
                        <CardDescription>Upload an image and describe the symptoms to get an AI diagnosis.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>1. Upload Crop Image</Label>
                            {imagePreview ? (
                                <div className="relative w-fit">
                                    <Image src={imagePreview} alt="Crop preview" width={200} height={200} className="rounded-lg border" />
                                    <Button variant="destructive" size="icon" className="absolute -top-3 -right-3 h-8 w-8 rounded-full" onClick={removeImage}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="image-upload" className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 10MB)</p>
                                        </div>
                                    </label>
                                    <Input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="symptoms">2. Observed Symptoms</Label>
                            <Textarea
                                id="symptoms"
                                placeholder="e.g., Yellow spots on leaves, wilting, stunted growth..."
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                rows={4}
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground text-right">{symptoms.length} / 500</p>
                        </div>

                        <div className="space-y-2">
                            <Label>3. Location</Label>
                            <div className="flex items-center p-3 rounded-md border bg-muted/50">
                                <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                                <span className="text-sm">Faisalabad, Punjab (auto-detected)</span>
                            </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full" disabled={!imageFile}>Get AI Diagnosis</Button>
                    </CardContent>
                </form>
            </Card>
        </>
    );
}
