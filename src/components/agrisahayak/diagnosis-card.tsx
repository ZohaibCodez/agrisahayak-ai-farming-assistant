import { InstantDiagnosisFromImageAndSymptomsOutput } from "@/ai/flows/instant-diagnosis-from-image-and-symptoms";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Bot, AlertTriangle, Leaf } from "lucide-react";

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

    const getSeverityVariant = (severity: 'None' | 'Low' | 'Medium' | 'High') => {
        switch (severity) {
            case 'None': return 'outline'; // Healthy plant - minimal visual emphasis
            case 'High': return 'destructive';
            case 'Medium': return 'secondary';
            case 'Low': return 'default';
        }
    };
    
    return (
        <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-emerald-50 border-b border-primary/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl text-gray-900">AI Diagnosis: {diagnosis.disease}</CardTitle>
                        <CardDescription className="text-base">
                            Crop: <span className="font-semibold text-primary">{diagnosis.crop}</span> • Generated on {new Date().toLocaleString()}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <div className="relative group">
                            <Image
                                src={imageUrl}
                                alt="Uploaded crop"
                                width={500}
                                height={400}
                                className="rounded-xl object-cover w-full h-80 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                                data-ai-hint="crop disease"
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                                <span className="text-sm font-medium text-gray-700">Crop Image</span>
                            </div>
                        </div>
                    </div>

                    {/* Diagnosis Details */}
                    <div className="space-y-6">
                        {/* Confidence Score */}
                        <div className={cn("p-6 rounded-xl border-2 shadow-lg", getConfidenceColor(diagnosis.confidence))}>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-lg font-semibold">Confidence Score</p>
                                <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold">{diagnosis.confidence}%</span>
                                </div>
                            </div>
                            <div className="w-full bg-white/30 rounded-full h-3">
                                <div 
                                    className="bg-current h-3 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${diagnosis.confidence}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Severity and Affected Parts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Severity Level
                                </h4>
                                <Badge 
                                    variant={getSeverityVariant(diagnosis.severity)} 
                                    className="text-sm px-3 py-1"
                                >
                                    {diagnosis.severity}
                                </Badge>
                            </div>
                            
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <Leaf className="h-4 w-4" />
                                    Affected Parts
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {diagnosis.affectedParts.map((part, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {part}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Bot className="h-4 w-4" />
                                AI Analysis
                            </h4>
                            <p className="text-gray-700 leading-relaxed">{diagnosis.description}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
