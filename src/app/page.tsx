import { Header } from "@/components/Header";
import { MaintenanceAdvisorForm } from "@/components/MaintenanceAdvisorForm";
import { SymptomAnalysisForm } from "@/components/SymptomAnalysisForm";
import { DiyGuides } from "@/components/DiyGuides";
import { VisualAids } from "@/components/VisualAids";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Wrench } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-headline">
            POCHINI: Ваш умный автомеханик
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
            Мгновенная диагностика, графики ТО и полезные советы от ИИ. Просто опишите проблему или введите данные вашего автомобиля.
          </p>
        </section>
        
        <Tabs defaultValue="symptom-analysis" className="w-full max-w-4xl mx-auto mb-16">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-transparent border-b rounded-none">
            <TabsTrigger value="symptom-analysis" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Car className="mr-2" />
              Анализ симптомов
            </TabsTrigger>
            <TabsTrigger value="maintenance-advisor" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Wrench className="mr-2" />
              Советник по ТО
            </TabsTrigger>
          </TabsList>
          <TabsContent value="symptom-analysis" className="mt-6">
            <SymptomAnalysisForm />
          </TabsContent>
          <TabsContent value="maintenance-advisor" className="mt-6">
            <MaintenanceAdvisorForm />
          </TabsContent>
        </Tabs>

        <VisualAids />
        <DiyGuides />

      </main>
      <footer className="py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} POCHINI. Все права защищены.</p>
      </footer>
    </div>
  );
}
