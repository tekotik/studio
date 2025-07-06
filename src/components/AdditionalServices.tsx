import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';

export function AdditionalServices() {
  return (
    <section className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8 font-headline text-primary">Дополнительные услуги</h2>
      <Card className="overflow-hidden bg-primary/5 dark:bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Профессиональный антикор: комплексная защита</CardTitle>
          <CardDescription>
            Сохраните кузов вашего автомобиля от ржавчины, вызванной дорожными реагентами и влажным климатом. Мы предлагаем полную обработку с использованием проверенных материалов для максимальной защиты.
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
                data-ai-hint="rust proofing"
              />
              <h3 className="font-semibold mb-1">Днище и колесные арки</h3>
              <p className="text-sm text-muted-foreground">Мощный барьер против абразивного износа и коррозии. Наносим прочные составы, защищающие металл от камней, песка и влаги.</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card/50">
               <Image
                src="https://placehold.co/400x300.png"
                alt="Обработка скрытых полостей"
                width={400}
                height={300}
                className="rounded-lg object-cover mb-4 shadow-md"
                data-ai-hint="car cavity"
              />
              <h3 className="font-semibold mb-1">Скрытые полости</h3>
              <p className="text-sm text-muted-foreground">Обрабатываем пороги, двери и лонжероны специальными проникающими составами, которые останавливают ржавчину изнутри.</p>
            </div>
             <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card/50">
               <Image
                src="https://placehold.co/400x300.png"
                alt="Сварные швы автомобиля"
                width={400}
                height={300}
                className="rounded-lg object-cover mb-4 shadow-md"
                data-ai-hint="car suspension"
              />
              <h3 className="font-semibold mb-1">Подвеска и сварные швы</h3>
              <p className="text-sm text-muted-foreground">Уделяем внимание каждому элементу, защищая сварные соединения и детали подвески от преждевременного разрушения.</p>
            </div>
          </div>
          <div className="text-center">
            <Button>Рассчитать стоимость и записаться</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
