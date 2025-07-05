import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const aids = [
  {
    title: 'Проверка моторного масла',
    image: 'https://placehold.co/600x400.png',
    hint: 'engine oil'
  },
  {
    title: 'Клеммы аккумулятора',
    image: 'https://placehold.co/600x400.png',
    hint: 'car battery'
  },
  {
    title: 'Давление и протектор шин',
    image: 'https://placehold.co/600x400.png',
    hint: 'car tire'
  },
  {
    title: 'Бачок тормозной жидкости',
    image: 'https://placehold.co/600x400.png',
    hint: 'brake fluid'
  },
];

export function VisualAids() {
  return (
    <section className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8 font-headline text-primary">Руководства по визуальному осмотру</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {aids.map((aid) => (
          <Card key={aid.title} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="p-0">
               <Image
                src={aid.image}
                alt={aid.title}
                width={600}
                height={400}
                className="w-full h-40 object-cover"
                data-ai-hint={aid.hint}
              />
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg">{aid.title}</CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
