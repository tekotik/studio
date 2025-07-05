"use server";

import { analyzeSymptoms, SymptomAnalysisInput, SymptomAnalysisOutput } from "@/ai/flows/symptom-analysis";
import { generateMaintenanceSchedule, MaintenanceScheduleInput, MaintenanceScheduleOutput } from "@/ai/flows/maintenance-schedule";
import { z } from "zod";

const symptomSchema = z.object({
  vehicleDetails: z.string().min(5, "Пожалуйста, предоставьте больше данных об автомобиле."),
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
    vehicleDetails: formData.get("vehicleDetails"),
    symptoms: formData.get("symptoms"),
  };

  const validation = symptomSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      status: "error",
      message: validation.error.errors.map((e) => e.message).join(", "),
    };
  }
  
  try {
    const result = await analyzeSymptoms(validation.data as SymptomAnalysisInput);
    if (!result || !result.diagnoses || result.diagnoses.length === 0) {
      return { status: "error", message: "ИИ не смог поставить диагноз. Пожалуйста, попробуйте быть более конкретным." };
    }
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
    return { status: "success", message: "График создан.", data: result };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз." };
  }
}
