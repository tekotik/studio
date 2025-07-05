'use server';

/**
 * @fileOverview Создает персональный график технического обслуживания для автомобиля на основе его марки и модели.
 *
 * - generateMaintenanceSchedule - Функция, которая генерирует график технического обслуживания.
 * - MaintenanceScheduleInput - Тип входных данных для функции generateMaintenanceSchedule.
 * - MaintenanceScheduleOutput - Тип возвращаемого значения для функции generateMaintenanceSchedule.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MaintenanceScheduleInputSchema = z.object({
  make: z.string().describe('Марка автомобиля.'),
  model: z.string().describe('Модель автомобиля.'),
});
export type MaintenanceScheduleInput = z.infer<typeof MaintenanceScheduleInputSchema>;

const MaintenanceScheduleOutputSchema = z.object({
  schedule: z
    .string()
    .describe(
      'Подробный график технического обслуживания, включающий интервалы обслуживания и предлагаемые замены деталей.'
    ),
});
export type MaintenanceScheduleOutput = z.infer<typeof MaintenanceScheduleOutputSchema>;

export async function generateMaintenanceSchedule(
  input: MaintenanceScheduleInput
): Promise<MaintenanceScheduleOutput> {
  return maintenanceScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'maintenanceSchedulePrompt',
  input: {schema: MaintenanceScheduleInputSchema},
  output: {schema: MaintenanceScheduleOutputSchema},
  prompt: `Вы — эксперт-автотехник. Создайте подробный график технического обслуживания для следующего автомобиля, включая предлагаемые замены деталей и интервалы обслуживания. График должен быть исчерпывающим, простым для понимания и на русском языке.

Марка автомобиля: {{{make}}}
Модель автомобиля: {{{model}}}`,
});

const maintenanceScheduleFlow = ai.defineFlow(
  {
    name: 'maintenanceScheduleFlow',
    inputSchema: MaintenanceScheduleInputSchema,
    outputSchema: MaintenanceScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
