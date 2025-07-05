import { Header } from "@/components/Header";
import { MaintenanceAdvisorForm } from "@/components/MaintenanceAdvisorForm";
import { SymptomAnalysisForm } from "@/components/SymptomAnalysisForm";
import { DiyGuides } from "@/components/DiyGuides";
import { VisualAids } from "@/components/VisualAids";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Wrench } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <section className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-headline">
            Ваш личный онлайн автомеханик
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Получите мгновенную диагностику автомобиля и графики технического обслуживания. Просто опишите проблему или введите модель вашего автомобиля.
          </p>
        </section>
        
        <Tabs defaultValue="symptom-analysis" className="w-full max-w-4xl mx-auto mb-16">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="symptom-analysis">
              <Car className="mr-2" />
              Анализ симптомов
            </TabsTrigger>
            <TabsTrigger value="maintenance-advisor">
              <Wrench className="mr-2" />
              Советник
            </TabsTrigger>
          </TabsList>
          <TabsContent value="symptom-analysis">
            <SymptomAnalysisForm />
          </TabsContent>
          <TabsContent value="maintenance-advisor">
            <MaintenanceAdvisorForm />
          </TabsContent>
        </Tabs>

        <VisualAids />
        <DiyGuides />

      </main>
      <footer className="py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AI Доктор. Все права защищены.</p>
      </footer>
    </div>
  );
}
