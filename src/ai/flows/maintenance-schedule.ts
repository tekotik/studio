'use server';

/**
 * @fileOverview Generates a personalized maintenance schedule for a vehicle based on its make and model.
 *
 * - generateMaintenanceSchedule - A function that generates the maintenance schedule.
 * - MaintenanceScheduleInput - The input type for the generateMaintenanceSchedule function.
 * - MaintenanceScheduleOutput - The return type for the generateMaintenanceSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MaintenanceScheduleInputSchema = z.object({
  make: z.string().describe('The make of the vehicle.'),
  model: z.string().describe('The model of the vehicle.'),
});
export type MaintenanceScheduleInput = z.infer<typeof MaintenanceScheduleInputSchema>;

const MaintenanceScheduleOutputSchema = z.object({
  schedule: z
    .string()
    .describe(
      'A detailed maintenance schedule including service intervals and suggested part replacements.'
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
  prompt: `You are an expert automotive technician. Generate a detailed maintenance schedule for the following vehicle, including suggested part replacements and service intervals. The schedule should be comprehensive and easy to follow.

Vehicle Make: {{{make}}}
Vehicle Model: {{{model}}}`,
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
