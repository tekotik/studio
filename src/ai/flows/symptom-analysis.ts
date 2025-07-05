// Symptom Analysis Flow
'use server';
/**
 * @fileOverview Analyzes vehicle symptoms to provide potential diagnoses and causes.
 *
 * - analyzeSymptoms - A function that analyzes vehicle symptoms.
 * - SymptomAnalysisInput - The input type for the analyzeSymptoms function.
 * - SymptomAnalysisOutput - The return type for the analyzeSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomAnalysisInputSchema = z.object({
  vehicleDetails: z.string().describe('The make, model, and year of the vehicle.'),
  symptoms: z.string().describe('A detailed description of the vehicle symptoms.'),
});
export type SymptomAnalysisInput = z.infer<typeof SymptomAnalysisInputSchema>;

const SymptomAnalysisOutputSchema = z.object({
  diagnoses: z.array(
    z.object({
      diagnosis: z.string().describe('A potential diagnosis for the vehicle issue.'),
      likelyCauses: z.string().describe('The likely causes for the diagnosis.'),
    })
  ).describe('A list of potential diagnoses and their likely causes.'),
});
export type SymptomAnalysisOutput = z.infer<typeof SymptomAnalysisOutputSchema>;

export async function analyzeSymptoms(input: SymptomAnalysisInput): Promise<SymptomAnalysisOutput> {
  return symptomAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomAnalysisPrompt',
  input: {schema: SymptomAnalysisInputSchema},
  output: {schema: SymptomAnalysisOutputSchema},
  prompt: `You are an experienced mechanic. A user will describe their car issues, and you will provide a list of potential diagnoses with likely causes.

Vehicle Details: {{{vehicleDetails}}}
Symptoms: {{{symptoms}}}

Provide your answer in JSON format. Make sure the diagnoses and likelyCauses fields are populated with valid and helpful descriptions.
`, // Ensure the response is valid JSON
});

const symptomAnalysisFlow = ai.defineFlow(
  {
    name: 'symptomAnalysisFlow',
    inputSchema: SymptomAnalysisInputSchema,
    outputSchema: SymptomAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
