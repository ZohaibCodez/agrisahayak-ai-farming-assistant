
"use client";

import { useState, useEffect, useRef } from 'react';
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
import { useAuth } from '@/firebase';
import { createReport, createLog, uploadReportImage, updateReport, getProfile } from '@/lib/repositories';
import { DiagnosisReport, UserProfile } from '@/lib/models';

type LoadingState = 'idle' | 'starting' | 'diagnosing' | 'planning' | 'done' | 'error';
type LoadingMessages = { [key in LoadingState]?: string };

const loadingMessages: LoadingMessages = {
    starting: "Creating report and uploading image...",
    diagnosing: 'Analyzing your crop with AI...',
    planning: 'Creating personalized treatment plan...',
};

function fileToDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Compress an image File using an offscreen canvas and return a Blob
async function compressImage(file: File, maxWidth = 1024, quality = 0.8): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
        try {
            const img = document.createElement('img') as HTMLImageElement;
            img.onload = () => {
                try {
                    const ratio = Math.min(1, maxWidth / img.width);
                    const width = Math.round(img.width * ratio);
                    const height = Math.round(img.height * ratio);
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error('Canvas context not available');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(
                        blob => {
                            if (!blob) return reject(new Error('Compression toBlob returned null'));
                            resolve(blob);
                        },
                        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
                        quality
                    );
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image for compression'));
            // Use object URL to avoid base64 memory usage
            const url = URL.createObjectURL(file);
            img.src = url;
            // revoke later
            img.addEventListener('load', () => URL.revokeObjectURL(url));
        } catch (err) {
            reject(err);
        }
    });
}

// Create a small thumbnail data URI (safe for Firestore) -- keep under ~200KB
async function createThumbnailDataUri(file: File, maxWidth = 480, quality = 0.65): Promise<string> {
    const blob = await compressImage(file, maxWidth, quality);
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export default function NewReportForm() {
    const { user, isUserLoading } = useAuth();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [symptoms, setSymptoms] = useState('');
    const [loadingState, setLoadingState] = useState<LoadingState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const [report, setReport] = useState<DiagnosisReport | null>(null);
    const { toast } = useToast();

    // Fetch user profile when user changes
    useEffect(() => {
        if (user) {
            getProfile(user.uid).then(setProfile);
        } else {
            setProfile(null);
        }
    }, [user]);

    // Effect to run the diagnostic agent
    useEffect(() => {
        if (loadingState === 'diagnosing' && user && report && report.imageUrl) {
            (async () => {
                const startTime = Date.now();
                await createLog({ agentName: 'diagnosticAgent', action: 'diagnosis_started', reportId: report.id, status: 'info' });
                try {
                    const photoDataUri = await fileToDataUri(imageFile!);
                    const diagnosis = await instantDiagnosisFromImageAndSymptoms({
                        photoDataUri,
                        symptoms
                    });
                    
                    await updateReport(user.uid, report.id, {
                        disease: diagnosis.disease,
                        confidence: diagnosis.confidence,
                        affectedParts: diagnosis.affectedParts,
                        severity: diagnosis.severity,
                        description: diagnosis.description,
                    });
                    
                    setReport(prev => prev ? { ...prev, ...diagnosis } : null);
                    await createLog({ agentName: 'diagnosticAgent', action: 'diagnosis_completed', reportId: report.id, status: 'success', duration: Date.now() - startTime, payload: diagnosis });
                    toast({ title: "Diagnosis Complete!", description: "Now generating your treatment plan.", className: "bg-green-100 text-green-800" });
                    setLoadingState('planning');
                } catch (e: any) {
                    console.error("Diagnostic agent error:", e);
                        // Mark the report as pending for background retry and create an error log
                        try {
                            await updateReport(user.uid, report.id, { status: 'Pending' } as any);
                        } catch (updateErr) {
                            console.warn('Failed to mark report Pending:', updateErr);
                        }
                        await createLog({ agentName: 'diagnosticAgent', action: 'diagnosis_failed', reportId: report.id, status: 'error', duration: Date.now() - startTime, payload: { error: e?.message || String(e) } });
                        setError("AI service is temporarily unavailable. We've saved your report and will retry diagnosis. Please check back in a few minutes or try again.");
                        setLoadingState('idle');
                }
            })();
        }
    }, [loadingState, user, report, imageFile, symptoms, toast]);

    // Effect to run the planning agent
    useEffect(() => {
        if (loadingState === 'planning' && user && report && report.disease) {
             (async () => {
                const startTime = Date.now();
                await createLog({ agentName: 'actionPlannerAgent', action: 'planning_started', reportId: report.id, status: 'info' });
                try {
                    const plan = await generateLocalizedTreatmentPlan({
                        disease: report.disease,
                        crop: report.crop || 'Unknown', 
                    });
                    
                    await updateReport(user.uid, report.id, { plan: plan as any, status: 'Complete' });
                    setReport(prev => prev ? { ...prev, plan: plan as any, status: 'Complete' } : null);
                    
                    await createLog({ agentName: 'actionPlannerAgent', action: 'planning_completed', reportId: report.id, status: 'success', duration: Date.now() - startTime, payload: plan });
                    toast({ title: "Plan Ready!", description: "Your complete report is now available.", className: "bg-green-100 text-green-800" });
                    setLoadingState('done');
                } catch (e: any) {
                    console.error("Action planner agent error:", e);
                    await createLog({ agentName: 'actionPlannerAgent', action: 'planning_failed', reportId: report.id, status: 'error', duration: Date.now() - startTime, payload: { error: e.message } });
                    setError("AI Treatment Plan Failed. Please try again.");
                    setLoadingState('error');
                }
            })();
        }
    }, [loadingState, user, report]);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
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
        if (!imageFile || !user) {
            toast({ title: "Missing prerequisites", description: "Please upload an image and ensure you are logged in.", variant: "destructive" });
            return;
        }

        setLoadingState('starting');
        setError(null);
        const startTime = Date.now();
        let reportId = '';

        try {
            console.log("Starting report creation process...");
            
            // 1. Create initial report document
            console.log("Creating report document...");
            reportId = await createReport(user.uid, {
                crop: 'Unknown', // This can be updated later
                symptoms,
                status: 'Processing',
            } as any);
            console.log("Report created with ID:", reportId);

            await createLog({ agentName: 'ingestAgent', action: 'report_created', reportId, status: 'success' });
            
            // 2. Compress and upload image
            console.log("Starting image compression + upload...");
            let imageUrl: string | null = null;
            try {
                // Compress image to reduce size before upload
                const compressedBlob = await compressImage(imageFile, 1024, 0.8);
                const compressedFile = new File([compressedBlob], imageFile.name, { type: compressedBlob.type });
                imageUrl = await uploadReportImage(user.uid, reportId, compressedFile);
                console.log("Image uploaded successfully:", imageUrl);
            } catch (uploadError: any) {
                console.warn("Firebase Storage upload failed after compression:", uploadError?.message ?? uploadError);
                // As fallback, create a small thumbnail data URI and store that under imageThumb to avoid large Firestore writes
                try {
                    const thumbDataUri = await createThumbnailDataUri(imageFile, 480, 0.65);
                    console.log("Generated thumbnail data URI (length):", thumbDataUri.length);
                    // store thumbnail instead of full image data URI in the report
                    await updateReport(user.uid, reportId, { imageThumb: thumbDataUri } as any);
                    imageUrl = thumbDataUri; // keep imageUrl as the thumbnail for client preview
                    await createLog({ agentName: 'ingestAgent', action: 'thumbnail_stored', reportId, status: 'info', payload: { length: thumbDataUri.length } });
                } catch (thumbErr: any) {
                    console.error("Thumbnail fallback failed:", thumbErr);
                    // If thumbnail creation also fails, remove the report and surface an error to the user
                    setError('Image upload failed and fallback could not be completed. Please try a smaller image (less than 2MB) or check your connection.');
                    setLoadingState('error');
                    await createLog({ agentName: 'ingestAgent', action: 'ingestion_failed', reportId, status: 'error', payload: { error: String(thumbErr) } });
                    return;
                }
            }
            
            // 3. Update report with image URL if it's a real URL; otherwise `imageThumb` was already stored
            console.log("Updating report with image reference...");
            if (imageUrl && !imageUrl.startsWith('data:')) {
                await updateReport(user.uid, reportId, { imageUrl });
            } else {
                // imageThumb already stored in fallback path above
                console.log('Using thumbnail stored in report as image reference.');
            }

            setReport({ id: reportId, imageUrl, symptoms } as any);

            // Avoid storing full data URIs in logs/firestore. If imageUrl is a data URI use metadata only.
            const isDataUri = typeof imageUrl === 'string' && imageUrl.startsWith('data:');
            await createLog({
                agentName: 'ingestAgent',
                action: 'image_uploaded',
                reportId: reportId,
                status: 'success',
                duration: Date.now() - startTime,
                payload: isDataUri ? { imageThumbSize: imageUrl.length, symptoms } : { imageUrl, symptoms }
            });

            console.log("Hagnosis state...");
            // 4. Trigger the first agent
            setLoadingState('diagnosing');

        } catch (error: any) {
            console.error("Submission error:", error);
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            setError(`Failed to start the diagnosis process: ${error.message}. Check your connection and try again.`);
            setLoadingState('error');
            if (reportId) {
                await createLog({ agentName: 'ingestAgent', action: 'ingestion_failed', reportId, status: 'error', payload: { error: error.message } });
            }
        }
    };
    
    const resetForm = () => {
        removeImage();
        setSymptoms('');
        setReport(null);
        setError(null);
        setLoadingState('idle');
    }

    if (loadingState === 'done' && report?.plan && imagePreview) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold font-headline">Diagnosis Report</h1>
                    <Button onClick={resetForm}>Create New Report</Button>
                </div>
                <DiagnosisCard diagnosis={report as any} imageUrl={imagePreview} />
                <TreatmentPlanCard plan={report.plan as any} />
                <SuppliersCard />
            </div>
        );
    }
    
    if (['starting', 'diagnosing', 'planning'].includes(loadingState)) {
        return (
            <Card className="flex flex-col items-center justify-center p-12 min-h-[500px]">
                <LoadingSpinner className="h-16 w-16" />
                <h2 className="text-2xl font-bold mt-6">{loadingMessages[loadingState as LoadingState]}</h2>
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
                                <span className="text-sm">{profile?.location || "Faisalabad, Punjab (auto-detected)"}</span>
                            </div>
                        </div>

                         {error && (
                            <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-md">
                                <p className="font-bold">An Error Occurred</p>
                                <p>{error}</p>
                            </div>
                        )}

                        <Button type="submit" size="lg" className="w-full" disabled={!imageFile || isUserLoading || loadingState !== 'idle'}>
                            Get AI Diagnosis
                        </Button>
                    </CardContent>
                </form>
            </Card>
        </>
    );
}
