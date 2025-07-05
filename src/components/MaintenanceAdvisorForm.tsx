'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { handleMaintenanceSchedule } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { MaintenanceScheduleOutput } from '@/ai/flows/maintenance-schedule';

const initialState = {
  status: 'idle' as const,
  message: '',
  data: undefined as MaintenanceScheduleOutput | undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? 'Генерация...' : 'Получить график'}
    </Button>
  );
}

export function MaintenanceAdvisorForm() {
  const [state, formAction] = useFormState(handleMaintenanceSchedule, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.status === 'error' && state.message) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: state.message,
      });
    }
  }, [state, toast]);

  const formattedSchedule = state.data?.schedule
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Советник</CardTitle>
        <CardDescription>Введите марку и модель для получения графика ТО.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Марка</Label>
              <Input id="make" name="make" placeholder="например, BMW" required list="makes-list" />
              <datalist id="makes-list">
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
            <span>Идет создание графика, пожалуйста, подождите...</span>
          </div>
         </div>
      )}

      {state.status === 'success' && formattedSchedule && (
        <div className="p-6 space-y-4">
          <Alert>
             <CheckCircle className="h-4 w-4" />
            <AlertTitle>График создан</AlertTitle>
            <AlertDescription>
              Ниже представлен рекомендуемый график технического обслуживания для вашего автомобиля.
            </AlertDescription>
          </Alert>
          <div className="space-y-2 rounded-md border p-4 bg-background/50 text-sm">
            {formattedSchedule.map((line, index) => {
              if (line.startsWith('### ')) {
                return <h3 key={index} className="font-bold text-lg text-primary mt-4 mb-2">{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                  return <h4 key={index} className="font-semibold text-md mt-3 mb-1">{line.replace(/\*\*/g, '')}</h4>;
              }
              if (line.startsWith('* ')) {
                  return <p key={index} className="flex items-start gap-2 pl-4"><span className="text-accent-foreground font-semibold">✓</span><span>{line.substring(2)}</span></p>;
              }
              return <p key={index} className="pl-4">{line}</p>;
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
