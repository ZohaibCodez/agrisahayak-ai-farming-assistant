import { LocalizedTreatmentPlanOutput } from "@/ai/flows/localized-treatment-plans";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, ShieldAlert, DollarSign, Calendar, ListChecks, FlaskConical } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type TreatmentPlanCardProps = {
    plan: LocalizedTreatmentPlanOutput;
};

export default function TreatmentPlanCard({ plan }: TreatmentPlanCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Personalized Treatment Plan</CardTitle>
                <CardDescription>A step-by-step guide to help your crop recover.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full" defaultValue="step-1">
                    {plan.steps.map((step) => (
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
                                    <InfoItem icon={<FlaskConical className="text-primary"/>} label="Materials" value={step.materials.join(', ')} />
                                    <InfoItem icon={<DollarSign className="text-green-500"/>} label="Est. Cost" value={`PKR ${step.cost.toLocaleString()}`} />
                                    <InfoItem icon={<Calendar className="text-blue-500"/>} label="Timing" value={step.timing} />
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
                <Separator className="my-6" />
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><CheckCircle className="text-primary h-5 w-5"/> Prevention Tips</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {plan.preventionTips.map((tip, index) => <li key={index}>{tip}</li>)}
                  </ul>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 flex justify-between items-center rounded-b-lg">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground"/>
                    <span className="font-semibold">Total Timeline: {plan.timeline}</span>
                </div>
                <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground"/>
                    <span className="font-bold text-lg">Total Cost: PKR {plan.totalCost.toLocaleString()}</span>
                </div>
            </CardFooter>
        </Card>
    );
}

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    </div>
);
