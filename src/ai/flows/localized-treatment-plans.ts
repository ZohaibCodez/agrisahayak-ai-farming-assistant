'use server';

/**
 * @fileOverview A Genkit flow that generates localized treatment plans for crop diseases.
 *
 * - generateLocalizedTreatmentPlan - A function that generates a treatment plan with local product names and cost estimates in PKR.
 * - LocalizedTreatmentPlanInput - The input type for the generateLocalizedTreatmentPlan function.
 * - LocalizedTreatmentPlanOutput - The return type for the generateLocalizedTreatmentPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LocalizedTreatmentPlanInputSchema = z.object({
  disease: z.string().describe('The name of the disease.'),
  crop: z.string().describe('The crop affected by the disease.'),
});

export type LocalizedTreatmentPlanInput = z.infer<typeof LocalizedTreatmentPlanInputSchema>;

const TreatmentStepSchema = z.object({
  stepNumber: z.number().describe('The step number in the treatment plan.'),
  title: z.string().describe('The title of the treatment step.'),
  description: z.string().describe('A detailed description of the treatment step.'),
  materials: z.array(z.string()).describe('A list of materials required for the step.'),
  cost: z.number().describe('The estimated cost of the materials in PKR.'),
  timing: z.string().describe('The timing of the treatment step (e.g., immediate, weekly).'),
  safetyNotes: z.string().describe('Important safety precautions for the step.'),
});

const LocalizedTreatmentPlanOutputSchema = z.object({
  steps: z.array(TreatmentStepSchema).describe('A list of treatment steps.'),
  totalCost: z.number().describe('The total estimated cost of the treatment plan in PKR.'),
  timeline: z.string().describe('The overall timeline for the treatment plan.'),
  preventionTips: z.array(z.string()).describe('A list of tips to prevent future occurrences of the disease.'),
});

export type LocalizedTreatmentPlanOutput = z.infer<typeof LocalizedTreatmentPlanOutputSchema>;

export async function generateLocalizedTreatmentPlan(
  input: LocalizedTreatmentPlanInput
): Promise<LocalizedTreatmentPlanOutput> {
  return localizedTreatmentPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'localizedTreatmentPlanPrompt',
  input: {schema: LocalizedTreatmentPlanInputSchema},
  output: {schema: LocalizedTreatmentPlanOutputSchema},
  prompt: `You are an expert agricultural advisor specializing in Pakistani crops.
Create a detailed treatment plan for {disease} in {crop} for a Pakistani farmer.

The treatment plan should:
- Be easy to understand for farmers with limited technical knowledge.
- Use locally available product names and brands.
- Include cost estimates in Pakistani Rupees (PKR).
- Provide a timeline for each step.
- Include safety precautions.

Format the output as a JSON object with the following structure:
{
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step Title",
      "description": "Detailed description of the step.",
      "materials": ["Material 1", "Material 2"],
      "cost": 1000, // Estimated cost in PKR
      "timing": "Immediate",
      "safetyNotes": "Wear gloves and a mask."
    }
  ],
  "totalCost": 2500, // Total estimated cost in PKR
  "timeline": "2 weeks",
  "preventionTips": ["Tip 1", "Tip 2"]
}
`,
});

const localizedTreatmentPlanFlow = ai.defineFlow(
  {
    name: 'localizedTreatmentPlanFlow',
    inputSchema: LocalizedTreatmentPlanInputSchema,
    outputSchema: LocalizedTreatmentPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
