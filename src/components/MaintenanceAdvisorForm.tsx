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
      {pending ? 'Generating...' : 'Get Schedule'}
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
        title: "Error",
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
        <CardTitle>Maintenance Advisor</CardTitle>
        <CardDescription>Enter your vehicle's make and model for a personalized maintenance schedule.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input id="make" name="make" placeholder="e.g., Honda" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" name="model" placeholder="e.g., Civic" required />
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
            <span>Generating schedule, please wait...</span>
          </div>
         </div>
      )}

      {state.status === 'success' && formattedSchedule && (
        <div className="p-6 space-y-4">
          <Alert>
             <CheckCircle className="h-4 w-4" />
            <AlertTitle>Schedule Generated</AlertTitle>
            <AlertDescription>
              Below is the recommended maintenance schedule for your vehicle.
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
