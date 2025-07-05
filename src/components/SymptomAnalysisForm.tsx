'use client';

import { useEffect } from 'react';
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
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? 'Analyzing...' : 'Analyze Symptoms'}
    </Button>
  );
}

export function SymptomAnalysisForm() {
  const [state, formAction] = useFormState(handleSymptomAnalysis, initialState);
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


  return (
    <Card>
      <CardHeader>
        <CardTitle>Symptom Checker</CardTitle>
        <CardDescription>Describe your car's issues, and our AI will suggest potential diagnoses.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleDetails">Vehicle Details</Label>
            <Input id="vehicleDetails" name="vehicleDetails" placeholder="e.g., 2018 Toyota Camry" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms</Label>
            <Textarea
              id="symptoms"
              name="symptoms"
              placeholder="e.g., Loud squealing noise when braking, car pulls to the left."
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
            <span>Analyzing symptoms, please wait...</span>
          </div>
         </div>
      )}

      {state.status === 'success' && state.data && (
        <div className="p-6 space-y-6">
           <Alert>
             <CheckCircle className="h-4 w-4" />
            <AlertTitle>Analysis Complete</AlertTitle>
            <AlertDescription>
              Here are the potential issues based on the symptoms you provided.
            </AlertDescription>
          </Alert>

          {state.data.diagnoses.map((d, index) => (
            <Card key={index} className="bg-background">
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
                    <h4 className="font-semibold">Likely Causes</h4>
                    <p className="text-muted-foreground">{d.likelyCauses}</p>
                   </div>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
