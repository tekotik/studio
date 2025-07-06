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
  prompt: `Вы — эксперт-автомеханик. Пользователь опишет проблемы со своим автомобилем, а вы предоставите список возможных диагнозов с вероятными причинами. Ответ должен быть на русском языке.

Данные автомобиля: {{{vehicleDetails}}}
Симптомы: {{{symptoms}}}

Предоставьте свой ответ в виде валидного объекта JSON, который строго соответствует следующей схеме. Не включайте никакой текст или форматирование за пределами объекта JSON.
Объект JSON должен иметь ключ "diagnoses", который является массивом объектов. Каждый объект в массиве должен иметь ключ "diagnosis" и ключ "likelyCauses".

Пример требуемого формата JSON:
{
  "diagnoses": [
    {
      "diagnosis": "Изношенные тормозные колодки",
      "likelyCauses": "Высокочастотный визг при торможении, увеличенный тормозной путь."
    },
    {
      "diagnosis": "Проблемы с рулевым управлением или подвеской",
      "likelyCauses": "Автомобиль уводит в сторону при движении, вибрация руля."
    }
  ]
}

Убедитесь, что поля "diagnosis" и "likelyCauses" заполнены действительными и полезными описаниями на русском языке.`,
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
