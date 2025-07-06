import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';

export function AdditionalServices() {
  return (
    <section className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8 font-headline text-primary">Дополнительные услуги</h2>
      <Card className="overflow-hidden bg-primary/5 dark:bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Антикоррозийная обработка</CardTitle>
          <CardDescription>
            Защитите кузов вашего автомобиля от ржавчины и коррозии с помощью наших профессиональных услуг. Мы используем современные материалы, которые обеспечивают долговечную защиту даже в самых суровых условиях.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card/50">
              <Image
                src="https://placehold.co/400x300.png"
                alt="Обработка днища автомобиля"
                width={400}
                height={300}
                className="rounded-lg object-cover mb-4 shadow-md"
                data-ai-hint="car underbody"
              />
              <h3 className="font-semibold mb-1">Обработка днища и арок</h3>
              <p className="text-sm text-muted-foreground">Нанесение защитного состава на самые уязвимые части автомобиля.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card/50">
               <Image
                src="https://placehold.co/400x300.png"
                alt="Обработка скрытых полостей"
                width={400}
                height={300}
                className="rounded-lg object-cover mb-4 shadow-md"
                data-ai-hint="car rust"
              />
              <h3 className="font-semibold mb-1">Защита скрытых полостей</h3>
              <p className="text-sm text-muted-foreground">Обработка порогов, дверей и лонжеронов для предотвращения внутренней коррозии.</p>
            </div>
             <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card/50">
               <Image
                src="https://placehold.co/400x300.png"
                alt="Автомобиль после обработки"
                width={400}
                height={300}
                className="rounded-lg object-cover mb-4 shadow-md"
                data-ai-hint="car detailing"
              />
              <h3 className="font-semibold mb-1">Долговечный результат</h3>
              <p className="text-sm text-muted-foreground">Гарантия защиты от коррозии на долгие годы.</p>
            </div>
          </div>
          <div className="text-center">
            <Button>Узнать стоимость обработки</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
