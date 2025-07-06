'use server';
/**
 * @fileOverview A conversational AI chat flow for the AskAI Doctor.
 *
 * - chatWithAi - A function that handles a single turn in a conversation.
 * - ChatInput - The input type for the chatWithAi function.
 * - ChatOutput - The return type for the chatWithAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe("The user's message."),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The conversation history.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response to the user."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithAi(
  input: ChatInput
): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `Вы — POCHINI, дружелюбный и услужливый ассистент-автомеханик. Ваша задача — отвечать на вопросы пользователей об автомобилях, их обслуживании и ремонте. Будьте кратки, вежливы и информативны. Ответ должен быть на русском языке.

  {{#if history}}
  Вот история нашего разговора:
  {{#each history}}
  {{#if (eq this.role "user")}}
  Пользователь: {{{this.content}}}
  {{else}}
  Вы: {{{this.content}}}
  {{/if}}
  {{/each}}
  {{/if}}

  Текущий вопрос пользователя: {{{message}}}
  Ваш ответ:`,
});


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
