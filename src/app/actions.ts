"use server";

import { analyzeSymptoms, SymptomAnalysisInput, SymptomAnalysisOutput } from "@/ai/flows/symptom-analysis";
import { generateMaintenanceSchedule, MaintenanceScheduleInput, MaintenanceScheduleOutput } from "@/ai/flows/maintenance-schedule";
import { z } from "zod";
import { chatWithAi, ChatInput, ChatOutput } from "@/ai/flows/chat";
import { addNews } from "@/lib/news";

const symptomSchema = z.object({
  make: z.string().min(2, "Пожалуйста, введите действительную марку."),
  model: z.string().min(1, "Пожалуйста, введите действительную модель."),
  year: z.string().refine((year) => !isNaN(parseInt(year)) && parseInt(year) > 1900 && parseInt(year) <= new Date().getFullYear() + 1, {
    message: "Пожалуйста, введите действительный год.",
  }),
  symptoms: z.string().min(10, "Пожалуйста, опишите симптомы более подробно."),
});

const maintenanceSchema = z.object({
  make: z.string().min(2, "Пожалуйста, введите действительную марку."),
  model: z.string().min(1, "Пожалуйста, введите действительную модель."),
});

type State<T> = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
  data?: T;
};

export async function handleSymptomAnalysis(
  prevState: State<SymptomAnalysisOutput>,
  formData: FormData
): Promise<State<SymptomAnalysisOutput>> {
  const rawData = {
    make: formData.get("make"),
    model: formData.get("model"),
    year: formData.get("year"),
    symptoms: formData.get("symptoms"),
  };

  const validation = symptomSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      status: "error",
      message: validation.error.errors.map((e) => e.message).join(", "),
    };
  }
  
  const analysisInput: SymptomAnalysisInput = {
    vehicleDetails: `${validation.data.make} ${validation.data.model} ${validation.data.year}`,
    symptoms: validation.data.symptoms,
  };

  try {
    const result = await analyzeSymptoms(analysisInput);
    if (!result || !result.diagnoses || result.diagnoses.length === 0) {
      return { status: "error", message: "ИИ не смог поставить диагноз. Пожалуйста, попробуйте быть более конкретным." };
    }

    await addNews({
      title: `Диагностика для ${validation.data.make} ${validation.data.model}`,
      question: `Детали: ${analysisInput.vehicleDetails}. Симптомы: ${analysisInput.symptoms}`,
      answer: JSON.stringify(result.diagnoses, null, 2),
      source: 'Анализ симптомов'
    });
    
    return { status: "success", message: "Анализ завершен.", data: result };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз." };
  }
}


export async function handleMaintenanceSchedule(
  prevState: State<MaintenanceScheduleOutput>,
  formData: FormData
): Promise<State<MaintenanceScheduleOutput>> {
  const rawData = {
    make: formData.get("make"),
    model: formData.get("model"),
  };

  const validation = maintenanceSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      status: "error",
      message: validation.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const result = await generateMaintenanceSchedule(validation.data as MaintenanceScheduleInput);
    if (!result || !result.schedule) {
      return { status: "error", message: "ИИ не смог создать график. Пожалуйста, проверьте данные автомобиля." };
    }

    await addNews({
        title: `График ТО для ${validation.data.make} ${validation.data.model}`,
        question: `Марка: ${validation.data.make}, Модель: ${validation.data.model}`,
        answer: result.schedule,
        source: 'Советник по ТО'
    });

    return { status: "success", message: "График создан.", data: result };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз." };
  }
}

export type ChatMessage = {
  role: "user" | "model" | "system";
  content: string;
};

type ChatState = {
  status: "idle" | "loading" | "success" | "error";
  messages: ChatMessage[];
  error?: string;
};

export async function handleChatMessage(
  prevState: ChatState,
  formData: FormData
): Promise<ChatState> {
  const message = formData.get("message") as string;
  if (!message || message.trim().length === 0) {
    return prevState;
  }

  const userMessage: ChatMessage = { role: "user", content: message };
  const newMessages: ChatMessage[] = [...prevState.messages, userMessage];

  const chatInput: ChatInput = {
    message: message,
    history: prevState.messages.filter(m => m.role !== 'system').map(m => ({role: m.role, content: m.content})),
  };

  try {
    const result = await chatWithAi(chatInput);
    if (!result || !result.response) {
       const errorMessage: ChatMessage = { role: "system", content: "ИИ не смог ответить. Попробуйте перефразировать." };
       return { status: "error", messages: [...newMessages, errorMessage], error: "ИИ не смог ответить." };
    }

    await addNews({
        title: message,
        question: message,
        answer: result.response,
        source: 'Чат-ассистент'
    });
    
    const aiMessage: ChatMessage = { role: "model", content: result.response };
    return { status: "success", messages: [...newMessages, aiMessage] };
  } catch (error) {
    console.error(error);
    const errorMessage: ChatMessage = { role: "system", content: "Произошла ошибка. Пожалуйста, попробуйте еще раз." };
    return { status: "error", messages: [...newMessages, errorMessage], error: "Произошла непредвиденная ошибка." };
  }
}
