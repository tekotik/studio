"use server";

import { analyzeSymptoms, SymptomAnalysisInput, SymptomAnalysisOutput } from "@/ai/flows/symptom-analysis";
import { generateMaintenanceSchedule, MaintenanceScheduleInput, MaintenanceScheduleOutput } from "@/ai/flows/maintenance-schedule";
import { z } from "zod";

const symptomSchema = z.object({
  vehicleDetails: z.string().min(5, "Please provide more vehicle details."),
  symptoms: z.string().min(10, "Please describe the symptoms in more detail."),
});

const maintenanceSchema = z.object({
  make: z.string().min(2, "Please enter a valid make."),
  model: z.string().min(1, "Please enter a valid model."),
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
      return { status: "error", message: "AI could not generate a diagnosis. Please try being more specific." };
    }
    return { status: "success", message: "Analysis complete.", data: result };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "An unexpected error occurred. Please try again." };
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
      return { status: "error", message: "AI could not generate a schedule. Please check the vehicle details." };
    }
    return { status: "success", message: "Schedule generated.", data: result };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "An unexpected error occurred. Please try again." };
  }
}
