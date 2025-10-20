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
import { knowledgeBase } from "@/lib/knowledge-base";
import { vectorSearch } from "@/lib/vector-search";

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
  crop: z.string().describe('The type of crop identified in the image (e.g., Cotton, Wheat, Rice, Sugarcane, Maize, etc.). If crop cannot be identified, use "Unknown Crop".'),
  disease: z.string().describe('The name of the disease or pest affecting the crop. Use "Healthy" ONLY if the plant shows absolutely no symptoms. If symptoms are present but disease cannot be identified, use "Unknown Disease" or "Unidentified Issue".'),
  confidence: z.number().describe('The confidence score (0-100) of the diagnosis.'),
  affectedParts: z.string().array().describe('The parts of the crop affected by the disease or pest. Use empty array [] for healthy plants.'),
  severity: z
    .enum(['None', 'Low', 'Medium', 'High'])
    .describe('The severity level of the disease or pest. Use "None" for healthy plants with no visible symptoms. Use Low/Medium/High only when disease is present.'),
  description: z.string().describe('A detailed description of the disease or pest and its symptoms. For healthy plants, describe why it is considered healthy. For unidentified diseases, describe the visible symptoms even if the specific disease cannot be named.'),
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

Knowledge Base Context:
{{knowledgeContext}}

Based on the image analysis and the knowledge base context above, identify:
1. Crop type (Cotton, Wheat, Rice, Sugarcane, Maize, or other common Pakistani crops). If unrecognizable, use "Unknown Crop".
2. Disease/pest name:
   - Use "Healthy" ONLY if plant shows absolutely NO visible symptoms (no spots, no yellowing, no wilting, etc.)
   - If symptoms ARE visible but disease cannot be identified: use "Unknown Disease" or "Unidentified Leaf Spotting" (describe what you see)
   - If you can match to knowledge base: use the specific disease name
3. Confidence score (0-100%) - consider both image analysis and symptom matching
4. Affected parts - from the knowledge base context. Use empty array [] for truly healthy plants.
5. Severity:
   - Use "None" ONLY for healthy plants with zero visible symptoms
   - Use "Low" for minor symptoms
   - Use "Medium" for moderate symptoms
   - Use "High" for severe symptoms
6. Description:
   - For healthy: explain why it's considered healthy (green leaves, no spots, vigorous growth)
   - For unknown disease: describe the visible symptoms in detail (yellowing, brown spots, size, location, etc.)
   - For identified disease: use knowledge base information

CRITICAL: If you see yellowing, brown spots, wilting, or any abnormal appearance → DO NOT say "Healthy". Instead say "Unknown Disease" with appropriate severity.

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

    try {
      // Step 1: Use RAG to find similar diseases based on symptoms
      const similarDiseases = await vectorSearch.searchSimilarDiseases(
        input.symptoms,
        undefined, // crop will be detected by AI
        5, // top 5 similar diseases
        0.3 // similarity threshold
      );

      // Step 2: Prepare context from knowledge base
      const knowledgeContext = similarDiseases.map(disease => 
        `Disease: ${disease.disease}\nCrop: ${disease.crop}\nSymptoms: ${disease.symptoms.join(', ')}\nSeverity: ${disease.severity}\nConfidence: ${disease.confidence}`
      ).join('\n\n');

      // Step 3: Create enhanced prompt with knowledge context
      const enhancedPrompt = ai.definePrompt({
        name: 'ragEnhancedDiagnosisPrompt',
        input: {schema: InstantDiagnosisFromImageAndSymptomsInputSchema},
        output: {schema: InstantDiagnosisFromImageAndSymptomsOutputSchema},
        prompt: `You are an expert plant pathologist specializing in Pakistani crops (cotton, wheat, rice, sugarcane, maize).
Analyze the image and symptoms provided to identify the crop type and diagnose any disease or pest affecting it.

Image: {{media url=photoDataUri}}
Symptoms: {{{symptoms}}}

Knowledge Base Context:
${knowledgeContext}

Based on the image analysis and the knowledge base context above, identify:
1. Crop type (Cotton, Wheat, Rice, Sugarcane, Maize, or other common Pakistani crops). If unrecognizable, use "Unknown Crop".
2. Disease/pest name:
   - Use "Healthy" ONLY if plant shows absolutely NO visible symptoms (no spots, no yellowing, no wilting, etc.)
   - If symptoms ARE visible but disease cannot be identified: use "Unknown Disease" or "Unidentified Leaf Spotting" (describe what you see)
   - If you can match to knowledge base: use the specific disease name
3. Confidence score (0-100%) - consider both image analysis and symptom matching
4. Affected parts - from the knowledge base context. Use empty array [] for truly healthy plants.
5. Severity:
   - Use "None" ONLY for healthy plants with zero visible symptoms
   - Use "Low" for minor symptoms
   - Use "Medium" for moderate symptoms
   - Use "High" for severe symptoms
6. Description:
   - For healthy: explain why it's considered healthy (green leaves, no spots, vigorous growth)
   - For unknown disease: describe the visible symptoms in detail (yellowing, brown spots, size, location, etc.)
   - For identified disease: use knowledge base information

CRITICAL: If you see yellowing, brown spots, wilting, or any abnormal appearance → DO NOT say "Healthy". Instead say "Unknown Disease" with appropriate severity.

Respond in JSON format.`,
      });

      const { output } = await retry(() => enhancedPrompt(input), 3, 2000);
      return output!;
    } catch (error) {
      console.error('RAG-enhanced diagnosis error:', error);
      
      // Fallback to basic AI diagnosis if RAG fails
      const { output } = await retry(() => prompt(input), 3, 2000);
      return output!;
    }
  }
);
