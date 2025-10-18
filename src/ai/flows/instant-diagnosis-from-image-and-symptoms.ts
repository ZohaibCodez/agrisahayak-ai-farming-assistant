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
  crop: z.string().describe('The type of crop identified in the image (e.g., Cotton, Wheat, Rice, Sugarcane, Maize, etc.).'),
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
Analyze the image and symptoms provided to identify the crop type and diagnose any disease or pest affecting it.

Image: {{media url=photoDataUri}}
Symptoms: {{{symptoms}}}

Identify:
1. Crop type (Cotton, Wheat, Rice, Sugarcane, Maize, or other common Pakistani crops)
2. Disease/pest name (if any)
3. Confidence score (0-100%)
4. Affected parts
5. Severity (Low/Medium/High)
6. Description of the disease/pest and its symptoms

If no disease is visible, set disease to "Healthy" and confidence to 95+.

Respond in JSON format.`, // prettier-ignore
});

const instantDiagnosisFromImageAndSymptomsFlow = ai.defineFlow(
  {
    name: 'instantDiagnosisFromImageAndSymptomsFlow',
    inputSchema: InstantDiagnosisFromImageAndSymptomsInputSchema,
    outputSchema: InstantDiagnosisFromImageAndSymptomsOutputSchema,
  },
  async input => {
    // Retry/backoff helper for transient network errors
    async function retry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 1000): Promise<T> {
      let lastErr: any;
      for (let i = 0; i < attempts; i++) {
        try {
          return await fn();
        } catch (err: any) {
          lastErr = err;
          // For non-transient errors, rethrow immediately
          const code = err?.code || '';
          if (code && !['UND_ERR_CONNECT_TIMEOUT', 'ETIMEDOUT', 'ECONNRESET'].includes(code)) {
            throw err;
          }
          // exponential backoff
          const backoff = delayMs * Math.pow(2, i);
          await new Promise(r => setTimeout(r, backoff));
        }
      }
      throw lastErr;
    }

    const { output } = await retry(() => prompt(input), 3, 2000);
    return output!;
  }
);
