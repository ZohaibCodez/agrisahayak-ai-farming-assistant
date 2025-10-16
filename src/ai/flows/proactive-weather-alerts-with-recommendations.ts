// Define WeatherAlertsFlow here
'use server';

/**
 * @fileOverview A weather alerts AI agent that generates proactive weather alerts with tailored advice for farmers.
 *
 * - proactiveWeatherAlertsWithRecommendations - A function that handles the weather alerts process.
 * - WeatherAlertsInput - The input type for the proactiveWeatherAlertsWithRecommendations function.
 * - WeatherAlertsOutput - The return type for the proactiveWeatherAlertsWithRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WeatherAlertsInputSchema = z.object({
  location: z
    .string()
    .describe('The location of the farmer.'),
  crops: z.array(z.string()).describe('The crops grown by the farmer.'),
  weatherConditions: z
    .string()
    .describe('The current weather conditions in the area.'),
});
export type WeatherAlertsInput = z.infer<typeof WeatherAlertsInputSchema>;

const WeatherAlertsOutputSchema = z.object({
  alert: z.string().describe('A weather alert message for the farmer.'),
  advice: z.string().describe('Tailored advice for the farmer based on the weather conditions and crops grown.'),
});
export type WeatherAlertsOutput = z.infer<typeof WeatherAlertsOutputSchema>;

export async function proactiveWeatherAlertsWithRecommendations(
  input: WeatherAlertsInput
): Promise<WeatherAlertsOutput> {
  return proactiveWeatherAlertsWithRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'weatherAlertsPrompt',
  input: {schema: WeatherAlertsInputSchema},
  output: {schema: WeatherAlertsOutputSchema},
  prompt: `You are an AI assistant providing weather alerts and advice to farmers.

  Location: {{location}}
  Crops: {{crops}}
  Weather Conditions: {{weatherConditions}}

  Generate a concise weather alert message and provide tailored advice based on the weather conditions and crops grown.
  Format the response as follows:
  {
    "alert": "Weather alert message",
    "advice": "Tailored advice for the farmer"
  }`,
});

const proactiveWeatherAlertsWithRecommendationsFlow = ai.defineFlow(
  {
    name: 'proactiveWeatherAlertsWithRecommendationsFlow',
    inputSchema: WeatherAlertsInputSchema,
    outputSchema: WeatherAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
