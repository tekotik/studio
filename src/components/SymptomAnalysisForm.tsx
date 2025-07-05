'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { handleSymptomAnalysis } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Wrench, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { SymptomAnalysisOutput } from '@/ai/flows/symptom-analysis';

const initialState = {
  status: 'idle' as const,
  message: '',
  data: undefined as SymptomAnalysisOutput | undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Анализ...' : 'Анализировать симптомы'}
    </Button>
  );
}

export function SymptomAnalysisForm() {
  const [state, formAction] = useFormState(handleSymptomAnalysis, initialState);
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === 'error' && state.message) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: state.message,
      });
    }
    if (state.status === 'success') {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state, toast]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Диагностика по симптомам</CardTitle>
        <CardDescription>Опишите симптомы вашего авто, и наш ИИ поставит вероятный диагноз.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Марка</Label>
              <Input id="make" name="make" placeholder="например, BMW" required list="makes-list-symptoms" />
              <datalist id="makes-list-symptoms">
                <option value="BMW" />
                <option value="Mercedes-Benz" />
                <option value="Audi" />
                <option value="Toyota" />
                <option value="Honda" />
                <option value="Volkswagen" />
                <option value="Lada" />
                <option value="Kia" />
                <option value="Hyundai" />
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Модель</Label>
              <Input id="model" name="model" placeholder="например, X5" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Год</Label>
              <Input id="year" name="year" type="number" placeholder="например, 2018" required min="1900" max={new Date().getFullYear() + 1} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="symptoms">Симптомы</Label>
            <Textarea
              id="symptoms"
              name="symptoms"
              placeholder="например, Громкий визг при торможении, машину уводит влево."
              required
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>

      {state.status === 'loading' && (
         <div className="p-6">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
            <span>Анализируем симптомы, пожалуйста, подождите...</span>
          </div>
         </div>
      )}

      {state.status === 'success' && state.data && (
        <div ref={resultsRef} className="p-6 mt-6 space-y-6 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg">
           <Alert>
             <CheckCircle className="h-4 w-4" />
            <AlertTitle>Анализ завершен!</AlertTitle>
            <AlertDescription>
              Вот возможные проблемы, основанные на предоставленных вами симптомах.
            </AlertDescription>
          </Alert>

          {state.data.diagnoses.map((d, index) => (
            <Card key={index} className="bg-background/80 dark:bg-background/50">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <span className="bg-primary/10 p-2 rounded-full">
                    <Wrench className="w-6 h-6 text-primary" />
                  </span>
                  <div>
                    <CardTitle className="text-xl">{d.diagnosis}</CardTitle>
                  </div>
              </CardHeader>
              <CardContent>
                 <div className="flex items-start gap-3 mt-4">
                   <Lightbulb className="w-5 h-5 mt-1 text-yellow-500 flex-shrink-0" />
                   <div>
                    <h4 className="font-semibold">Вероятные причины</h4>
                    <p className="text-muted-foreground">{d.likelyCauses}</p>
                   </div>
                 </div>
              </CardContent>
            </Card>
          ))}
          <div className="text-center mt-8 pt-6 border-t">
            <p className="mb-4 text-muted-foreground">Не уверены, что делать дальше? Получите оценку стоимости ремонта у проверенных специалистов.</p>
            <Button>
              Отправить запрос на просчет ремонта
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
