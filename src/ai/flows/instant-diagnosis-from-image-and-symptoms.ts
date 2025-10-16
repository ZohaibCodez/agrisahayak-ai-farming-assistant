'use server';

/**
 * @fileOverview A crop disease diagnosis AI agent that uses an image and symptoms.
 *
 * - instantDiagnosisFromImageAndSymptoms - A function that handles the crop disease diagnosis process.
 * - InstantDiagnosisFromImageAndSymptomsInput - The input type for the instantDiagnosisFromImageAndSymptoms function.
 * - InstantDiagnosisFromImageAndSymptomsOutput - The return type for the instantDiagnosisFromImageAndSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InstantDiagnosisFromImageAndSymptomsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
  symptoms: z.string().describe('The symptoms observed on the crop.'),
});
export type InstantDiagnosisFromImageAndSymptomsInput = z.infer<
  typeof InstantDiagnosisFromImageAndSymptomsInputSchema
>;

const InstantDiagnosisFromImageAndSymptomsOutputSchema = z.object({
  disease: z.string().describe('The name of the disease or pest affecting the crop.'),
  confidence: z.number().describe('The confidence score (0-100) of the diagnosis.'),
  affectedParts: z.string().array().describe('The parts of the crop affected by the disease or pest.'),
  severity: z
    .enum(['Low', 'Medium', 'High'])
    .describe('The severity level of the disease or pest.'),
  description: z.string().describe('A detailed description of the disease or pest and its symptoms.'),
});

export type InstantDiagnosisFromImageAndSymptomsOutput = z.infer<
  typeof InstantDiagnosisFromImageAndSymptomsOutputSchema
>;

export async function instantDiagnosisFromImageAndSymptoms(
  input: InstantDiagnosisFromImageAndSymptomsInput
): Promise<InstantDiagnosisFromImageAndSymptomsOutput> {
  return instantDiagnosisFromImageAndSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'instantDiagnosisFromImageAndSymptomsPrompt',
  input: {schema: InstantDiagnosisFromImageAndSymptomsInputSchema},
  output: {schema: InstantDiagnosisFromImageAndSymptomsOutputSchema},
  prompt: `You are an expert plant pathologist specializing in Pakistani crops (cotton, wheat, rice, sugarcane, maize).
Analyze the image and symptoms provided to diagnose the disease or pest affecting the crop.

Image: {{media url=photoDataUri}}
Symptoms: {{{symptoms}}}

Identify:
1. Disease/pest name
2. Confidence score (0-100%)
3. Affected parts
4. Severity (Low/Medium/High)
5. Description of the disease/pest and its symptoms

Respond in JSON format.`, // prettier-ignore
});

const instantDiagnosisFromImageAndSymptomsFlow = ai.defineFlow(
  {
    name: 'instantDiagnosisFromImageAndSymptomsFlow',
    inputSchema: InstantDiagnosisFromImageAndSymptomsInputSchema,
    outputSchema: InstantDiagnosisFromImageAndSymptomsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
