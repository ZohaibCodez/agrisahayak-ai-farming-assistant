import { LocalizedTreatmentPlanOutput } from "@/ai/flows/localized-treatment-plans";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, ShieldAlert, DollarSign, Calendar, ListChecks, FlaskConical, Clock, Target, AlertCircle, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type TreatmentPlanCardProps = {
    plan: LocalizedTreatmentPlanOutput;
};

export default function TreatmentPlanCard({ plan }: TreatmentPlanCardProps) {
    const totalSteps = plan.steps.length;
    const completedSteps = 0; // This would come from user progress tracking
    
    return (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                                <Target className="h-6 w-6 text-primary"/>
                            </div>
                            Personalized Treatment Plan
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            A comprehensive step-by-step guide to help your crop recover and thrive.
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1 text-sm">
                        <TrendingUp className="h-4 w-4 mr-1"/>
                        {totalSteps} Steps
                    </Badge>
                </div>
                
                {/* Progress Overview */}
                <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">Overall Progress</span>
                        <span className="text-gray-500">{completedSteps}/{totalSteps} completed</span>
                    </div>
                    <Progress value={(completedSteps / totalSteps) * 100} className="h-2" />
                </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full" defaultValue="step-1">
                    {plan.steps.map((step, index) => (
                        <AccordionItem value={`step-${step.stepNumber}`} key={step.stepNumber} className="border rounded-lg mb-3">
                            <AccordionTrigger className="font-semibold text-lg hover:no-underline px-6 py-4">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            p-3 rounded-full transition-all duration-300
                                            ${index < completedSteps 
                                                ? 'bg-green-100 text-green-600 border-2 border-green-200' 
                                                : index === completedSteps 
                                                ? 'bg-primary/10 text-primary border-2 border-primary/20 animate-pulse'
                                                : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                                            }
                                        `}>
                                            {index < completedSteps ? (
                                                <CheckCircle className="h-5 w-5"/>
                                            ) : (
                                                <ListChecks className="h-5 w-5"/>
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold">Step {step.stepNumber}</span>
                                                {index < completedSteps && (
                                                    <Badge variant="default" className="text-xs">Completed</Badge>
                                                )}
                                                {index === completedSteps && (
                                                    <Badge variant="secondary" className="text-xs animate-pulse">Current</Badge>
                                                )}
                                            </div>
                                            <p className="text-base font-medium text-gray-900">{step.title}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4"/>
                                            <span>{step.timing}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-4 w-4"/>
                                            <span>PKR {step.cost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 space-y-6">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-primary">
                                    <p className="text-gray-700 leading-relaxed">{step.description}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <InfoCard 
                                        icon={<FlaskConical className="text-primary"/>} 
                                        label="Materials Needed" 
                                        value={step.materials.join(', ')}
                                        color="blue"
                                    />
                                    <InfoCard 
                                        icon={<DollarSign className="text-green-600"/>} 
                                        label="Estimated Cost" 
                                        value={`PKR ${step.cost.toLocaleString()}`}
                                        color="green"
                                    />
                                    <InfoCard 
                                        icon={<Calendar className="text-blue-600"/>} 
                                        label="Timing" 
                                        value={step.timing}
                                        color="purple"
                                    />
                                </div>
                                
                                {step.safetyNotes && (
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <ShieldAlert className="h-5 w-5 text-red-600"/>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4"/>
                                                Safety Notice
                                            </h4>
                                            <p className="text-sm text-red-700">{step.safetyNotes}</p>
                                        </div>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                
                <Separator className="my-8" />
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-3 text-green-800">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600"/>
                        </div>
                        Prevention Tips
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {plan.preventionTips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-green-700">{tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
            
            <CardFooter className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-b-lg border-t">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600"/>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Timeline</p>
                        <p className="font-bold text-lg text-gray-900">{plan.timeline}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600"/>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Investment</p>
                        <p className="font-bold text-2xl text-green-600">PKR {plan.totalCost.toLocaleString()}</p>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

const InfoCard = ({ 
    icon, 
    label, 
    value, 
    color = "blue" 
}: { 
    icon: React.ReactNode, 
    label: string, 
    value: string,
    color?: "blue" | "green" | "purple" | "red"
}) => {
    const colorClasses = {
        blue: "bg-blue-50 border-blue-200 text-blue-800",
        green: "bg-green-50 border-green-200 text-green-800",
        purple: "bg-purple-50 border-purple-200 text-purple-800",
        red: "bg-red-50 border-red-200 text-red-800"
    };

    return (
        <div className={`p-4 rounded-lg border ${colorClasses[color]} transition-all duration-200 hover:shadow-md`}>
            <div className="flex items-start gap-3">
                <div className="p-2 bg-white/60 rounded-lg">
                    {icon}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium opacity-80 mb-1">{label}</p>
                    <p className="font-bold text-sm leading-relaxed">{value}</p>
                </div>
            </div>
        </div>
    );
};
