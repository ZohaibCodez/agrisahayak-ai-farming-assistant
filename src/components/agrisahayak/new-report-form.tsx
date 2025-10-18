
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
import { ProgressSteps } from "@/components/ui/progress-enhanced";
import { SkeletonForm } from "@/components/ui/skeleton-enhanced";
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
                        crop: diagnosis.crop, // Update crop with AI-detected crop
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
                        crop: report.crop || 'Unknown', // Use AI-detected crop or fallback
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
                crop: profile?.crops?.[0] || 'Crop to be identified', // Use first crop from profile or placeholder
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
        const steps = ['Upload Image', 'AI Analysis', 'Treatment Plan'];
        const currentStepIndex = loadingState === 'starting' ? 0 : loadingState === 'diagnosing' ? 1 : 2;
        const progress = ((currentStepIndex + 1) / steps.length) * 100;

        return (
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold font-headline text-gray-900 mb-4">Processing Your Diagnosis</h1>
                    <p className="text-lg text-gray-600">Our AI is analyzing your crop image and symptoms.</p>
                </div>

                <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-green-50/30 min-h-[600px] flex flex-col items-center justify-center p-12">
                    {/* Progress Steps */}
                    <div className="w-full max-w-md mb-8">
                        <ProgressSteps 
                            steps={steps} 
                            currentStep={currentStepIndex + 1}
                            className="mb-6"
                        />
                    </div>

                    <LoadingSpinner 
                        message={loadingMessages[loadingState as LoadingState]}
                        className="mb-8"
                        size="lg"
                        variant="agricultural"
                        showProgress={true}
                        progress={progress}
                    />
                    
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 animate-pulse">
                            {loadingState === 'starting' && 'Uploading Image...'}
                            {loadingState === 'diagnosing' && 'Analyzing with AI...'}
                            {loadingState === 'planning' && 'Creating Treatment Plan...'}
                        </h2>
                        <p className="text-gray-600 max-w-md">
                            {loadingState === 'starting' && 'We\'re securely uploading and processing your image.'}
                            {loadingState === 'diagnosing' && 'Our AI is examining your crop for diseases and pests.'}
                            {loadingState === 'planning' && 'Generating a personalized treatment plan for your specific needs.'}
                        </p>
                        
                        {imagePreview && (
                            <div className="mt-8">
                                <div className="relative inline-block group">
                                    <Image 
                                        src={imagePreview} 
                                        alt="upload preview" 
                                        width={200} 
                                        height={150} 
                                        className="rounded-xl shadow-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300" 
                                    />
                                    <div className="absolute inset-0 bg-primary/20 rounded-xl group-hover:bg-primary/10 transition-colors duration-300"></div>
                                    <div className="absolute inset-0 rounded-xl border-2 border-primary/30 animate-pulse"></div>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 animate-pulse">
                            <p className="text-sm text-blue-800">
                                <strong>Tip:</strong> This process usually takes 30-60 seconds. Please don't close this page.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline text-gray-900 mb-4">Create New Diagnosis Report</h1>
                <p className="text-lg text-gray-600">Upload a photo of your crop and describe the symptoms to get an AI-powered diagnosis.</p>
            </div>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="pb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Crop Diagnosis Form</CardTitle>
                                <CardDescription className="text-base">Follow these simple steps to get your AI diagnosis</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Step 1: Image Upload */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                                <Label className="text-lg font-semibold">Upload Crop Image</Label>
                            </div>
                            
                            {imagePreview ? (
                                <div className="relative group">
                                    <div className="relative w-full max-w-md mx-auto">
                                        <Image 
                                            src={imagePreview} 
                                            alt="Crop preview" 
                                            width={400} 
                                            height={300} 
                                            className="rounded-xl border-2 border-gray-200 shadow-lg object-cover w-full h-64" 
                                        />
                                        <Button 
                                            variant="destructive" 
                                            size="icon" 
                                            className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" 
                                            onClick={removeImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-center text-sm text-gray-500 mt-2">Click the X to remove and upload a different image</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label htmlFor="image-upload" className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group">
                                        <div className="flex flex-col items-center justify-center pt-8 pb-8">
                                            <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
                                                <Upload className="w-8 h-8 text-primary" />
                                            </div>
                                            <p className="mb-2 text-lg font-semibold text-gray-700">
                                                <span className="text-primary">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-sm text-gray-500">PNG, JPG (MAX. 10MB)</p>
                                            <p className="text-xs text-gray-400 mt-2">For best results, ensure good lighting and clear focus</p>
                                        </div>
                                    </label>
                                    <Input 
                                        id="image-upload" 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/png, image/jpeg" 
                                        onChange={handleImageChange} 
                                    />
                                </div>
                            )}
                        </div>

                        {/* Step 2: Symptoms Description */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                                <Label htmlFor="symptoms" className="text-lg font-semibold">Describe the Symptoms</Label>
                            </div>
                            
                            <div className="space-y-3">
                                <Textarea
                                    id="symptoms"
                                    placeholder="Describe what you observe: yellow spots on leaves, wilting, stunted growth, unusual patterns, etc. Be as detailed as possible for better diagnosis."
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    rows={5}
                                    maxLength={500}
                                    className="text-base border-2 border-gray-200 focus:border-primary transition-colors rounded-xl resize-none"
                                />
                                <div className="flex justify-between items-center text-sm">
                                    <p className="text-gray-500">Include details about affected areas, timing, and any other observations</p>
                                    <span className={`font-medium ${symptoms.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {symptoms.length} / 500
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Location */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                                <Label className="text-lg font-semibold">Location Information</Label>
                            </div>
                            
                            <div className="flex items-center p-4 rounded-xl border-2 border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                                <MapPin className="h-6 w-6 text-primary mr-4" />
                                <div>
                                    <p className="font-medium text-gray-900">{profile?.location || "Faisalabad, Punjab"}</p>
                                    <p className="text-sm text-gray-600">Auto-detected from your profile</p>
                                </div>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="p-4 bg-red-50 border-2 border-red-200 text-red-800 text-sm rounded-xl">
                                <div className="flex items-start gap-3">
                                    <div className="p-1 bg-red-100 rounded-full">
                                        <X className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold">An Error Occurred</p>
                                        <p className="mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-6">
                            <Button 
                                type="submit" 
                                size="lg" 
                                className="w-full bg-primary hover:bg-primary/90 text-lg py-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                                disabled={!imageFile || isUserLoading || loadingState !== 'idle'}
                            >
                                {loadingState === 'idle' ? (
                                    <>
                                        <Upload className="mr-2 h-5 w-5" />
                                        Get AI Diagnosis
                                    </>
                                ) : (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </>
                                )}
                            </Button>
                            
                            {!imageFile && (
                                <p className="text-center text-sm text-gray-500 mt-3">
                                    Please upload an image to continue
                                </p>
                            )}
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
