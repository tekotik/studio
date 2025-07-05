import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Droplets, Battery, Gauge, ShieldCheck } from 'lucide-react';

const aids = [
  {
    title: 'Проверка моторного масла',
    icon: Droplets,
  },
  {
    title: 'Клеммы аккумулятора',
    icon: Battery,
  },
  {
    title: 'Давление и протектор шин',
    icon: Gauge,
  },
  {
    title: 'Бачок тормозной жидкости',
    icon: ShieldCheck,
  },
];

export function VisualAids() {
  return (
    <section className="my-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 font-headline text-primary">Руководства по визуальному осмотру</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {aids.map((aid) => (
          <Card key={aid.title} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-center h-full">
              <div className="bg-primary/10 p-4 rounded-full">
                <aid.icon className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-lg font-medium">{aid.title}</CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
