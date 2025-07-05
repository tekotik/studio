// Symptom Analysis Flow
'use server';
/**
 * @fileOverview Анализирует симптомы автомобиля для предоставления возможных диагнозов и причин.
 *
 * - analyzeSymptoms - Функция, которая анализирует симптомы автомобиля.
 * - SymptomAnalysisInput - Тип входных данных для функции analyzeSymptoms.
 * - SymptomAnalysisOutput - Тип возвращаемого значения для функции analyzeSymptoms.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomAnalysisInputSchema = z.object({
  vehicleDetails: z.string().describe('Марка, модель и год выпуска автомобиля.'),
  symptoms: z.string().describe('Подробное описание симптомов автомобиля.'),
});
export type SymptomAnalysisInput = z.infer<typeof SymptomAnalysisInputSchema>;

const SymptomAnalysisOutputSchema = z.object({
  diagnoses: z.array(
    z.object({
      diagnosis: z.string().describe('Возможный диагноз проблемы с автомобилем.'),
      likelyCauses: z.string().describe('Вероятные причины для данного диагноза.'),
    })
  ).describe('Список возможных диагнозов и их вероятных причин.'),
});
export type SymptomAnalysisOutput = z.infer<typeof SymptomAnalysisOutputSchema>;

export async function analyzeSymptoms(input: SymptomAnalysisInput): Promise<SymptomAnalysisOutput> {
  return symptomAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomAnalysisPrompt',
  input: {schema: SymptomAnalysisInputSchema},
  output: {schema: SymptomAnalysisOutputSchema},
  prompt: `Вы — опытный механик. Пользователь опишет проблемы со своим автомобилем, а вы предоставите список возможных диагнозов с вероятными причинами. Ответ должен быть на русском языке.

Данные автомобиля: {{{vehicleDetails}}}
Симптомы: {{{symptoms}}}

Предоставьте свой ответ в формате JSON. Убедитесь, что поля diagnoses и likelyCauses заполнены действительными и полезными описаниями на русском языке.
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
