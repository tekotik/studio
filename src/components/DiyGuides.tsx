import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { BookOpen } from 'lucide-react';

const guides = [
  {
    title: 'Как самостоятельно поменять масло',
    description: 'Пошаговое руководство по одной из самых важных задач по самостоятельному обслуживанию автомобиля.',
    source: 'Popular Mechanics',
  },
  {
    title: 'Замена воздушного фильтра',
    description: "Улучшите производительность и эффективность вашего двигателя с помощью этой простой замены.",
    source: 'Car and Driver',
  },
  {
    title: 'Как завести автомобиль от внешнего источника',
    description: 'Узнайте безопасный и правильный способ завести автомобиль с разряженным аккумулятором.',
    source: 'The Drive',
  },
  {
    title: 'Детейлинг вашего автомобиля как у профессионала',
    description: 'Советы и хитрости, чтобы ваш автомобиль выглядел как новый, внутри и снаружи.',
    source: 'Autoblog',
  },
];

export function DiyGuides() {
  return (
    <section className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8 font-headline text-primary">Полезные руководства</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <Card key={guide.title} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                 <BookOpen className="w-6 h-6 text-primary" />
                 <CardTitle className="text-xl">{guide.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{guide.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Источник: {guide.source}</p>
              <Button variant="outline" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">Читать далее</a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
