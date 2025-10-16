import { InstantDiagnosisFromImageAndSymptomsOutput } from "@/ai/flows/instant-diagnosis-from-image-and-symptoms";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { cn } from "@/lib/utils";

type DiagnosisCardProps = {
    diagnosis: InstantDiagnosisFromImageAndSymptomsOutput;
    imageUrl: string;
};

export default function DiagnosisCard({ diagnosis, imageUrl }: DiagnosisCardProps) {
    const getConfidenceColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800';
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800';
    };

    const getSeverityVariant = (severity: 'Low' | 'Medium' | 'High') => {
        switch (severity) {
            case 'High': return 'destructive';
            case 'Medium': return 'secondary';
            case 'Low': return 'default';
        }
    };
    
    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle className="text-2xl">AI Diagnosis: {diagnosis.disease}</CardTitle>
                <CardDescription>Generated on {new Date().toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <Image
                            src={imageUrl}
                            alt="Uploaded crop"
                            width={400}
                            height={400}
                            className="rounded-lg object-cover w-full aspect-square"
                            data-ai-hint="crop disease"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <div className={cn("p-4 rounded-lg border", getConfidenceColor(diagnosis.confidence))}>
                            <p className="text-sm font-medium">Confidence Score</p>
                            <p className="text-4xl font-bold">{diagnosis.confidence}%</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Details</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Severity:</span>
                                    <Badge variant={getSeverityVariant(diagnosis.severity)}>{diagnosis.severity}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Affected Parts:</span>
                                    <span className="font-medium text-right">{diagnosis.affectedParts.join(', ')}</span>
                                </div>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-2">Description</h3>
                            <p className="text-sm text-muted-foreground">{diagnosis.description}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
