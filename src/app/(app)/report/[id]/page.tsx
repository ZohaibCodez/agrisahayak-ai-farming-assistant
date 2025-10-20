
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/firebase";
import { DiagnosisReport } from "@/lib/models";
import Image from "next/image";
import { ArrowLeft, Calendar, DollarSign, AlertTriangle, CheckCircle, Shield, ListChecks, FlaskConical, Clock, ShieldAlert } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getDoc, doc } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import LoadingSpinner from "@/components/agrisahayak/loading-spinner";
import { useToast } from '@/hooks/use-toast';
import { instantDiagnosisFromImageAndSymptoms } from '@/ai/flows/instant-diagnosis-from-image-and-symptoms';
import { generateLocalizedTreatmentPlan } from '@/ai/flows/localized-treatment-plans';
import { updateReport, createLog } from '@/lib/repositories';
import { useParams } from 'next/navigation';

export default function ReportDetailPage() {
    const { user } = useAuth();
    const { db } = useFirebase();
    const [report, setReport] = useState<DiagnosisReport | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    
    const params = useParams();
    const reportId = params.id as string;

    useEffect(() => {
        if (!user || !reportId || !db) return;

        let cancel = false;
        const fetchReport = async () => {
            try {
                const reportRef = doc(db, 'users', user.uid, 'reports', reportId);
                const reportSnap = await getDoc(reportRef);

                if (!cancel) {
                    if (reportSnap.exists()) {
                        setReport({ id: reportSnap.id, ...reportSnap.data() } as DiagnosisReport);
                    } else {
                        console.log("No such document!");
                        setReport(null);
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching report:', error);
                if (!cancel) setLoading(false);
            }
        };

        fetchReport();
        return () => { cancel = true; };
    }, [user, reportId, db]);

    // Helper: fetch image URL (or imageThumb) and convert to data URI
    async function urlToDataUri(url: string) {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch image');
        const blob = await res.blob();
        return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    const handleRetryDiagnosis = async () => {
        if (!user || !report) return;
        setLoading(true);
        try {
            await createLog({ agentName: 'diagnosticAgent', action: 'retry_started', reportId: report.id, status: 'info' });
            // Choose source: imageUrl -> imageThumb
            const src = report.imageUrl || report.imageThumb;
            if (!src) throw new Error('No image available for diagnosis');

            const photoDataUri = src.startsWith('data:') ? src : await urlToDataUri(src);

            // Re-run diagnosis
            const diagnosis = await instantDiagnosisFromImageAndSymptoms({ photoDataUri, symptoms: report.symptoms || '' });
            await updateReport(user.uid, report.id, {
                crop: diagnosis.crop, // Update crop with AI-detected crop
                disease: diagnosis.disease,
                confidence: diagnosis.confidence,
                affectedParts: diagnosis.affectedParts,
                severity: diagnosis.severity,
                description: diagnosis.description,
                status: 'Processing'
            } as any);

            await createLog({ agentName: 'diagnosticAgent', action: 'retry_completed', reportId: report.id, status: 'success', payload: diagnosis });

            // Re-run planning
            const plan = await generateLocalizedTreatmentPlan({ disease: diagnosis.disease, crop: diagnosis.crop });
            await updateReport(user.uid, report.id, { plan: plan as any, status: 'Complete' } as any);
            await createLog({ agentName: 'actionPlannerAgent', action: 'retry_planning_completed', reportId: report.id, status: 'success', payload: plan });

            // Refresh local copy
            setReport(prev => prev ? { ...prev, ...diagnosis, plan, status: 'Complete' } as DiagnosisReport : prev);
            toast({ title: 'Retry Successful', description: 'Diagnosis and plan updated.', className: 'bg-green-100 text-green-800' });
        } catch (err: any) {
            console.error('Retry failed:', err);
            await createLog({ agentName: 'diagnosticAgent', action: 'retry_failed', reportId: report?.id, status: 'error', payload: { error: err?.message || String(err) } });
            toast({ title: 'Retry Failed', description: 'Could not complete diagnosis. Try again later.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold font-headline">Loading Report...</h1>
                </div>
                <Card className="text-center p-12">
                    <LoadingSpinner message="Loading report details..." />
                </Card>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold font-headline">Report Not Found</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Report Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>The report you are looking for does not exist or you don't have permission to view it.</p>
                        <Button asChild className="mt-4"><Link href="/dashboard">Back to Dashboard</Link></Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const getSeverityVariant = (severity: 'None' | 'Low' | 'Medium' | 'High') => {
        switch (severity) {
            case 'None': return 'outline'; // Healthy plant - minimal visual emphasis
            case 'High': return 'destructive';
            case 'Medium': return 'secondary';
            case 'Low': return 'default';
        }
    };

    const getConfidenceColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Diagnosis Report</h1>
            </div>

            {/* Report Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{report.disease}</CardTitle>
                            <CardDescription>
                                {report.crop} • {report.createdAt?.toDate?.().toLocaleDateString() || 'Unknown date'}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {report.severity && <Badge variant={getSeverityVariant(report.severity)}>{report.severity} Severity</Badge>}
                            <Badge variant="outline">{report.status}</Badge>
                            {report.status === 'Pending' && (
                                <Button size="sm" variant="ghost" onClick={handleRetryDiagnosis} disabled={loading}>
                                    Retry Diagnosis
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image and Basic Info */}
                <div className="space-y-6">
                    {report.imageUrl && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Crop Image
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <Image
                                        src={report.imageUrl}
                                        alt="Crop diagnosis"
                                        width={400}
                                        height={300}
                                        className="rounded-lg object-cover w-full"
                                        data-ai-hint="crop disease"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Diagnosis Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Confidence Score</p>
                                    <p className={`text-2xl font-bold ${getConfidenceColor(report.confidence)}`}>
                                        {report.confidence}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Affected Parts</p>
                                    <p className="font-medium">{report.affectedParts?.join(', ')}</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Description</p>
                                <p className="text-sm leading-relaxed">{report.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Treatment Plan */}
                <div className="space-y-6">
                    {report.plan && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Treatment Plan Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Cost</p>
                                                <p className="font-bold text-lg">PKR {report.plan.totalCost.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Timeline</p>
                                                <p className="font-medium">{report.plan.timeline}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Detailed Treatment Steps */}
                            {report.plan.steps && report.plan.steps.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ListChecks className="h-5 w-5" />
                                            Treatment Steps
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type="single" collapsible className="w-full" defaultValue="step-1">
                                            {report.plan.steps.map((step) => (
                                                <AccordionItem value={`step-${step.stepNumber}`} key={step.stepNumber}>
                                                    <AccordionTrigger className="font-semibold text-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-primary/10 text-primary p-2 rounded-full">
                                                                <ListChecks className="h-5 w-5"/>
                                                            </div>
                                                            <span>Step {step.stepNumber}: {step.title}</span>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pl-8 space-y-4 border-l-2 ml-4 border-primary/20">
                                                        <p className="text-muted-foreground">{step.description}</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                            <div className="flex items-start gap-2">
                                                                <FlaskConical className="text-primary h-4 w-4 mt-1 flex-shrink-0"/>
                                                                <div>
                                                                    <p className="text-muted-foreground">Materials</p>
                                                                    <p className="font-medium">{step.materials.join(', ')}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <DollarSign className="text-green-500 h-4 w-4 mt-1 flex-shrink-0"/>
                                                                <div>
                                                                    <p className="text-muted-foreground">Est. Cost</p>
                                                                    <p className="font-medium">PKR {step.cost.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <Clock className="text-blue-500 h-4 w-4 mt-1 flex-shrink-0"/>
                                                                <div>
                                                                    <p className="text-muted-foreground">Timing</p>
                                                                    <p className="font-medium">{step.timing}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {step.safetyNotes && (
                                                            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                                                                <ShieldAlert className="h-5 w-5 mt-0.5 flex-shrink-0"/>
                                                                <div>
                                                                    <h4 className="font-semibold">Safety Note</h4>
                                                                    <p className="text-sm">{step.safetyNotes}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Prevention Tips */}
                            {report.plan.preventionTips && report.plan.preventionTips.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            Prevention Tips
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                            {report.plan.preventionTips.map((tip, index) => (
                                                <li key={index} className="text-sm">{tip}</li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Report Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Report ID</span>
                                <span className="font-mono text-sm">{report.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span>{report.createdAt?.toDate?.().toLocaleString() || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Updated</span>
                                <span>{report.updatedAt?.toDate?.().toLocaleString() || 'Unknown'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
